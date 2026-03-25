'use client';

//  layout constants 
const SVG_W  = 876;
const NODE_W = 136;
const NODE_H = 50;
const ROW_H  = 84;
const HDR_H  = 58;
const SEC_GAP = 44;
const AX     = 44;
const ARR    = 7;

const CX = { 1: 94, 2: 278, 3: 462, 4: 646 };
const ncx = c => CX[c] + NODE_W / 2;
const nrx = c => CX[c] + NODE_W;
const nlx = c => CX[c];

//  data 
const SECTIONS_DATA = [
  {
    actor: 'Customer',
    rows: [
      { id: 'r0', nodes: [
        { c: 1, t: 'Room Photo' },
        { c: 2, t: 'Canvas Image\nCompression API' },
        { c: 3, t: 'OpenAI API' },
        { c: 4, t: 'Room Analysis +\nFurniture Recos' },
      ]},
      { id: 'r1', branchFrom: 'r0', nodes: [
        { c: 2, t: 'Supabase Storage\nBucket' },
        { c: 4, t: 'High-res Room\nPhoto' },
      ]},
      { id: 'r2', nodes: [
        { c: 1, t: 'Catalog Page' },
        { c: 2, t: 'User Session +\nRec. Lookup' },
        { c: 4, t: 'Personalised\nCatalog' },
      ]},
      { id: 'r3', nodes: [
        { c: 1, t: 'Cart / Wishlist\n+ Orders' },
        { c: 4, t: 'Customer\nInteraction Data' },
      ]},
      { id: 'r4', nodes: [
        { c: 1, t: 'Checkout' },
        { c: 2, t: 'Edge Function +\nGCash / Stripe' },
        { c: 4, t: 'Order + Receipt' },
      ]},
    ],
  },
  {
    actor: 'Cron',
    rows: [
      { id: 'r5', nodes: [
        { c: 1, t: 'Customer\nInteraction Data' },
        { c: 2, t: 'Hybrid\nRecommender' },
        { c: 3, t: 'Scikit-learn' },
        { c: 4, t: 'Product Rec.\nScores' },
      ]},
      { id: 'r5b', convergeTo: 'r5', convergeCol: 2, nodes: [
        { c: 1, t: 'Product\nPopularity' },
      ]},
      { id: 'r5c', convergeTo: 'r5', convergeCol: 2, nodes: [
        { c: 1, t: 'AI Furniture\nRecos' },
      ]},
    ],
  },
  {
    actor: 'Admin',
    rows: [
      { id: 'r6', nodes: [
        { c: 1, t: 'Product Entry' },
        { c: 2, t: 'Input Validation' },
        { c: 4, t: 'Product Catalog' },
      ]},
    ],
  },
];

//  layout builder 
function buildLayout(sections) {
  const rowMap = {};
  const out = [];
  let y = HDR_H + 22;
  sections.forEach((sec, si) => {
    if (si > 0) y += SEC_GAP;
    const secY0 = y;
    const rows = sec.rows.map(row => {
      const r = { ...row, y };
      rowMap[row.id] = r;
      y += ROW_H;
      return r;
    });
    out.push({ ...sec, rows, secY0, secY1: y - ROW_H });
  });
  return { sections: out, rowMap, svgH: y + 28 };
}

//  SVG primitives 
function NodeBox({ c, y, t }) {
  const lines = t.split('\n');
  const by = y - NODE_H / 2;
  const ty = lines.length > 1 ? y - 6 : y + 4;
  return (
    <g>
      <rect x={nlx(c)} y={by} width={NODE_W} height={NODE_H} rx={5}
        fill="white" stroke="#1a1a1a" strokeWidth={1.3} />
      {lines.map((ln, i) => (
        <text key={i} x={ncx(c)} y={ty + i * 14}
          textAnchor="middle" fontSize={11} fill="#111"
          fontFamily="Arial, Helvetica, sans-serif">
          {ln}
        </text>
      ))}
    </g>
  );
}

function HArrow({ x1, x2, y }) {
  return (
    <line x1={x1} y1={y} x2={x2 - ARR} y2={y}
      stroke="#1a1a1a" strokeWidth={1.2}
      markerEnd="url(#ah)" />
  );
}

function BranchConn({ row, rowMap }) {
  const src = rowMap[row.branchFrom];
  const srcCol = Math.min(...src.nodes.map(n => n.c));
  const sorted = [...row.nodes].sort((a, b) => a.c - b.c);
  const firstCol = sorted[0].c;
  const vx = ncx(srcCol);
  return (
    <g>
      <line x1={vx} y1={src.y + NODE_H / 2} x2={vx} y2={row.y}
        stroke="#1a1a1a" strokeWidth={1.2} />
      <HArrow x1={vx} x2={nlx(firstCol)} y={row.y} />
    </g>
  );
}

