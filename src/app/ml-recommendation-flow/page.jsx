'use client';

import { useState } from 'react';

/* ─── colour palette ─────────────────────────────────────────────────────── */
const C = {
  ai:         { bg: 'bg-blue-50',      border: 'border-blue-400',     text: 'text-blue-700',     bar: 'bg-blue-500',     accent: 'text-blue-500'   },
  cf:         { bg: 'bg-emerald-50',    border: 'border-emerald-400',  text: 'text-emerald-700',  bar: 'bg-emerald-500',  accent: 'text-emerald-500'},
  content:    { bg: 'bg-orange-50',     border: 'border-orange-400',   text: 'text-orange-700',   bar: 'bg-orange-500',   accent: 'text-orange-500' },
  popularity: { bg: 'bg-amber-50',      border: 'border-amber-400',    text: 'text-amber-700',    bar: 'bg-amber-500',    accent: 'text-amber-500'  },
  blend:      { bg: 'bg-violet-50',     border: 'border-violet-400',   text: 'text-violet-700',   bar: 'bg-violet-500',   accent: 'text-violet-500' },
  db:         { bg: 'bg-gray-50',       border: 'border-gray-400',     text: 'text-gray-700',     bar: 'bg-gray-500',     accent: 'text-gray-500'   },
  frontend:   { bg: 'bg-indigo-50',     border: 'border-indigo-400',   text: 'text-indigo-700',   bar: 'bg-indigo-500',   accent: 'text-indigo-500' },
};

