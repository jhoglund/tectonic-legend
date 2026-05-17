/**
 * Generator for the 2026-05-17 Solving-screen shape exploration.
 *
 * Emits a single token-faithful page (`index.html`) stacking all 10
 * variants of the Solving screen, each rendered at both a 5x5 and an
 * 8x8 grid. Kept in the session folder for provenance — re-run with:
 *   node prototypes/2026-05-17-solving-shapes/build.mjs
 *
 * The boards are illustrative, not solvable puzzles: this round is
 * about grid size, corner radius, button/key shape & size, the
 * keypad-first layout, and full-width board treatments — not puzzle
 * correctness.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));

/* --- design tokens, mirrored from src/index.css ------------------- */
const TOKENS = `
:root{
  --brand-50:#ecfeff; --brand-100:#cffafe; --brand-500:#06b6d4;
  --brand-600:#0891b2; --brand-700:#0e7490;
  --surface:#fafafa; --surface-elevated:#ffffff; --surface-board:#ffffff;
  --surface-cell:#ffffff; --surface-cell-clue:#f5f5f5;
  --surface-cell-selected:#e0f7fa; --border:#e5e5e5;
  --text-primary:#0a0a0a; --text-secondary:#525252; --text-tertiary:#a3a3a3;
  --text-on-brand:#ffffff;
  --success:#10b981; --warning:#f59e0b; --danger:#dc2626; --info:#3b82f6;
  --cage-1:oklch(96.5% 0.074 88); --cage-2:oklch(92% 0.036 0);
  --cage-3:oklch(88% 0.038 256); --cage-4:oklch(88.5% 0.048 180);
  --cage-5:oklch(96.5% 0.006 83);
  --border-cage:oklch(54% 0 0); --border-cage-width:2px; --border-inner-width:1px;
  --border-inner-target-l:0.66; --border-inner-blend:0.40;
  --cage-1-inner:oklch(from var(--cage-1) calc(l + (var(--border-inner-target-l) - l) * var(--border-inner-blend)) c h);
  --cage-2-inner:oklch(from var(--cage-2) calc(l + (var(--border-inner-target-l) - l) * var(--border-inner-blend)) c h);
  --cage-3-inner:oklch(from var(--cage-3) calc(l + (var(--border-inner-target-l) - l) * var(--border-inner-blend)) c h);
  --cage-4-inner:oklch(from var(--cage-4) calc(l + (var(--border-inner-target-l) - l) * var(--border-inner-blend)) c h);
  --cage-5-inner:oklch(from var(--cage-5) calc(l + (var(--border-inner-target-l) - l) * var(--border-inner-blend)) c h);
  --cage-1-player:oklch(from var(--cage-1) 0.42 calc(c * 2) h);
  --cage-2-player:oklch(from var(--cage-2) 0.42 calc(c * 2) h);
  --cage-3-player:oklch(from var(--cage-3) 0.42 calc(c * 2) h);
  --cage-4-player:oklch(from var(--cage-4) 0.42 calc(c * 2) h);
  --cage-5-player:oklch(from var(--cage-5) 0.42 calc(c * 2) h);
  --cell-text:oklch(4% 0 0);
  --font-ui:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',monospace;
  --shadow-modal:0 12px 40px rgba(0,0,0,0.18);
}
@media (prefers-color-scheme:dark){
  :root{
    --brand-50:#0e2a30; --brand-100:#155057; --brand-500:#22d3ee;
    --brand-600:#06b6d4; --brand-700:#0e7490;
    --surface:#0a0a0a; --surface-elevated:#171717; --surface-board:#0f1419;
    --surface-cell:#1a1f24; --surface-cell-clue:#262626;
    --surface-cell-selected:#164e5b; --border:#2a2a2a;
    --text-primary:#fafafa; --text-secondary:#a3a3a3; --text-tertiary:#737373;
    --text-on-brand:#0a0a0a;
    --success:#34d399; --warning:#fbbf24; --danger:#f87171; --info:#60a5fa;
    --cage-1:oklch(36.5% 0.052 88); --cage-2:oklch(32% 0.025 0);
    --cage-3:oklch(28% 0.027 256); --cage-4:oklch(28.5% 0.034 180);
    --cage-5:oklch(36.5% 0.004 83); --cell-text:oklch(96% 0 0);
    --cage-1-player:oklch(from var(--cage-1) 0.85 calc(c * 2) h);
    --cage-2-player:oklch(from var(--cage-2) 0.85 calc(c * 2) h);
    --cage-3-player:oklch(from var(--cage-3) 0.85 calc(c * 2) h);
    --cage-4-player:oklch(from var(--cage-4) 0.85 calc(c * 2) h);
    --cage-5-player:oklch(from var(--cage-5) 0.85 calc(c * 2) h);
  }
}
.cage-1{--cell-fill:var(--cage-1);--cell-inner:var(--cage-1-inner);--cell-player:var(--cage-1-player);}
.cage-2{--cell-fill:var(--cage-2);--cell-inner:var(--cage-2-inner);--cell-player:var(--cage-2-player);}
.cage-3{--cell-fill:var(--cage-3);--cell-inner:var(--cage-3-inner);--cell-player:var(--cage-3-player);}
.cage-4{--cell-fill:var(--cage-4);--cell-inner:var(--cage-4-inner);--cell-player:var(--cage-4-player);}
.cage-5{--cell-fill:var(--cage-5);--cell-inner:var(--cage-5-inner);--cell-player:var(--cage-5-player);}
`;