// Diagonal arrow from a convergeTo row's node into a target row's node
function ConvergeArrow({ row, rowMap }) {
  const target = rowMap[row.convergeTo];
  const sorted = [...row.nodes].sort((a, b) => a.c - b.c);
  const lastCol = sorted[sorted.length - 1].c;
  const x1 = nrx(lastCol);
  const y1 = row.y;
  const tCol = row.convergeCol ?? 2;
  const x2 = nlx(tCol);
  const y2 = target.y;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  return (
    <line
      x1={x1} y1={y1}
      x2={x2 - (dx / len) * ARR} y2={y2 - (dy / len) * ARR}
      stroke="#1a1a1a" strokeWidth={1.2}
      markerEnd="url(#ah)"
    />
  );
}

function ActorIcon({ x, y, label }) {
  return (
    <g>
      <circle cx={x} cy={y - 19} r={9} fill="none" stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={x}      y1={y - 10} x2={x}      y2={y + 5}  stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={x - 11} y1={y - 4}  x2={x + 11} y2={y - 4}  stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={x}      y1={y + 5}  x2={x - 9}  y2={y + 20} stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={x}      y1={y + 5}  x2={x + 9}  y2={y + 20} stroke="#1a1a1a" strokeWidth={1.5} />
      <text x={x} y={y + 34} textAnchor="middle" fontSize={11} fill="#1a1a1a"
        fontFamily="Arial, Helvetica, sans-serif">
        {label}
      </text>
    </g>
  );
}

const COL_HEADERS = [
  { c: 1, label: 'input' },
  { c: 2, label: 'processing' },
  { c: 3, label: 'ai / ml' },
  { c: 4, label: 'output' },
];

// ─── page ─────────────────────────────────────────────────────────────────────
import { useRef } from 'react';

export default function DataFlowPage() {
  const { sections, rowMap, svgH } = buildLayout(SECTIONS_DATA);
  const dividerYs = sections.slice(1).map(s => s.secY0 - SEC_GAP / 2);
  const svgRef = useRef(null);

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // 2× for retina quality
      canvas.width  = svg.width.baseVal.value * scale;
      canvas.height = svg.height.baseVal.value * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = 'virtualfurnish-dfd.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-700 mb-1">Data Flow Diagram</h1>
          <p className="text-xs text-gray-400">
            VirtualFurnish · Next.js 14 + Supabase + OpenAI + scikit-learn
          </p>
        </div>
        <button
          onClick={downloadPng}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-600 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PNG
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          <svg ref={svgRef} width={SVG_W} height={svgH} xmlns="http://www.w3.org/2000/svg"
            style={{ border: '1px solid #d1d5db', borderRadius: 8, background: 'white', display: 'block' }}>

            <defs>
              <marker id="ah" markerWidth={ARR} markerHeight={6}
                refX={0} refY={3} orient="auto">
                <polygon points={`0 0, ${ARR} 3, 0 6`} fill="#1a1a1a" />
              </marker>
            </defs>

            {COL_HEADERS.map(h => (
              <g key={h.c}>
                <rect x={nlx(h.c)} y={10} width={NODE_W} height={36} rx={3}
                  fill="white" stroke="#1a1a1a" strokeWidth={1.3} />
                <text x={ncx(h.c)} y={33} textAnchor="middle"
                  fontSize={12} fill="#1a1a1a"
                  fontFamily="Arial, Helvetica, sans-serif">
                  {h.label}
                </text>
              </g>
            ))}

            {dividerYs.map((dy, i) => (
              <line key={i} x1={68} y1={dy} x2={SVG_W - 14} y2={dy}
                stroke="#d1d5db" strokeWidth={1} strokeDasharray="5 4" />
            ))}

            {sections.map(sec => {
              const actorRows = sec.rows.filter(
                r => !r.branchFrom && r.nodes.some(n => n.c === 1)
              );
              const iconY = actorRows.length > 0 ? actorRows[0].y : sec.secY0;

              return (
                <g key={sec.actor}>
                  <ActorIcon x={AX} y={iconY} label={sec.actor} />

                  {actorRows.map(r => (
                    <HArrow key={r.id + '_a'} x1={AX} x2={nlx(1)} y={r.y} />
                  ))}

                  {sec.rows.map(row => {
                    const sorted = [...row.nodes].sort((a, b) => a.c - b.c);
                    return (
                      <g key={row.id}>
                        {row.branchFrom && (
                          <BranchConn row={row} rowMap={rowMap} />
                        )}
                        {sorted.map(n => (
                          <NodeBox key={n.c} c={n.c} y={row.y} t={n.t} />
                        ))}
                        {sorted.slice(0, -1).map((n, i) => {
                          const next = sorted[i + 1];
                          return (
                            <HArrow key={i} x1={nrx(n.c)} x2={nlx(next.c)} y={row.y} />
                          );
                        })}
                        {row.convergeTo && (
                          <ConvergeArrow row={row} rowMap={rowMap} />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
