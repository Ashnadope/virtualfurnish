'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';

/**
 * VirtualFurnish — System Architecture Diagram
 * Swimlane: USER (grouped, vertically centred) | INPUT → PROCESSING → AI/ML → OUTPUT
 * Horizontal rules between actor groups.
 */

// Each group = one actor whose label spans all its rows vertically.
const GROUPS = [
  {
    user: 'Customer',
    rows: [
      { input: 'Room Photo',         processing: 'Canvas API',                ai: 'OpenAI API',     output: 'AI Room Analysis'    },
      { input: 'Room Designer',      processing: 'Supabase DB · Rec. Lookup', ai: null,             output: 'Personalised Palette' },
      { input: 'Checkout',           processing: 'Edge Functions',            ai: 'Stripe Webhook', output: 'Order + Receipt'      },
    ],
  },
  {
    user: 'Cron',
    rows: [
      // Three inputs converge into Hybrid Recommender (middle row).
      // Rows without processing/ai/output show only the input box — no arrows.
      { input: 'Interaction Data',   processing: null,                        ai: null,             output: null                   },
      { input: 'Product Popularity', processing: 'Hybrid Recommender',        ai: 'Scikit-learn',   output: 'Product Rec. Scores'  },
      { input: 'AI Room Analysis',   processing: null,                        ai: null,             output: null                   },
    ],
  },
  {
    user: 'Admin',
    rows: [
      { input: 'Product Entry',      processing: 'Input Validation',          ai: null,             output: 'Product Catalog'      },
      { input: 'Order Management',   processing: 'orders / order_items',      ai: null,             output: 'Admin Dashboard'      },
    ],
  },
];

/* ── draw.io XML generator ────────────────────────────────────── */

function generateDrawioXml() {
  // Layout constants (pixels in draw.io coordinate space)
  const COL_W   = 160;  // node width
  const COL_H   = 48;   // node height
  const COL_GAP = 40;   // horizontal gap between columns
  const ROW_GAP = 20;   // vertical gap between rows
  const GROUP_GAP = 36; // extra gap between actor groups
  const USER_W  = 140;
  const PAD_X   = 20;
  const PAD_Y   = 20;

  // Column x-positions (after user col)
  const COLS = ['input', 'processing', 'ai', 'output'];
  const colX = (ci) => PAD_X + USER_W + COL_GAP + ci * (COL_W + COL_GAP);

  let cells = [];
  let id = 2; // 0 and 1 are reserved mxGraph root cells
  const nextId = () => String(id++);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Track y cursor as we lay out groups top-to-bottom
  let curY = PAD_Y;

  GROUPS.forEach((group) => {
    const rowCount = group.rows.length;
    const groupH   = rowCount * COL_H + (rowCount - 1) * ROW_GAP;
    const userY    = curY + (groupH - COL_H) / 2; // vertically centre actor label

    // Actor node
    const actorId = nextId();
    cells.push(
      `<mxCell id="${actorId}" value="${esc(group.user)}" style="rounded=1;whiteSpace=wrap;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="${PAD_X}" y="${userY}" width="${USER_W}" height="${COL_H}" as="geometry" /></mxCell>`
    );

    group.rows.forEach((row, ri) => {
      const y = curY + ri * (COL_H + ROW_GAP);
      const rowCells = { input: null, processing: null, ai: null, output: null };

      COLS.forEach((col, ci) => {
        if (!row[col]) return;
        const nodeId = nextId();
        rowCells[col] = nodeId;
        cells.push(
          `<mxCell id="${nodeId}" value="${esc(row[col])}" style="rounded=1;whiteSpace=wrap;fillColor=#fff;strokeColor=#aac4e0;fontStyle=1;fontSize=11;" vertex="1" parent="1"><mxGeometry x="${colX(ci)}" y="${y}" width="${COL_W}" height="${COL_H}" as="geometry" /></mxCell>`
        );
      });

      // Arrows between consecutive filled columns
      const colOrder = ['input', 'processing', 'ai', 'output'];
      for (let ci = 0; ci < colOrder.length - 1; ci++) {
        const src = rowCells[colOrder[ci]];
        const tgt = rowCells[colOrder[ci + 1]];
        if (src && tgt) {
          cells.push(
            `<mxCell id="${nextId()}" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="${src}" target="${tgt}" parent="1"><mxGeometry relative="1" as="geometry" /></mxCell>`
          );
        }
      }
    });

    curY += groupH + GROUP_GAP;
  });

  return `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join('')}</root></mxGraphModel>`;
}

/* ── components ───────────────────────────────────────────────── */

function Node({ data, accent = false }) {
  if (!data) return <div className="h-12" />;
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 text-center text-sm font-semibold leading-tight
        ${accent ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-blue-100 shadow-sm'}`}
    >
      <span className="text-[#2c4a7c]">{data.title}</span>
    </div>
  );
}