const PAGE_CSS = `
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:var(--font-ui);background:var(--surface);color:var(--text-primary);}
.page-head{max-width:880px;margin:0 auto;padding:40px 24px 8px;}
.page-head h1{font-size:26px;font-weight:700;letter-spacing:-0.01em;}
.page-head p{color:var(--text-secondary);font-size:14px;margin-top:10px;line-height:1.6;}
.toc{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;
  padding:12px 24px;background:color-mix(in srgb,var(--surface) 88%,transparent);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--border);}
.toc a{font-family:var(--font-mono);font-size:12px;font-weight:500;text-decoration:none;
  color:var(--text-secondary);border:1px solid var(--border);border-radius:999px;
  padding:4px 10px;background:var(--surface-elevated);}
.toc a:hover{color:var(--brand-600);border-color:var(--brand-600);}
section{scroll-margin-top:60px;padding:44px 24px;border-bottom:1px solid var(--border);}
section:nth-child(even){background:color-mix(in srgb,var(--surface) 96%,var(--text-primary));}
.section-head{max-width:880px;margin:0 auto 26px;}
.section-head h2{font-size:21px;font-weight:700;letter-spacing:-0.01em;}
.section-head .desc{color:var(--text-secondary);font-size:14px;margin-top:8px;line-height:1.55;max-width:720px;}
.section-head .spec{font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);margin-top:10px;}
.stage{display:flex;gap:32px;justify-content:center;flex-wrap:wrap;}
figure{margin:0;}
figcaption{text-align:center;font-size:11px;font-weight:600;letter-spacing:0.08em;
  color:var(--text-tertiary);margin-bottom:10px;text-transform:uppercase;}
.phone{width:388px;min-height:792px;background:var(--surface);border:1px solid var(--border);
  border-radius:30px;box-shadow:var(--shadow-modal);overflow:hidden;display:flex;flex-direction:column;}
.navbar{display:flex;align-items:center;justify-content:space-between;padding:14px 10px 4px;}
.navbtn{width:40px;height:40px;display:grid;place-items:center;color:var(--brand-600);}
.navtitle{font-size:16px;font-weight:600;color:var(--text-primary);}
.screen-body{display:flex;flex-direction:column;align-items:center;gap:var(--proto-gap);padding:8px 16px 30px;}
.statusrow{font-family:var(--font-mono);font-size:13px;color:var(--text-tertiary);font-variant-numeric:tabular-nums;}
.board-wrap{display:flex;justify-content:center;width:var(--proto-board-w,100%);}
[data-board]{display:contents;}
.proto-board{display:inline-grid;border:var(--border-cage-width) solid var(--border-cage);
  border-radius:var(--proto-rboard);overflow:hidden;background:var(--surface-board);}
.proto-board.fill{width:100%;}
.proto-cell{width:var(--bcell);height:var(--bcell);display:flex;align-items:center;
  justify-content:center;background:var(--cell-fill);position:relative;}
.proto-board.fill .proto-cell{width:auto;height:auto;aspect-ratio:1;}
.proto-cell.sel{background:var(--surface-cell-selected);box-shadow:inset 0 0 0 2px var(--brand-600);}
.proto-cell span{font-size:calc(var(--bcell) * 0.42);line-height:1;}
.proto-cell .v-clue{font-weight:700;color:var(--cell-text);}
.proto-cell .v-player{font-weight:500;color:var(--cell-player);}
.hintcard{width:100%;background:var(--surface-elevated);border:1px solid var(--border);
  border-radius:var(--proto-rcard);padding:12px;}
.chip{display:inline-block;font-size:12px;font-weight:600;color:var(--text-on-brand);
  background:var(--brand-600);border-radius:999px;padding:2px 10px;}
.hintcard p{margin-top:8px;font-size:13px;color:var(--text-secondary);line-height:1.5;}
.toolbar{display:flex;gap:8px;width:100%;}
.tool{flex:1;padding:var(--proto-btnh) 0;font-size:13px;font-weight:500;font-family:var(--font-ui);
  border-radius:var(--proto-rbtn);border:1px solid var(--border);background:var(--surface-elevated);
  color:var(--text-primary);cursor:pointer;}
.tool.active{background:var(--brand-100);border-color:var(--brand-100);color:var(--brand-600);}
.keypad{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;width:100%;}
.key{width:var(--proto-key);height:var(--proto-key);border-radius:var(--proto-rkey);
  background:var(--surface-elevated);border:1px solid var(--border);color:var(--text-primary);
  font-family:var(--font-mono);font-size:1.15rem;font-weight:500;font-variant-numeric:tabular-nums;
  cursor:pointer;display:grid;place-items:center;}
.key-undo{color:var(--text-secondary);}
.framecard{width:100%;background:var(--surface-elevated);border:1px solid var(--border);
  border-radius:var(--proto-rcard);padding:14px;display:flex;flex-direction:column;
  align-items:center;gap:0;}
`;

