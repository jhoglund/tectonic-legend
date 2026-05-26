/**
 * extract-screen.js — Figma export, step 1 of 2 (the browser half).
 *
 * Walks the *rendered* DOM of the currently-displayed app screen and emits a
 * serializable spec (geometry + sRGB colors + box-shadows + inline SVGs) that
 * `build-in-figma.js` turns into native Figma nodes. See ./README.md.
 *
 * Why DOM-driven: a faithful Figma translation needs the *exact* rendered
 * geometry and resolved colors, not a description. The app draws cage / grid
 * lines as inset box-shadows (not CSS borders), so we parse box-shadow and the
 * builder maps it to Figma inner-shadow effects — that reproduces the board
 * grid generically, no per-screen special-casing.
 *
 * Run it in the page (dev console, or Chrome MCP `javascript_tool`). The file
 * is a single expression: evaluating it returns the spec AND leaves
 * `window.__extractScreen(opts)` for re-use with a custom root/name.
 *
 *   opts.root  CSS selector for the screen root (default: #root, else body)
 *   opts.name  name for the generated Figma frame (default: document.title)
 */
(() => {
  const extractScreen = (opts = {}) => {
    const root = opts.root
      ? document.querySelector(opts.root)
      : document.querySelector('#root') || document.body;
    if (!root) throw new Error('extract-screen: root not found');

    const rootRect = root.getBoundingClientRect();
    // Collect in raw viewport coordinates; we crop to the content bounds at the
    // end so the frame is tight around the app (the root often spans the whole
    // viewport with the real UI centered in a narrow column).
    const rel = (r) => [r.left, r.top, r.width, r.height].map((n) => Math.round(n * 10) / 10);

    // Resolve any CSS color (incl. oklch/var) to sRGB via a 1x1 canvas raster.
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 1;
    const cx = cvs.getContext('2d', { willReadFrequently: true });
    const toRGBA = (color) => {
      if (!color || color === 'transparent' || color === 'none') return [0, 0, 0, 0];
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = '#000';
      cx.fillStyle = color;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], Math.round((d[3] / 255) * 1000) / 1000];
    };

    // Computed box-shadow -> [{inset, color, ox, oy, blur, spread}]
    const parseShadows = (str) => {
      if (!str || str === 'none') return [];
      const parts = str.match(/(?:rgba?\([^)]*\)|[^,])+/g) || [];
      return parts
        .map((raw) => {
          let p = raw.trim();
          const inset = /\binset\b/.test(p);
          p = p.replace(/\binset\b/, '').trim();
          const cm = p.match(/rgba?\([^)]*\)|#[0-9a-fA-F]+/);
          let color = [0, 0, 0, 1];
          if (cm) { color = toRGBA(cm[0]); p = p.replace(cm[0], '').trim(); }
          const nums = (p.match(/-?[\d.]+px/g) || []).map(parseFloat);
          const [ox = 0, oy = 0, blur = 0, spread = 0] = nums;
          return { inset, color, ox, oy, blur, spread };
        })
        .filter((s) => s.color[3] > 0);
    };

    const hidden = (cs) => cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0;
    const nodes = [];

    // 1) Paintable elements (backgrounds, borders, shadows) + inline SVGs, in
    //    document order == paint order (ancestors first, so children layer on top).
    (function dfs(el) {
      const cs = getComputedStyle(el);
      if (hidden(cs)) return;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) return;
      const tag = el.tagName.toLowerCase();

      if (tag === 'svg') {
        const clone = el.cloneNode(true);
        clone.setAttribute('width', Math.round(r.width));
        clone.setAttribute('height', Math.round(r.height));
        [clone, ...clone.querySelectorAll('*')].forEach((n) => {
          ['stroke', 'fill'].forEach((a) => {
            if (n.getAttribute && n.getAttribute(a) === 'currentColor') n.setAttribute(a, cs.color);
          });
        });
        nodes.push({ t: 'svg', rect: rel(r), svg: clone.outerHTML, opacity: +cs.opacity });
        return; // don't descend into the SVG
      }

      const bg = toRGBA(cs.backgroundColor);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const bc = toRGBA(cs.borderTopColor);
      const shadows = parseShadows(cs.boxShadow);
      const hasBg = bg[3] > 0;
      const hasBorder = bw > 0 && bc[3] > 0;
      if (hasBg || hasBorder || shadows.length) {
        nodes.push({
          t: 'rect',
          rect: rel(r),
          fill: hasBg ? bg : null,
          stroke: hasBorder ? bc : null,
          strokeWidth: bw,
          radius: [
            cs.borderTopLeftRadius, cs.borderTopRightRadius,
            cs.borderBottomRightRadius, cs.borderBottomLeftRadius,
          ].map((v) => parseFloat(v) || 0),
          shadows,
          opacity: +cs.opacity,
        });
      }
      for (const child of el.children) dfs(child);
    })(root);

    // 2) Text — placed at each text node's measured glyph box (so CSS centering /
    //    flex layout is already baked into the position; we just left-align there).
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    let tn;
    while ((tn = tw.nextNode())) {
      const parent = tn.parentElement;
      if (!parent || hidden(getComputedStyle(parent))) continue;
      const pcs = getComputedStyle(parent);
      const range = document.createRange();
      range.selectNodeContents(tn);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      let l = Infinity, t = Infinity, rr = -Infinity, b = -Infinity;
      for (const rc of rects) { l = Math.min(l, rc.left); t = Math.min(t, rc.top); rr = Math.max(rr, rc.right); b = Math.max(b, rc.bottom); }
      nodes.push({
        t: 'text',
        rect: [l - OX, t - OY, rr - l, b - t].map((n) => Math.round(n * 10) / 10),
        str: tn.nodeValue.trim(),
        color: toRGBA(pcs.color),
        fontSize: Math.round(parseFloat(pcs.fontSize)),
        weight: parseInt(pcs.fontWeight) || 400,
        family: pcs.fontFamily.split(',')[0].replace(/['"]/g, ''),
      });
    }

    // Crop to content bounds. Full-bleed background fills (rects covering most
    // of the viewport) are the page/root background — drop them (the frame's own
    // fill stands in) and exclude them from the bounds so the frame hugs the UI.
    const vw = window.innerWidth, vh = window.innerHeight;
    const fullBleed = (n) => n.t === 'rect' && !n.stroke && !(n.shadows && n.shadows.length) && n.rect[2] >= vw * 0.95 && n.rect[3] >= vh * 0.9;
    const kept = nodes.filter((n) => !fullBleed(n));
    const fg = kept.filter((n) => n.t === 'text' || n.t === 'svg' || !(n.rect[2] >= vw * 0.95));
    const bounds = (fg.length ? fg : kept).reduce(
      (a, n) => {
        const [x, y, w, h] = n.rect;
        return [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x + w), Math.max(a[3], y + h)];
      },
      [Infinity, Infinity, -Infinity, -Infinity],
    );
    const PAD = 0;
    const cx0 = Math.floor(bounds[0] - PAD), cy0 = Math.floor(bounds[1] - PAD);
    for (const n of kept) { n.rect = [Math.round((n.rect[0] - cx0) * 10) / 10, Math.round((n.rect[1] - cy0) * 10) / 10, n.rect[2], n.rect[3]]; }

    return {
      meta: {
        name: opts.name || `${document.title} — screen`,
        width: Math.round(bounds[2] - bounds[0] + PAD * 2),
        height: Math.round(bounds[3] - bounds[1] + PAD * 2),
      },
      page: { bg: toRGBA(getComputedStyle(document.body).backgroundColor) },
      nodes: kept,
    };
  };

  if (typeof window !== 'undefined') window.__extractScreen = extractScreen;
  return extractScreen({});
})();