/* ─── reusable card ──────────────────────────────────────────────────────── */
function Card({ title, theme, icon, children, className = '' }) {
  const t = C[theme] ?? C.db;
  return (
    <div className={`rounded-2xl border-2 ${t.border} ${t.bg} p-5 ${className}`}>
      <h3 className={`flex items-center gap-2 font-bold text-lg ${t.text} mb-3`}>
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── score bar used in the blend demo ───────────────────────────────────── */
function ScoreBar({ label, value, theme }) {
  const t = C[theme] ?? C.db;
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-right text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${t.bar} transition-all duration-700`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="w-12 text-right text-xs font-mono text-gray-600">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

/* ─── arrow (down) svg ───────────────────────────────────────────────────── */
function ArrowDown({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <svg width="24" height="32" viewBox="0 0 24 32" className="text-gray-400">
        <line x1="12" y1="0" x2="12" y2="26" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="6,24 12,32 18,24" fill="currentColor" />
      </svg>
    </div>
  );
}

function ArrowRight({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="40" height="24" viewBox="0 0 40 24" className="text-gray-400">
        <line x1="0" y1="12" x2="32" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="30,6 40,12 30,18" fill="currentColor" />
      </svg>
    </div>
  );
}

/* ─── blend weight selector ──────────────────────────────────────────────── */
const BLEND_PRESETS = {
  'AI + Interactions':  { ai: 0.35, cf: 0.30, content: 0.20, pop: 0.15 },
  'AI Only':            { ai: 0.60, cf: 0.00, content: 0.00, pop: 0.40 },
  'Interactions Only':  { ai: 0.00, cf: 0.45, content: 0.30, pop: 0.25 },
};

/* ─── main page ──────────────────────────────────────────────────────────── */
export default function MLRecommendationFlowPage() {
  const [activePreset, setActivePreset] = useState('AI + Interactions');
  const [activeTier, setActiveTier] = useState(null);
  const blend = BLEND_PRESETS[activePreset];

  // example scores for demo
  const example = { ai: 0.70, cf: 0.45, content: 0.62, pop: 0.32 };
  const final = blend.ai * example.ai + blend.cf * example.cf + blend.content * example.content + blend.pop * example.pop;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ML Recommendation Flow</h1>
            <p className="text-sm text-gray-500">How VirtualFurnish personalises furniture suggestions</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">

        {/* ── Section 1: High-level overview ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">System Overview</h2>
          <p className="text-gray-500 mb-6 max-w-3xl">
            VirtualFurnish uses a <strong>3-tier hybrid recommendation engine</strong> that
            blends AI room analysis, collaborative filtering, content-based similarity, and
            global popularity into a single personalised score per product.
          </p>

          {/* end-to-end pipeline diagram */}
          <div className="overflow-x-auto">
            <div className="min-w-[820px] flex items-start gap-0">
              {/* Data sources */}
              <Card title="Data Sources" theme="db" icon="🗄️" className="w-56 shrink-0">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Room designs &amp; AI analyses</li>
                  <li>• Orders / Cart / Wishlist</li>
                  <li>• Product catalog</li>
                  <li>• User profiles</li>
                </ul>
              </Card>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              {/* ML Engine */}
              <Card title="ML Engine (Python)" theme="blend" icon="⚙️" className="w-64 shrink-0">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Fetches all data via Supabase API</li>
                  <li>• Computes 4 sub-scores</li>
                  <li>• Blends with context weights</li>
                  <li>• Upserts into DB</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2 italic">Runs nightly / on-demand</p>
              </Card>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              {/* Storage */}
              <Card title="product_recommendations" theme="db" icon="💾" className="w-56 shrink-0">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• user_id + product_id</li>
                  <li>• score (blended 0–1)</li>
                  <li>• ai_score, cf_score</li>
                  <li>• popularity_score</li>
                </ul>
              </Card>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              {/* Frontend */}
              <Card title="Frontend (React)" theme="frontend" icon="🖥️" className="w-56 shrink-0">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Furniture Catalog sort</li>
                  <li>• Customer Dashboard</li>
                  <li>• Room Designer palette</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Section 2: The 4 scoring tiers ─────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Scoring Tiers</h2>
          <p className="text-gray-500 mb-6 max-w-3xl">
            Click a tier to see details. Each produces a 0–1 score per (user, product) pair.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Tier 1 */}
            <button onClick={() => setActiveTier(activeTier === 'ai' ? null : 'ai')} className="text-left">
              <Card title="Tier 1 — AI Score" theme="ai" icon="🧠" className={`h-full transition-all ${activeTier === 'ai' ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'}`}>
                <p className="text-sm text-gray-600 mb-2">
                  Derived from <strong>OpenAI room analysis</strong>. When a user uploads a room
                  photo, GPT-4o-mini returns furniture recommendations with priority levels.
                </p>
                <div className="text-xs space-y-0.5 text-gray-500">
                  <p>🔹 High priority → <code className="bg-blue-100 px-1 rounded">1.0</code></p>
                  <p>🔹 Medium priority → <code className="bg-blue-100 px-1 rounded">0.7</code></p>
                  <p>🔹 Low priority → <code className="bg-blue-100 px-1 rounded">0.4</code></p>
                </div>
              </Card>
            </button>

            {/* Tier 2 */}
            <button onClick={() => setActiveTier(activeTier === 'cf' ? null : 'cf')} className="text-left">
              <Card title="Tier 2 — CF Score" theme="cf" icon="🤝" className={`h-full transition-all ${activeTier === 'cf' ? 'ring-2 ring-emerald-400 shadow-lg' : 'hover:shadow-md'}`}>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Item-based collaborative filtering</strong> using Jaccard similarity.
                  &quot;Users who bought similar items also bought this.&quot;
                </p>
                <div className="text-xs space-y-0.5 text-gray-500">
                  <p>🔹 Order interaction → weight <code className="bg-emerald-100 px-1 rounded">3</code></p>
                  <p>🔹 Cart interaction → weight <code className="bg-emerald-100 px-1 rounded">2</code></p>
                  <p>🔹 Wishlist interaction → weight <code className="bg-emerald-100 px-1 rounded">1</code></p>
                </div>
              </Card>
            </button>

            {/* Tier 3 */}
            <button onClick={() => setActiveTier(activeTier === 'content' ? null : 'content')} className="text-left">
              <Card title="Tier 3 — Content Score" theme="content" icon="📐" className={`h-full transition-all ${activeTier === 'content' ? 'ring-2 ring-orange-400 shadow-lg' : 'hover:shadow-md'}`}>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Cosine similarity</strong> between a user&apos;s &quot;taste profile&quot;
                  (weighted average of interacted products) and each product&apos;s feature vector.
                </p>
                <div className="text-xs space-y-0.5 text-gray-500">
                  <p>🔹 Features: category, color, material, price</p>
                  <p>🔹 Label-encoded + MinMax scaled</p>
                  <p>🔹 scikit-learn cosine_similarity</p>
                </div>
              </Card>
            </button>

            {/* Tier 4 */}
            <button onClick={() => setActiveTier(activeTier === 'popularity' ? null : 'popularity')} className="text-left">
              <Card title="Tier 4 — Popularity" theme="popularity" icon="🔥" className={`h-full transition-all ${activeTier === 'popularity' ? 'ring-2 ring-amber-400 shadow-lg' : 'hover:shadow-md'}`}>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Global interaction frequency</strong> across all users. Acts as a cold-start
                  fallback so new users still see trending products.
                </p>
                <div className="text-xs space-y-0.5 text-gray-500">
                  <p>🔹 orders × 3 + cart × 2 + wishlist × 1</p>
                  <p>🔹 Normalized to 0–1</p>
                  <p>🔹 Same for every user</p>
                </div>
              </Card>
            </button>
          </div>

          {/* Expanded detail panel */}
          {activeTier && (
            <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
              {activeTier === 'ai' && (
                <Card title="AI Score — Detailed Flow" theme="ai" icon="🧠">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">1. User uploads room photo</h4>
                      <p className="text-sm text-gray-500">
                        The Virtual Room Designer sends the image + full product catalog to
                        <code className="ml-1 bg-blue-100 px-1 rounded text-xs">POST /api/room-analysis</code>.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">2. GPT-4o-mini analyses the room</h4>
                      <p className="text-sm text-gray-500">
                        Vision model identifies room type, style, colours, and lighting. It matches
                        products from the catalog and assigns <strong>high / medium / low</strong> priority.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">3. Stored in room_designs</h4>
                      <p className="text-sm text-gray-500">
                        The AI analysis is saved inside <code className="bg-blue-100 px-1 rounded text-xs">design_data.aiAnalysis</code>.
                        The batch ML engine later reads these priorities to compute the AI sub-score.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {activeTier === 'cf' && (
                <Card title="Collaborative Filtering — Detailed Flow" theme="cf" icon="🤝">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">1. Build interaction matrix</h4>
                      <p className="text-sm text-gray-500">
                        Aggregate orders (weight 3), cart (2), and wishlist (1) into a
                        <strong> user × product</strong> matrix. Take max weight per pair.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">2. Find neighbours</h4>
                      <p className="text-sm text-gray-500">
                        For each user, find other users who share at least one product interaction.
                        Similarity = <code className="bg-emerald-100 px-1 rounded text-xs">|overlap| / |other_items|</code> (Jaccard-like).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">3. Score unseen products</h4>
                      <p className="text-sm text-gray-500">
                        For each neighbour&apos;s item not yet seen by the user, accumulate
                        <code className="bg-emerald-100 px-1 rounded text-xs">similarity × weight</code>. Normalize to 0–1.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {activeTier === 'content' && (
                <Card title="Content-Based Scoring — Detailed Flow" theme="content" icon="📐">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">1. Feature vectors</h4>
                      <p className="text-sm text-gray-500">
                        Each product is encoded as a vector: <strong>category</strong> (label-encoded),
                        <strong> color</strong>, <strong>material</strong>, and <strong>price</strong> (MinMax scaled).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">2. User taste profile</h4>
                      <p className="text-sm text-gray-500">
                        Weighted average of the feature vectors of all products the user has interacted with.
                        Weights: orders &gt; cart &gt; wishlist.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">3. Cosine similarity</h4>
                      <p className="text-sm text-gray-500">
                        <code className="bg-orange-100 px-1 rounded text-xs">sklearn.cosine_similarity(profile, all_products)</code>
                        — products similar to the user&apos;s taste get high scores.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {activeTier === 'popularity' && (
                <Card title="Popularity Scoring — Detailed Flow" theme="popularity" icon="🔥">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">1. Count interactions</h4>
                      <p className="text-sm text-gray-500">
                        Sum <strong>orders × 3 + cart × 2 + wishlist × 1</strong> across all users
                        for each product.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">2. Normalise</h4>
                      <p className="text-sm text-gray-500">
                        Divide by the highest sum so all values fall in <strong>0–1</strong>.
                        The most popular product always scores 1.0.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">3. Cold-start safety net</h4>
                      <p className="text-sm text-gray-500">
                        Even users with no personal history see globally trending products, making
                        this the fallback for new accounts.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* ── Section 3: Score blending ───────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Score Blending</h2>
          <p className="text-gray-500 mb-6 max-w-3xl">
            The final score is a <strong>weighted sum</strong> of the 4 sub-scores. The weights
            change dynamically based on what data is available for each user.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preset selector */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">User Context</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(BLEND_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setActivePreset(preset)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activePreset === preset
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-violet-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Weight table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Component</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Weight</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-40">Visual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { key: 'ai',      label: 'AI Score',         theme: 'ai' },
                      { key: 'cf',      label: 'CF Score',         theme: 'cf' },
                      { key: 'content', label: 'Content Score',    theme: 'content' },
                      { key: 'pop',     label: 'Popularity Score', theme: 'popularity' },
                    ].map(({ key, label, theme }) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{label}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-600">
                          {(blend[key] * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${C[theme].bar} transition-all duration-500`}
                              style={{ width: `${blend[key] * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-400 mt-3 italic">
                Users with <strong>neither</strong> AI recs nor interaction history are skipped —
                the frontend falls back to showing newest products.
              </p>
            </div>

            {/* Live blend demo */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Live Blend Example</h3>
              <Card title="Example Product Score" theme="blend" icon="🧮">
                <p className="text-sm text-gray-500 mb-4">
                  Given these hypothetical sub-scores, the engine blends them with the
                  <strong> {activePreset}</strong> weights:
                </p>
                <div className="space-y-2 mb-5">
                  <ScoreBar label="AI Score"         value={example.ai}      theme="ai" />
                  <ScoreBar label="CF Score"         value={example.cf}      theme="cf" />
                  <ScoreBar label="Content Score"    value={example.content} theme="content" />
                  <ScoreBar label="Popularity"       value={example.pop}     theme="popularity" />
                </div>
                <div className="border-t border-violet-200 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Final Score</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-700"
                        style={{ width: `${Math.round(final * 100)}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-violet-700">{(final * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    = {blend.ai > 0 ? `${(blend.ai * 100).toFixed(0)}% × ${(example.ai * 100).toFixed(0)}` : ''}
                    {blend.cf > 0 ? ` + ${(blend.cf * 100).toFixed(0)}% × ${(example.cf * 100).toFixed(0)}` : ''}
                    {blend.content > 0 ? ` + ${(blend.content * 100).toFixed(0)}% × ${(example.content * 100).toFixed(0)}` : ''}
                    {blend.pop > 0 ? ` + ${(blend.pop * 100).toFixed(0)}% × ${(example.pop * 100).toFixed(0)}` : ''}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Section 4: Real-time AI flow ───────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Real-time AI Room Analysis</h2>
          <p className="text-gray-500 mb-6 max-w-3xl">
            Separately from the batch scoring, the Virtual Room Designer provides <strong>instant
            AI-powered recommendations</strong> when a user uploads a room photo.
          </p>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] flex items-stretch gap-0">
              <div className="flex flex-col items-center gap-2 w-44 shrink-0">
                <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center flex-1 flex flex-col justify-center">
                  <span className="text-2xl mb-1">📸</span>
                  <p className="text-sm font-semibold text-indigo-700">User uploads room photo</p>
                  <p className="text-xs text-gray-500 mt-1">Via Room Designer</p>
                </div>
              </div>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              <div className="flex flex-col items-center gap-2 w-52 shrink-0">
                <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center flex-1 flex flex-col justify-center">
                  <span className="text-2xl mb-1">🔌</span>
                  <p className="text-sm font-semibold text-blue-700">POST /api/room-analysis</p>
                  <p className="text-xs text-gray-500 mt-1">Image + product catalog sent</p>
                </div>
              </div>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              <div className="flex flex-col items-center gap-2 w-52 shrink-0">
                <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-4 text-center flex-1 flex flex-col justify-center">
                  <span className="text-2xl mb-1">🤖</span>
                  <p className="text-sm font-semibold text-purple-700">GPT-4o-mini (Vision)</p>
                  <p className="text-xs text-gray-500 mt-1">Analyses room style, colours, dimensions</p>
                </div>
              </div>
              <ArrowRight className="shrink-0 mx-1 my-auto" />
              <div className="flex flex-col items-center gap-2 w-52 shrink-0">
                <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center flex-1 flex flex-col justify-center">
                  <span className="text-2xl mb-1">🪑</span>
                  <p className="text-sm font-semibold text-green-700">Furniture Recommendations</p>
                  <p className="text-xs text-gray-500 mt-1">Matched products with priority + placement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <Card title="AI Response Structure" theme="ai" icon="📋">
              <pre className="text-xs bg-white rounded-lg p-4 overflow-x-auto border border-blue-200 text-gray-700">{`{
  "roomAnalysis": {
    "roomType": "Bedroom",
    "style": "Modern Minimalist",
    "dominantColors": ["#FFFFFF", "#8B4513"],
    "lighting": "Natural light"
  },
  "furnitureRecommendations": [
    {
      "furnitureName": "Sofa (Dark Grey)",
      "priority": "high",        ← feeds Tier 1
      "reason": "matches room style",
      "suggestedPosition": { "x": 40, "y": 60 }
    }
  ],
  "colorPaletteSuggestions": {
    "primary": "#F5F5F5",
    "accent": "#E8D5B7"
  }
}`}</pre>
            </Card>
            <Card title="Where It Surfaces" theme="frontend" icon="🖥️">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎨</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Virtual Room Designer</p>
                    <p className="text-xs text-gray-500">
                      AI suggestions panel shows layout tips, colour matching, and suggested placements directly on the canvas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Furniture Catalog</p>
                    <p className="text-xs text-gray-500">
                      &quot;Recommended&quot; sort option orders products by their pre-computed ML score
                      from <code className="bg-gray-100 px-1 rounded">product_recommendations</code>.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📊</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Customer Dashboard</p>
                    <p className="text-xs text-gray-500">
                      Top 4 AI-recommended products shown prominently. Falls back to newest if
                      user has no designs yet.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Section 5: Tech stack ──────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tech Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🐍', title: 'Python', items: ['pandas ≥ 2.0', 'scikit-learn ≥ 1.4', 'numpy ≥ 1.26', 'supabase-py ≥ 2.3'] },
              { icon: '🤖', title: 'AI Models', items: ['GPT-4o-mini (primary)', 'Nemotron 12B (fallback)', 'Vision API for room photos', 'Prompt caching (~34k tokens saved)'] },
              { icon: '🗃️', title: 'Database', items: ['Supabase (PostgreSQL)', 'product_recommendations table', 'room_designs.design_data', 'RLS policies'] },
              { icon: '⚛️', title: 'Frontend', items: ['Next.js + React', 'product.service.js', 'CatalogInteractive sort', 'RecommendationVisualizer'] },
            ].map(({ icon, title, items }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span>{icon}</span> {title}
                </h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  {items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 6: execution schedule ──────────────────────────────── */}
        <section className="pb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Execution</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs shrink-0">1</span>
                <p>
                  <strong className="text-gray-800">Batch ML Engine</strong> — Run
                  <code className="mx-1 bg-gray-100 px-2 py-0.5 rounded text-xs">python ml/recommender.py</code>
                  nightly or after significant data changes. Takes ~seconds for typical catalog sizes.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
                <p>
                  <strong className="text-gray-800">Real-time AI</strong> — Room analysis runs
                  on-demand per upload via the Next.js API route. Response time ~3–8s depending on
                  catalog size and image complexity.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">3</span>
                <p>
                  <strong className="text-gray-800">Frontend reads</strong> — Pre-computed scores
                  are fetched from <code className="bg-gray-100 px-1 rounded text-xs">product_recommendations</code>
                  at page load. No ML computation happens client-side.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