/* --- the board renderer, embedded verbatim into the page ---------- */
const RENDERER = `
function protoEdge(kind){
  return kind==='cage'
    ? 'var(--border-cage-width) solid var(--border-cage)'
    : 'var(--border-inner-width) solid var(--cell-inner)';
}
function renderBoard(rowsArr, sel, fill){
  var grid=rowsArr.map(function(s){return s.split('');});
  var rows=grid.length, cols=grid[0].length, r, c, d;
  var cageCells={};
  for(r=0;r<rows;r++){for(c=0;c<cols;c++){
    var g=grid[r][c]; (cageCells[g]=cageCells[g]||[]).push([r,c]);
  }}
  var adj={}, id;
  for(id in cageCells) adj[id]={};
  var dirs=[[0,1],[1,0],[0,-1],[-1,0]];
  for(r=0;r<rows;r++){for(c=0;c<cols;c++){
    var g2=grid[r][c];
    for(d=0;d<4;d++){
      var nr=r+dirs[d][0], nc=c+dirs[d][1];
      if(nr>=0&&nr<rows&&nc>=0&&nc<cols){
        var ng=grid[nr][nc];
        if(ng!==g2) adj[g2][ng]=true;
      }
    }
  }}
  var ids=Object.keys(cageCells).sort(), i, n;
  var color={};
  for(i=0;i<ids.length;i++){
    id=ids[i]; var used={};
    for(n in adj[id]){ if(color[n]!=null) used[color[n]]=true; }
    var k=0; while(used[k]) k++;
    color[id]=k;
  }
  var idxInCage={};
  for(i=0;i<ids.length;i++){
    cageCells[ids[i]].forEach(function(rc,j){ idxInCage[rc[0]+'_'+rc[1]]=j; });
  }
  var bd=document.createElement('div');
  bd.className=fill?'proto-board fill':'proto-board';
  bd.style.gridTemplateColumns='repeat('+cols+', '+(fill?'1fr':'var(--bcell)')+')';
  for(r=0;r<rows;r++){for(c=0;c<cols;c++){
    id=grid[r][c];
    var size=cageCells[id].length;
    var idx=idxInCage[r+'_'+c];
    var cell=document.createElement('div');
    cell.className='proto-cell cage-'+((color[id]%5)+1);
    var topEdge=r===0?'none':(grid[r-1][c]!==id?'cage':'inner');
    var leftEdge=c===0?'none':(grid[r][c-1]!==id?'cage':'inner');
    if(topEdge!=='none') cell.style.borderTop=protoEdge(topEdge);
    if(leftEdge!=='none') cell.style.borderLeft=protoEdge(leftEdge);
    var blank=((r*7 + c*5) % 10) < 3;
    var val=(idx % size)+1;
    if(sel && sel[0]===r && sel[1]===c) cell.classList.add('sel');
    if(!blank){
      var isClue=((r+c)%2)===0;
      var span=document.createElement('span');
      span.textContent=val;
      span.className=isClue?'v-clue':'v-player';
      cell.appendChild(span);
    }
    bd.appendChild(cell);
  }}
  return bd;
}
document.querySelectorAll('[data-board]').forEach(function(el){
  var key=el.dataset.board;
  var cages=key==='5'?CAGE5:CAGE8;
  var sel=key==='5'?[2,1]:[3,4];
  el.appendChild(renderBoard(cages, sel, el.dataset.fill==='1'));
});
`;

