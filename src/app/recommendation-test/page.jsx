'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── helpers ───────────────────────────────────────────────────────────────────

const SCORE_COLORS = {
  score:            { bar: 'bg-violet-500', label: 'Final' },
  ai_score:         { bar: 'bg-blue-500',   label: 'AI' },
  cf_score:         { bar: 'bg-emerald-500', label: 'CF' },
  popularity_score: { bar: 'bg-amber-500',  label: 'Pop' },
};

function ScoreBar({ value, colorClass, label, showLabel = true }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="w-8 text-right text-xs text-gray-400 shrink-0">{label}</span>
      )}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono text-gray-600 shrink-0">
        {(value ?? 0).toFixed(3)}
      </span>
    </div>
  );
}

function ScoreCard({ row }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">{row.products?.name ?? row.product_id}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {row.products?.category}
            {row.products?.color ? ` · ${row.products.color}` : ''}
            {row.products?.material ? ` · ${row.products.material}` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
            {Math.round((row.score ?? 0) * 100)}%
          </span>
          {row.ai_score > 0 && (
            <span className="ml-1.5 inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">
              ★ AI Pick
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <ScoreBar value={row.score}            colorClass="bg-violet-500"  label="Final" />
        <ScoreBar value={row.ai_score}         colorClass="bg-blue-500"    label="AI" />
        <ScoreBar value={row.cf_score}         colorClass="bg-emerald-500" label="CF" />
        <ScoreBar value={row.popularity_score} colorClass="bg-amber-500"   label="Pop" />
      </div>
      {row.products?.base_price != null && (
        <p className="mt-3 text-right text-sm font-medium text-gray-500">
          ₱{Number(row.products.base_price).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function UserRow({ row }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {row.user_profiles?.first_name
              ? `${row.user_profiles.first_name} ${row.user_profiles.last_name ?? ''}`.trim()
              : row.user_id}
          </p>
          <p className="text-xs text-gray-400">{row.user_profiles?.email ?? ''}</p>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
          {Math.round((row.score ?? 0) * 100)}%
        </span>
      </div>
      <div className="space-y-1.5">
        <ScoreBar value={row.score}            colorClass="bg-violet-500"  label="Final" />
        <ScoreBar value={row.ai_score}         colorClass="bg-blue-500"    label="AI" />
        <ScoreBar value={row.cf_score}         colorClass="bg-emerald-500" label="CF" />
        <ScoreBar value={row.popularity_score} colorClass="bg-amber-500"   label="Pop" />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function RecommendationTestPage() {
  const [tab, setTab] = useState('user');   // 'user' | 'product'

  // shared catalog
  const [users,    setUsers]    = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // user lens
  const [selectedUser, setSelectedUser] = useState('');
  const [userRecs,     setUserRecs]     = useState([]);
  const [userLoading,  setUserLoading]  = useState(false);

  // product lens
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productRecs,     setProductRecs]     = useState([]);
  const [productLoading,  setProductLoading]  = useState(false);

  // ── load users + products on mount ──────────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      const [{ data: u }, { data: p }] = await Promise.all([
        supabase.from('user_profiles').select('id, first_name, last_name, email, role').order('first_name'),
        supabase.from('products').select('id, name, category, color, material, base_price').eq('is_active', true).eq('is_archived', false).order('name'),
      ]);
      setUsers(u ?? []);
      setProducts(p ?? []);
      setLoading(false);
    }
    bootstrap();
  }, []);

  // ── user lens fetch ──────────────────────────────────────────────────────────
  const fetchUserRecs = useCallback(async (userId) => {
    if (!userId) { setUserRecs([]); return; }
    setUserLoading(true);
    const { data, error } = await supabase
      .from('product_recommendations')
      .select(`
        product_id, score, ai_score, cf_score, popularity_score, computed_at,
        products ( id, name, category, color, material, base_price )
      `)
      .eq('user_id', userId)
      .order('score', { ascending: false });
    if (!error) setUserRecs(data ?? []);
    setUserLoading(false);
  }, []);

  useEffect(() => { fetchUserRecs(selectedUser); }, [selectedUser, fetchUserRecs]);

  // ── product lens fetch ───────────────────────────────────────────────────────
  const fetchProductRecs = useCallback(async (productId) => {
    if (!productId) { setProductRecs([]); return; }
    setProductLoading(true);
    const { data, error } = await supabase
      .from('product_recommendations')
      .select(`
        user_id, score, ai_score, cf_score, popularity_score, computed_at,
        user_profiles ( id, first_name, last_name, email )
      `)
      .eq('product_id', productId)
      .order('score', { ascending: false });
    if (!error) setProductRecs(data ?? []);
    setProductLoading(false);
  }, []);

  useEffect(() => { fetchProductRecs(selectedProduct); }, [selectedProduct, fetchProductRecs]);

  // ── render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm animate-pulse">Loading catalog…</p>
      </div>
    );
  }

  const selectedUserObj    = users.find(u => u.id === selectedUser);
  const selectedProductObj = products.find(p => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Recommendation Visualizer</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Explore ML scores · {users.length} users · {products.length} products
            </p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {['user', 'product'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                  tab === t
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'user' ? '👤 User Lens' : '🪑 Product Lens'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* ── USER LENS ────────────────────────────────────────────────────── */}
        {tab === 'user' && (
          <>
            {/* selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700 shrink-0">Select user:</label>
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">— choose a user —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u.email}
                    {u.role === 'admin' ? ' (admin)' : ''}
                  </option>
                ))}
              </select>
              {selectedUserObj && (
                <span className="text-xs text-gray-400 shrink-0">{selectedUserObj.email}</span>
              )}
            </div>

            {/* legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(SCORE_COLORS).map(([key, { bar, label }]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${bar}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>

            {/* results */}
            {userLoading ? (
              <p className="text-sm text-gray-400 animate-pulse">Fetching recommendations…</p>
            ) : !selectedUser ? (
              <EmptyState text="Choose a user to see their personalized recommendations." />
            ) : userRecs.length === 0 ? (
              <EmptyState text="No recommendations found for this user. Run recommender.py to generate scores." />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing <strong>{userRecs.length}</strong> recommended products, sorted by final score ↓
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userRecs.map(row => (
                    <ScoreCard key={row.product_id} row={row} />
                  ))}
                </div>
                {/* score distribution mini-chart */}
                {userRecs.length > 0 && (
                  <ScoreDistribution recs={userRecs} type="user" />
                )}
              </>
            )}
          </>
        )}

        {/* ── PRODUCT LENS ─────────────────────────────────────────────────── */}
        {tab === 'product' && (
          <>
            {/* selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700 shrink-0">Select product:</label>
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
              >
                <option value="">— choose a product —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.category ? ` (${p.category})` : ''}
                  </option>
                ))}
              </select>
              {selectedProductObj && (
                <span className="text-xs text-gray-400 shrink-0">
                  ₱{Number(selectedProductObj.base_price).toLocaleString()}
                </span>
              )}
            </div>

            {/* product info banner */}
            {selectedProductObj && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                <Stat label="Category" value={selectedProductObj.category} />
                <Stat label="Color"    value={selectedProductObj.color} />
                <Stat label="Material" value={selectedProductObj.material} />
                <Stat label="Price"    value={`₱${Number(selectedProductObj.base_price).toLocaleString()}`} />
                <Stat label="Users with rec" value={productRecs.length} accent />
              </div>
            )}

            {/* legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(SCORE_COLORS).map(([key, { bar, label }]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${bar}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>

            {/* results */}
            {productLoading ? (
              <p className="text-sm text-gray-400 animate-pulse">Fetching data…</p>
            ) : !selectedProduct ? (
              <EmptyState text="Choose a product to see which users have it recommended and with what weight." />
            ) : productRecs.length === 0 ? (
              <EmptyState text="This product doesn't appear in any user's recommendations yet." />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>{productRecs.length}</strong> user{productRecs.length !== 1 ? 's' : ''} have this product recommended, sorted by final score ↓
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productRecs.map(row => (
                    <UserRow key={row.user_id} row={row} />
                  ))}
                </div>
                {productRecs.length > 0 && (
                  <ScoreDistribution recs={productRecs} type="product" />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function EmptyState({ text }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-4xl mb-3">📊</p>
      <p className="text-sm max-w-xs mx-auto">{text}</p>
    </div>
  );
}

function Stat({ label, value, accent }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-violet-700' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}

/**
 * Simple horizontal bar chart showing how scores are distributed
 * across all recommendations for the selected user/product.
 */
function ScoreDistribution({ recs, type }) {
  const buckets = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const counts  = buckets.map(low =>
    recs.filter(r => r.score >= low && r.score < low + 0.1).length
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Final score distribution — {type === 'user' ? 'recommended products' : 'users'}
      </h3>
      <div className="flex items-end gap-1.5 h-24">
        {buckets.map((low, i) => (
          <div key={low} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">{counts[i] || ''}</span>
            <div
              className="w-full bg-violet-400 rounded-t"
              style={{ height: `${(counts[i] / maxCount) * 72}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {buckets.map(low => (
          <div key={low} className="flex-1 text-center text-[10px] text-gray-300">
            {low.toFixed(1)}
          </div>
        ))}
      </div>
      {/* score stats */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center border-t pt-4">
        {[
          { label: 'Min',  value: Math.min(...recs.map(r => r.score)) },
          { label: 'Mean', value: recs.reduce((s, r) => s + r.score, 0) / recs.length },
          { label: 'Max',  value: Math.max(...recs.map(r => r.score)) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-mono text-sm font-semibold text-violet-600">{value.toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
