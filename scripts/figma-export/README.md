# Figma export — DOM-exact, native rebuild

Export a live app screen into **native, editable Figma objects** (frames,
rectangles, ellipses, text, vector icons) that actually match what the app
renders — not a flattened PNG, and not a loose AI re-draw.

The fidelity comes from driving Figma off the **exact rendered geometry**: we
read every element's box, resolved sRGB color, border, box-shadow and text out
of the DOM, then rebuild it node-for-node via the Figma Plugin API.

## Pieces

| File | Runs in | Does |
|------|---------|------|
| [`extract-screen.js`](extract-screen.js) | the browser (app page) | Walks the rendered DOM → a serializable **spec** (geometry + sRGB colors + box-shadows + inline SVGs), cropped to the content bounds. |
| [`build-in-figma.js`](build-in-figma.js) | the Figma `use_figma` MCP tool | Interprets the spec into native Figma nodes. |
| [`spec-receiver.mjs`](spec-receiver.mjs) | Node, on localhost | Bridges the two — receives the spec from the browser and writes it to disk so it can be embedded into `use_figma`. |

### How the board grid survives the generic walker

The app draws cage / inner grid lines as **inset `box-shadow`s**, not CSS
borders. The extractor parses `box-shadow`; the builder maps each shadow to a
Figma **inner-shadow effect**. So the board's grid reproduces faithfully with
no board-specific code.

## Workflow

> Driven from a Claude session: Chrome MCP runs the extractor, the Figma MCP
> (`use_figma`) runs the builder. They don't share memory, hence the receiver.

1. **Run the app** and navigate to the screen you want.
   - For **mobile fidelity, size the browser to ~430px wide first.** The layout
     is responsive — at desktop width the app shows desktop chrome (e.g. the
     bottom tab bar) that the mobile screen hides.

2. **Extract** — paste the contents of `extract-screen.js` into the page (dev
   console, or Chrome MCP `javascript_tool`). It returns the spec and leaves
   `window.__extractScreen(opts)` for re-use. Stash the JSON:
   `window.__j = JSON.stringify(window.__extractScreen({ name: 'My screen' }))`.

3. **Transfer to disk** — `use_figma` has **no `fetch`**, and MCP tool results
   are truncated (~1 KB), so the spec can't be returned through the browser
   tool. Start the receiver and POST the spec to it:
   ```bash
   node scripts/figma-export/spec-receiver.mjs   # listens on 127.0.0.1:7599
   ```
   ```js
   // in the page (https→http://127.0.0.1 is allowed for localhost):
   fetch('http://127.0.0.1:7599', { method: 'POST', body: window.__j }).then(r => r.text())
   ```
   The spec lands at `/tmp/figma-spec.json`.

4. **Create a target file** with the Figma MCP `create_new_file`.
   - Use a **writable team**. As of 2026-05, the `Lägenhet` team key
     (`team::1515600221240223570`) accepts writes; `Jonas Höglund's team`
     rejects them with `Invalid planKey`.

5. **Build** — assemble the `use_figma` `code` as
   `const spec = <spec JSON>;` + the body of `buildScreen` + `await buildScreen(figma, spec);`
   and run it against the new file's key. (Embedding the spec is required —
   see the no-`fetch` note above.)

6. **Verify** — screenshot via the Figma MCP `get_screenshot` (node id from
   `get_metadata`). Mind the **Figma Starter-plan MCP rate limit**; a few
   `get_screenshot`/`get_metadata` calls can exhaust it.

## Limitations / approximations

- **box-shadow → effects** is a close mapping, not exact (blend modes, multiple
  layered shadows, spread on rounded corners may differ slightly).
- **Text** is placed at each text node's measured glyph box and rebuilt in
  **Inter** (weight-mapped). Non-Inter fonts and multi-line wrapping are
  approximate; expect small vertical offsets.
- **No image fills** — `<img>`/CSS background-images aren't captured (the app's
  icons are inline SVG, which *are* captured as vectors).
- **Outer rounded frames** that rely on `overflow: hidden` clipping aren't
  reproduced as clips; corners may read slightly square.
- **`use_figma` code cap (~50 KB).** A whole complex screen's spec usually fits
  (the solving screen is ~14 KB minified); for larger screens, split the build
  across multiple `use_figma` calls that append to the same frame.
- Output is a **static snapshot** of whatever state was on screen at extract time.