const CAGE5 = ['AABBB', 'AABCC', 'ADDCC', 'EDDFC', 'EEFFF'];
const CAGE8 = [
  'AABBCCCD', 'AABBCEDD', 'AFFGEEED', 'HFGGIEJD',
  'HFFGIJJK', 'HHLIIJKK', 'MLLLNNKO', 'MMLNNOOO',
];

/* --- screen fragments --------------------------------------------- */
const ICON_BACK =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
const ICON_PAUSE =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">' +
  '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const ICON_UNDO =
  '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path ' +
  'transform="rotate(90 12 12)" fill-rule="evenodd" clip-rule="evenodd" ' +
  'd="M15 3.75A5.25 5.25 0 0 0 9.75 9v10.19l4.72-4.72a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 ' +
  '0 0 1-1.06 0l-6-6a.75.75 0 1 1 1.06-1.06l4.72 4.72V9a6.75 6.75 0 0 1 13.5 0v3a.75.75 0 ' +
  '0 1-1.5 0V9c0-2.9-2.35-5.25-5.25-5.25Z"/></svg>';

const navbar = (title) => `
        <div class="navbar">
          <span class="navbtn">${ICON_BACK}</span>
          <span class="navtitle">${title}</span>
          <span class="navbtn">${ICON_PAUSE}</span>
        </div>`;

const board = (key, fill) =>
  `<div class="board-wrap"><div data-board="${key}"${fill ? ' data-fill="1"' : ''}></div></div>`;

const hintcard = `
          <div class="hintcard">
            <span class="chip">Hidden single</span>
            <p>Only one cell in this cage can take a 3 — every other spot already sees a 3.</p>
          </div>`;

const toolbar = `
          <div class="toolbar">
            <button class="tool active">Notes</button>
            <button class="tool">Hint</button>
            <button class="tool">Validate</button>
            <button class="tool">Clear</button>
          </div>`;

const keypad = `
          <div class="keypad">
            <button class="key">1</button>
            <button class="key">2</button>
            <button class="key">3</button>
            <button class="key">4</button>
            <button class="key">5</button>
            <button class="key key-undo">${ICON_UNDO}</button>
          </div>`;

const wrap = (cls, inner) => `<div class="${cls}">${inner}</div>`;

/** One full phone screen. `framed` boxes board / toolbar / keypad in cards. */
function screen(title, key, layout, framed, fill) {
  const bd = framed ? wrap('framecard', board(key, fill)) : board(key, fill);
  const tb = framed ? wrap('framecard', toolbar) : toolbar;
  const kp = framed ? wrap('framecard', keypad) : keypad;
  const stack =
    layout === 'keypad-first' ? [bd, kp, tb, hintcard] : [bd, hintcard, tb, kp];
  return `${navbar(title)}
        <div class="screen-body">
          <div class="statusrow">1:32 · 9 left</div>
          ${stack.join('\n          ')}
        </div>`;
}

