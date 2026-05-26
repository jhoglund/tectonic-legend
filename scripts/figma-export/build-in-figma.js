/**
 * build-in-figma.js — Figma export, step 2 of 2 (the Figma half).
 *
 * Interprets a spec produced by `extract-screen.js` into native Figma nodes.
 * It runs inside the Figma `use_figma` MCP tool, which provides the `figma`
 * Plugin-API global and supports top-level `await`. See ./README.md.
 *
 * To run: send the body of `buildScreen` to `use_figma` together with the spec,
 * e.g. the `code` argument is:
 *
 *     const spec = <PASTE SPEC JSON>;
 *     <contents of buildScreen, inlined>
 *     await buildScreen(figma, spec);
 *
 * Everything it creates is editable: rectangles/ellipses (fills, strokes,
 * per-corner radius, inner/drop shadows), text (Inter, weight-mapped), and
 * vector icons via createNodeFromSvg.
 */
async function buildScreen(figma, spec) {
  const styleFor = (w) => (w >= 700 ? 'Bold' : w >= 600 ? 'Semi Bold' : w >= 500 ? 'Medium' : 'Regular');
  for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) {
    await figma.loadFontAsync({ family: 'Inter', style: s });
  }

  const C = (a) => ({ r: a[0] / 255, g: a[1] / 255, b: a[2] / 255 });
  const solid = (a) => [{ type: 'SOLID', color: C(a), opacity: a[3] == null ? 1 : a[3] }];
  const effects = (shadows) =>
    shadows.map((s) => ({
      type: s.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
      color: { r: s.color[0] / 255, g: s.color[1] / 255, b: s.color[2] / 255, a: s.color[3] == null ? 1 : s.color[3] },
      offset: { x: s.ox, y: s.oy },
      radius: s.blur,
      spread: s.spread,
      visible: true,
      blendMode: 'NORMAL',
    }));

  const page = figma.currentPage;
  const screen = figma.createFrame();
  page.appendChild(screen);
  screen.name = spec.meta.name;
  screen.resize(spec.meta.width, spec.meta.height);
  screen.x = 0;
  screen.y = 0;
  screen.clipsContent = true;
  screen.fills = spec.page.bg[3] > 0 ? solid(spec.page.bg) : [];

  for (const n of spec.nodes) {
    const [x, y, w, h] = n.rect;
    if (w <= 0 || h <= 0) continue;

    if (n.t === 'rect') {
      const maxR = n.radius ? Math.max(...n.radius) : 0;
      const fullyRound = maxR >= Math.min(w, h) / 2 - 0.5;
      let node;
      if (fullyRound && Math.abs(w - h) < 2) {
        node = figma.createEllipse();
        node.resize(w, h);
      } else {
        node = figma.createRectangle();
        node.resize(w, h);
        if (n.radius) {
          node.topLeftRadius = n.radius[0];
          node.topRightRadius = n.radius[1];
          node.bottomRightRadius = n.radius[2];
          node.bottomLeftRadius = n.radius[3];
        }
      }
      screen.appendChild(node);
      node.x = x;
      node.y = y;
      node.fills = n.fill ? solid(n.fill) : [];
      if (n.stroke) {
        node.strokes = solid(n.stroke);
        node.strokeWeight = n.strokeWidth || 1;
        node.strokeAlign = 'INSIDE';
      }
      if (n.shadows && n.shadows.length) node.effects = effects(n.shadows);
      if (n.opacity != null && n.opacity < 1) node.opacity = n.opacity;
    } else if (n.t === 'text') {
      const t = figma.createText();
      screen.appendChild(t);
      t.fontName = { family: 'Inter', style: styleFor(n.weight) };
      t.fontSize = n.fontSize || 14;
      t.characters = n.str;
      t.fills = solid(n.color);
      t.textAutoResize = 'NONE';
      t.resize(Math.max(w, 1), Math.max(h, 1));
      t.textAlignHorizontal = 'LEFT';
      t.textAlignVertical = 'TOP';
      t.x = x;
      t.y = y;
    } else if (n.t === 'svg') {
      const node = figma.createNodeFromSvg(n.svg);
      screen.appendChild(node);
      node.x = x;
      node.y = y;
      if (n.opacity != null && n.opacity < 1) node.opacity = n.opacity;
    }
  }

  figma.viewport.scrollAndZoomIntoView([screen]);
  figma.currentPage.selection = [screen];
  return screen.id;
}

// Exported for documentation/tests; the live path inlines this into use_figma.
if (typeof module !== 'undefined') module.exports = { buildScreen };