// Arrow only renders when show=true so input-only cron rows stay clean.
function Arrow({ show = true }) {
  return (
    <div className="flex items-center justify-center text-blue-300 text-base select-none">
      {show ? '→' : ''}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────── */

export default function SystemArchitecturePage() {
  const diagramRef = useRef(null);

  async function downloadPng() {
    if (!diagramRef.current) return;
    const canvas = await html2canvas(diagramRef.current, { scale: 2, backgroundColor: '#f0f4f9' });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'virtualfurnish-system-architecture.png';
    a.click();
  }

  function downloadXml() {
    const xml = generateDrawioXml();
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'virtualfurnish-system-architecture.drawio';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex items-start justify-center p-8 font-sans">
      <div className="w-full max-w-5xl">

        {/* title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-700 tracking-wide">
            System Design — System Architecture Diagram
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            VirtualFurnish · Next.js 14 + Supabase + OpenAI + scikit-learn
          </p>
        </div>

        {/* export buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={downloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            ↓ Download PNG
          </button>
          <button
            onClick={downloadXml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            ↓ Export draw.io XML
          </button>
        </div>

        {/* diagram card */}
        <div ref={diagramRef} className="bg-[#f7f9fc] rounded-2xl border border-blue-100 shadow p-6">

          {/* column headers — USER col is fixed-width; content cols share the rest */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[130px] shrink-0 text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase">
              USER
            </div>
            <div className="flex-1 grid grid-cols-[1fr_16px_1fr_16px_1fr_16px_1fr] gap-x-2">
              <div className="text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase">INPUT</div>
              <div />
              <div className="text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase">PROCESSING</div>
              <div />
              <div className="text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase">AI / ML</div>
              <div />
              <div className="text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase">OUTPUT</div>
            </div>
          </div>

          {/* divider */}
          <div className="border-t border-blue-100 mb-4" />

          {/* swimlane groups */}
          <div>
            {GROUPS.map((group, gi) => (
              <div key={group.user}>

                {/* horizontal rule between groups */}
                {gi > 0 && <div className="border-t border-blue-200 my-4" />}

                <div className="flex gap-2 items-center">

                  {/* actor label — self-stretch so it fills the group height; flex centers it */}
                  <div className="w-[130px] shrink-0 self-stretch flex items-center justify-center py-1">
                    <Node data={{ title: group.user }} accent />
                  </div>

                  {/* flow rows for this group */}
                  <div className="flex-1 flex flex-col gap-3">
                    {group.rows.map((row, ri) => (
                      <div
                        key={ri}
                        className="grid grid-cols-[1fr_16px_1fr_16px_1fr_16px_1fr] gap-x-2 items-center"
                      >
                        <Node data={row.input      ? { title: row.input }      : null} />
                        {/* show arrow to processing only if processing has data */}
                        <Arrow show={!!row.processing} />
                        <Node data={row.processing ? { title: row.processing } : null} />
                        {/* show arrow to ai/output col if there is anything downstream */}
                        <Arrow show={!!row.ai || !!row.output} />
                        <Node data={row.ai         ? { title: row.ai }         : null} />
                        {/* show arrow to output only if output has data */}
                        <Arrow show={!!row.output} />
                        <Node data={row.output     ? { title: row.output }     : null} />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* tech stack footer */}
        <div className="mt-4 bg-white rounded-2xl border border-blue-100 shadow p-4 space-y-3 text-sm">
          <StackRow label="DEV" badges={[
            'React.js (Next.js 14)',
            'Tailwind CSS',
            'Supabase Cloud (DB + Auth)',
            'OpenAI API',
            'Scikit-learn (Python)',
            'Git / GitHub',
            'VS Code',
            'NPM',
          ]} />
          <StackRow label="DEPLOY" badges={[
            'Vercel (Next.js hosting)',
            'Supabase Cloud (PostgreSQL + Storage)',
            'Supabase Edge Functions (Deno)',
            'Stripe API',
            'GCash (Edge Function)',
            'Canvas API (image compression)',
            'html2canvas · jsPDF',
          ]} />
        </div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 px-1">
          <LegendItem color="bg-blue-50 border-blue-300" label="User actor" />
          <LegendItem color="bg-white border-blue-100"   label="System node" />
          <span>→ data flow direction</span>
        </div>

      </div>
    </div>
  );
}

function StackRow({ label, badges }) {
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="text-xs font-bold text-gray-400 tracking-widest uppercase w-14 shrink-0 pt-0.5">
        {label}
      </span>
      {badges.map(b => (
        <span
          key={b}
          className="px-2.5 py-0.5 rounded-full border border-blue-100 bg-blue-50 text-[11px] text-blue-600"
        >
          {b}
        </span>
      ))}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-4 h-4 rounded border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