/* --- the 10 variants ---------------------------------------------- */
const variants = [
  {
    slug: 'baseline', name: 'Baseline',
    desc: 'The Solving screen as it ships today — the reference point every other variant is judged against. Standard cell size, near-square cells, 8px buttons, 44px keypad keys, toolbar-then-keypad order.',
    cell5: 52, cell8: 34, rBoard: 6, rBtn: 8, btnH: 10, rKey: 8, key: 44,
    rCard: 12, gap: 16, layout: 'standard', framed: false, fill: null,
  },
  {
    slug: 'soft', name: 'Soft & rounded',
    desc: 'Everything generously rounded — a 22px board, fully-pill toolbar buttons, big-radius keypad keys. Slightly larger cells. The friendliest, most approachable read.',
    cell5: 54, cell8: 35, rBoard: 22, rBtn: 999, btnH: 13, rKey: 18, key: 52,
    rCard: 18, gap: 16, layout: 'standard', framed: false, fill: null,
  },
  {
    slug: 'sharp', name: 'Sharp & precise',
    desc: 'Minimal radius across the board, buttons, and keys — crisp, engineered, logic-puzzle-serious. The opposite pole from "soft".',
    cell5: 52, cell8: 34, rBoard: 2, rBtn: 2, btnH: 11, rKey: 2, key: 46,
    rCard: 3, gap: 16, layout: 'standard', framed: false, fill: null,
  },
  {
    slug: 'big-board', name: 'Board-forward',
    desc: 'The board is the hero — large cells on both grids, with a deliberately compact toolbar and smaller keypad keys so the puzzle gets the room.',
    cell5: 64, cell8: 42, rBoard: 8, rBtn: 8, btnH: 8, rKey: 8, key: 40,
    rCard: 10, gap: 14, layout: 'standard', framed: false, fill: null,
  },
  {
    slug: 'keypad-first', name: 'Keypad-first layout',
    desc: 'The number keys sit directly under the grid, with the Notes/Hint/Validate/Clear bar below them. Otherwise baseline sizing — this isolates the layout-order change.',
    cell5: 52, cell8: 34, rBoard: 6, rBtn: 8, btnH: 10, rKey: 8, key: 44,
    rCard: 12, gap: 16, layout: 'keypad-first', framed: false, fill: null,
  },
  {
    slug: 'big-keypad', name: 'Big circular keypad',
    desc: 'Large, fully-circular number keys placed right under the grid for thumb reach, with a compact pill toolbar below. Keypad-first layout.',
    cell5: 50, cell8: 33, rBoard: 12, rBtn: 999, btnH: 9, rKey: 999, key: 58,
    rCard: 14, gap: 16, layout: 'keypad-first', framed: false, fill: null,
  },
  {
    slug: 'compact', name: 'Compact & dense',
    desc: 'Smaller cells, smaller keys, a slim toolbar and tighter gaps — everything pulled in so the whole screen fits comfortably on a small phone without scrolling.',
    cell5: 44, cell8: 30, rBoard: 5, rBtn: 6, btnH: 7, rKey: 6, key: 38,
    rCard: 8, gap: 10, layout: 'standard', framed: false, fill: null,
  },
  {
    slug: 'card-framed', name: 'Card-framed',
    desc: 'The board, toolbar, and keypad each sit in their own elevated card with a generous radius — a structured, sectioned screen where each control group reads as a distinct surface.',
    cell5: 50, cell8: 33, rBoard: 16, rBtn: 10, btnH: 11, rKey: 10, key: 46,
    rCard: 16, gap: 14, layout: 'standard', framed: true, fill: null,
  },
  {
    slug: 'full-bleed', name: 'Full-bleed grid',
    desc: 'The grid grows edge-to-edge — the board spans the full width of the screen with no side margin, square corners, cells scaling to fill. Maximum board, zero frame.',
    cell5: 77, cell8: 48, rBoard: 0, rBtn: 8, btnH: 10, rKey: 8, key: 44,
    rCard: 12, gap: 14, layout: 'standard', framed: false, fill: 0,
  },
  {
    slug: 'inset-grid', name: 'Inset grid (~10px)',
    desc: 'The grid spans the full width less a ~10px margin on each side — nearly edge-to-edge, but with a slim breathing gap so the board still reads as a contained surface.',
    cell5: 73, cell8: 46, rBoard: 8, rBtn: 8, btnH: 10, rKey: 8, key: 44,
    rCard: 12, gap: 14, layout: 'standard', framed: false, fill: 10,
  },
];

/** Board-wrap width for a full-width variant. The phone is 388px wide
 *  with a 1px border ⇒ 386px of inner room; a fill variant's board is
 *  that, less the requested side margin ×2. screen-body's `align-items:
 *  center` then overflows it symmetrically past the 16px body padding. */
function boardW(v) {
  return v.fill === null ? null : `${386 - 2 * v.fill}px`;
}

const specLine = (v) => {
  const fillTxt =
    v.fill === null ? `cells ${v.cell5}/${v.cell8}px`
    : v.fill === 0 ? 'board full-bleed'
    : `board full-width −${v.fill}px`;
  return `${fillTxt} · board r${v.rBoard} · ` +
    `buttons r${v.rBtn === 999 ? 'pill' : v.rBtn} · ` +
    `keys ${v.key}px r${v.rKey === 999 ? 'circle' : v.rKey} · ` +
    `layout ${v.layout}${v.framed ? ' · framed' : ''}`;
};

function sectionVars(v) {
  const vars = [
    `--proto-rboard:${v.rBoard}px`,
    `--proto-rbtn:${v.rBtn}px`,
    `--proto-btnh:${v.btnH}px`,
    `--proto-rkey:${v.rKey}px`,
    `--proto-key:${v.key}px`,
    `--proto-rcard:${v.rCard}px`,
    `--proto-gap:${v.gap}px`,
  ];
  const w = boardW(v);
  if (w) vars.push(`--proto-board-w:${w}`);
  return vars.join(';');
}

function sectionHtml(v, idx) {
  const num = String(idx + 1).padStart(2, '0');
  const id = `v${num}`;
  return `<section id="${id}" style="${sectionVars(v)}">
  <div class="section-head">
    <h2>${num} · ${v.name}</h2>
    <p class="desc">${v.desc}</p>
    <p class="spec">${specLine(v)}</p>
  </div>
  <div class="stage">
    <figure>
      <figcaption>5 × 5 grid</figcaption>
      <div class="phone" style="--bcell:${v.cell5}px">
        ${screen('Medium · 5×5', '5', v.layout, v.framed, v.fill !== null)}
      </div>
    </figure>
    <figure>
      <figcaption>8 × 8 grid</figcaption>
      <div class="phone" style="--bcell:${v.cell8}px">
        ${screen('Hard · 8×8', '8', v.layout, v.framed, v.fill !== null)}
      </div>
    </figure>
  </div>
</section>`;
}

/* --- assemble the page -------------------------------------------- */
function pageHtml() {
  const toc = variants
    .map((v, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `  <a href="#v${num}" title="${v.name}">${num}</a>`;
    })
    .join('\n');
  const sections = variants.map((v, i) => sectionHtml(v, i)).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Solving screen — shape exploration · 10 variants</title>
<style>
${TOKENS}
${PAGE_CSS}
</style>
</head>
<body>
<header class="page-head">
  <h1>Solving screen — shape exploration</h1>
  <p>Ten design directions for the Solving screen, all on one page — exploring
  grid/cell size, corner radius, number-key and toolbar-button shape &amp; size,
  a keypad-first layout, and two full-width board treatments. Each variant is
  shown at both a 5×5 and an 8×8 grid. The boards are illustrative, not solvable
  puzzles. Session: 2026-05-17.</p>
</header>
<nav class="toc">
${toc}
</nav>
${sections}
<script>
const CAGE5=${JSON.stringify(CAGE5)};
const CAGE8=${JSON.stringify(CAGE8)};
${RENDERER}
</script>
</body>
</html>
`;
}

writeFileSync(join(DIR, 'index.html'), pageHtml());
console.log('Wrote index.html with ' + variants.length + ' variants on one page.');
