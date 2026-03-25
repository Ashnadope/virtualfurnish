#!/usr/bin/env python3
"""
VirtualFurnish Recommendation Engine
=====================================
Computes per-user product recommendation scores using a 3-tier hybrid approach:

  Tier 1 – AI score        : from each user's room-design AI analysis
                             (furnitureRecommendations[].priority → 1.0 / 0.7 / 0.4)
  Tier 2 – CF score        : item-based collaborative filtering on purchase/cart/wishlist
  Tier 3 – Popularity score: global interaction frequency (orders × 3, cart × 2, wishlist × 1)

Score blending weights (auto-selected per user):
  User has AI recs AND interaction history  → 35% AI + 30% CF + 20% content + 15% pop
  User has AI recs only                     → 60% AI + 40% popularity
  User has interaction history only         → 45% CF + 30% content + 25% popularity
  User has neither                          → skipped (frontend falls back to 'newest')

Results are upserted into public.product_recommendations.

Run:
    cd ml
    pip install -r requirements.txt
    cp .env.example .env          # fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
    python recommender.py

Re-run whenever product data or user interactions change significantly.
A nightly cron / GitHub Actions workflow is a good schedule.
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone

from dotenv import load_dotenv
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from supabase import create_client, Client

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# The URL is the public Next.js var; the service key is server-only (never NEXT_PUBLIC_)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

PRIORITY_WEIGHTS: dict[str, float] = {"high": 1.0, "medium": 0.7, "low": 0.4}
INTERACTION_WEIGHTS: dict[str, int] = {"order": 3, "cart": 2, "wishlist": 1}

# Score blending — keyed by (has_ai, has_interactions)
BLEND: dict[tuple[bool, bool], dict[str, float]] = {
    (True,  True):  {"ai": 0.35, "cf": 0.30, "content": 0.20, "pop": 0.15},
    (True,  False): {"ai": 0.60, "cf": 0.00, "content": 0.00, "pop": 0.40},
    (False, True):  {"ai": 0.00, "cf": 0.45, "content": 0.30, "pop": 0.25},
}

UPSERT_CHUNK = 500  # rows per batch to avoid payload limits


# ── Supabase client ───────────────────────────────────────────────────────────

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        log.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Data fetching ─────────────────────────────────────────────────────────────

def fetch_all(supabase: Client) -> dict[str, pd.DataFrame]:
    """Fetch all tables needed for scoring from Supabase."""
    log.info("Fetching data from Supabase…")

    users = pd.DataFrame(
        supabase.table("user_profiles").select("id, role").execute().data
    )

    raw_products = supabase.table("products").select(
        "id, name, category, color, material, base_price, is_archived, is_active"
    ).execute().data
    products = pd.DataFrame(raw_products)
    if not products.empty:
        products = products[
            (products["is_archived"] == False) & (products["is_active"] == True)
        ].copy()

    raw_designs = supabase.table("room_designs").select("id, user_id, design_data").execute().data
    designs = pd.DataFrame(raw_designs) if raw_designs else pd.DataFrame()

    raw_orders = supabase.table("orders").select("id, user_id, payment_status").execute().data
    orders = pd.DataFrame(raw_orders) if raw_orders else pd.DataFrame()

    raw_oi = supabase.table("order_items").select("order_id, product_id").execute().data
    order_items = pd.DataFrame(raw_oi) if raw_oi else pd.DataFrame()

    raw_cart = supabase.table("cart_items").select("user_id, product_id").execute().data
    cart = pd.DataFrame(raw_cart) if raw_cart else pd.DataFrame()

    raw_wish = supabase.table("wishlist_items").select("user_id, product_id").execute().data
    wishlist = pd.DataFrame(raw_wish) if raw_wish else pd.DataFrame()

    log.info(
        "Loaded: %d users, %d active products, %d designs, "
        "%d order_items, %d cart_items, %d wishlist_items",
        len(users), len(products), len(designs),
        len(order_items), len(cart), len(wishlist),
    )

    return {
        "users": users,
        "products": products,
        "designs": designs,
        "orders": orders,
        "order_items": order_items,
        "cart": cart,
        "wishlist": wishlist,
    }


# ── Interaction matrix ────────────────────────────────────────────────────────

def build_interaction_matrix(data: dict) -> pd.DataFrame:
    """
    Build a user×product interaction DataFrame with a single weight per pair.
    Weight = max(order=3, cart=2, wishlist=1) when a user touched the same product
    via multiple channels.
    """
    rows: list[pd.DataFrame] = []

    orders = data["orders"]
    order_items = data["order_items"]
    if not order_items.empty and not orders.empty:
        completed_ids = orders.loc[orders["payment_status"] == "succeeded", "id"].tolist()
        oi = order_items[order_items["order_id"].isin(completed_ids)].merge(
            orders[["id", "user_id"]].rename(columns={"id": "order_id"}),
            on="order_id",
            how="inner",
        )[["user_id", "product_id"]].drop_duplicates()
        oi["weight"] = INTERACTION_WEIGHTS["order"]
        rows.append(oi)

    for df, key in [(data["cart"], "cart"), (data["wishlist"], "wishlist")]:
        if not df.empty:
            chunk = df[["user_id", "product_id"]].drop_duplicates().copy()
            chunk["weight"] = INTERACTION_WEIGHTS[key]
            rows.append(chunk)

    if not rows:
        return pd.DataFrame(columns=["user_id", "product_id", "weight"])

    combined = pd.concat(rows, ignore_index=True)
    return (
        combined.groupby(["user_id", "product_id"], as_index=False)["weight"].max()
    )


# ── Popularity scores ─────────────────────────────────────────────────────────

def build_popularity_scores(data: dict, product_ids: list[str]) -> dict[str, float]:
    """
    Global popularity: weighted sum of purchase / cart / wishlist counts.
    Normalized to [0, 1].
    """
    pop: dict[str, float] = {pid: 0.0 for pid in product_ids}

    orders = data["orders"]
    order_items = data["order_items"]
    if not order_items.empty and not orders.empty:
        completed_ids = orders.loc[orders["payment_status"] == "succeeded", "id"].tolist()
        sold = order_items[order_items["order_id"].isin(completed_ids)]
        for pid, cnt in sold.groupby("product_id").size().items():
            if pid in pop:
                pop[pid] += cnt * INTERACTION_WEIGHTS["order"]

    for df, key in [(data["cart"], "cart"), (data["wishlist"], "wishlist")]:
        if not df.empty:
            for pid, cnt in df.groupby("product_id").size().items():
                if pid in pop:
                    pop[pid] += cnt * INTERACTION_WEIGHTS[key]

    max_pop = max(pop.values(), default=1) or 1
    return {k: v / max_pop for k, v in pop.items()}


# ── AI scores ─────────────────────────────────────────────────────────────────

def build_ai_scores(designs: pd.DataFrame) -> dict[tuple[str, str], float]:
    """
    Extract furnitureRecommendations from each design's aiAnalysis JSON.
    Returns (user_id, product_id) → max priority weight across all designs.
    """
    ai_scores: dict[tuple[str, str], float] = {}

    if designs.empty:
        return ai_scores

    for _, row in designs.iterrows():
        user_id = row.get("user_id")
        if not user_id:
            continue
        try:
            dd = row.get("design_data") or {}
            if isinstance(dd, str):
                dd = json.loads(dd)
            recs = dd.get("aiAnalysis", {}).get("furnitureRecommendations", [])
        except (json.JSONDecodeError, AttributeError, TypeError):
            continue

        for rec in recs:
            pid = rec.get("furnitureId")
            if not pid:
                continue
            weight = PRIORITY_WEIGHTS.get(rec.get("priority", "medium"), 0.4)
            key = (user_id, pid)
            ai_scores[key] = max(ai_scores.get(key, 0.0), weight)

    return ai_scores


# ── Content-based scores ──────────────────────────────────────────────────────

def build_content_scores(
    products: pd.DataFrame,
    interaction: pd.DataFrame,
) -> dict[tuple[str, str], float]:
    """
    Cosine-similarity content-based scores.
    User "taste profile" = weighted average of feature vectors of interacted products.
    Features: category (label-encoded), color, material, price (min-max scaled).
    Returns (user_id, product_id) → cosine similarity (0–1).
    """
    if products.empty or interaction.empty:
        return {}

    feat = products[["id", "category", "color", "material", "base_price"]].copy()
    feat = feat.fillna({"category": "Unknown", "color": "Unknown", "material": "Unknown", "base_price": 0.0})

    for col in ["category", "color", "material"]:
        le = LabelEncoder()
        feat[col + "_enc"] = le.fit_transform(feat[col].astype(str))

    scaler = MinMaxScaler()
    feat["price_norm"] = scaler.fit_transform(feat[["base_price"]])

    feature_cols = ["category_enc", "color_enc", "material_enc", "price_norm"]
    product_matrix = feat[feature_cols].values.astype(float)
    product_ids = feat["id"].tolist()
    pid_to_idx = {pid: i for i, pid in enumerate(product_ids)}

    content_scores: dict[tuple[str, str], float] = {}

    for user_id, group in interaction.groupby("user_id"):
        vecs, weights = [], []
        for _, irow in group.iterrows():
            idx = pid_to_idx.get(irow["product_id"])
            if idx is None:
                continue
            vecs.append(product_matrix[idx])
            weights.append(float(irow["weight"]))

        if not vecs:
            continue

        w_arr = np.array(weights)
        w_arr /= w_arr.sum()
        user_profile = np.average(vecs, axis=0, weights=w_arr).reshape(1, -1)

        sims = cosine_similarity(user_profile, product_matrix)[0]
        for i, sim in enumerate(sims):
            content_scores[(user_id, product_ids[i])] = float(sim)

    return content_scores


# ── CF scores (item-based) ────────────────────────────────────────────────────

def build_cf_scores(
    interaction: pd.DataFrame,
    product_ids: list[str],
) -> dict[tuple[str, str], float]:
    """
    Item-based collaborative filtering.
    For each user, score uninteracted products by how much other users who share
    interactions also interacted with them (Jaccard-weighted).
    Returns normalized (user_id, product_id) → cf_score (0–1).
    """
    if interaction.empty:
        return {}

    product_id_set = set(product_ids)
    user_items: dict[str, set] = (
        interaction.groupby("user_id")["product_id"].apply(set).to_dict()
    )
    item_users: dict[str, set] = (
        interaction.groupby("product_id")["user_id"].apply(set).to_dict()
    )
    weight_map: dict[tuple[str, str], float] = {
        (r.user_id, r.product_id): float(r.weight)
        for r in interaction.itertuples()
    }

    cf_scores: dict[tuple[str, str], float] = {}
    max_score = 0.0

    for user_id, my_items in user_items.items():
        # Users who share at least one item
        neighbors: set[str] = set()
        for pid in my_items:
            neighbors.update(item_users.get(pid, set()))
        neighbors.discard(user_id)

        if not neighbors:
            continue

        scores: dict[str, float] = {}
        for other in neighbors:
            other_items = user_items.get(other, set())
            overlap = my_items & other_items
            if not overlap:
                continue
            sim = len(overlap) / len(other_items)  # Jaccard-like
            for pid in other_items - my_items:
                if pid not in product_id_set:
                    continue
                w = weight_map.get((other, pid), 1.0)
                scores[pid] = scores.get(pid, 0.0) + sim * w

        for pid, score in scores.items():
            cf_scores[(user_id, pid)] = score
            if score > max_score:
                max_score = score

    if max_score > 0:
        cf_scores = {k: v / max_score for k, v in cf_scores.items()}

    return cf_scores


# ── Combine & upsert ──────────────────────────────────────────────────────────

def compute_and_upsert(supabase: Client, data: dict) -> None:
    products = data["products"]
    if products.empty:
        log.warning("No active products found — nothing to compute.")
        return

    product_ids = products["id"].tolist()

    log.info("Building interaction matrix…")
    interaction = build_interaction_matrix(data)

    log.info("Computing popularity scores…")
    popularity = build_popularity_scores(data, product_ids)

    log.info("Computing AI scores…")
    ai_scores = build_ai_scores(data["designs"])

    log.info("Computing content-based scores…")
    content_scores = build_content_scores(products, interaction)

    log.info("Computing CF scores…")
    cf_scores = build_cf_scores(interaction, product_ids)

    # All (user, product) pairs that have at least one signal
    all_pairs: set[tuple[str, str]] = set()
    all_pairs.update(ai_scores.keys())
    all_pairs.update(cf_scores.keys())
    all_pairs.update(content_scores.keys())

    users_with_interactions: set[str] = (
        set(interaction["user_id"].unique()) if not interaction.empty else set()
    )
    users_with_ai: set[str] = {uid for uid, _ in ai_scores.keys()}
    product_id_set = set(product_ids)

    records = []
    now = datetime.now(timezone.utc).isoformat()

    for user_id, product_id in all_pairs:
        if product_id not in product_id_set:
            continue

        has_ai = user_id in users_with_ai
        has_cf = user_id in users_with_interactions

        if not has_ai and not has_cf:
            continue  # no signal → skip

        blend = BLEND[(has_ai, has_cf)]

        ai_s   = ai_scores.get((user_id, product_id), 0.0)
        cf_s   = cf_scores.get((user_id, product_id), 0.0)
        con_s  = content_scores.get((user_id, product_id), 0.0)
        pop_s  = popularity.get(product_id, 0.0)

        final = (
            blend["ai"]      * ai_s
            + blend["cf"]      * cf_s
            + blend["content"] * con_s
            + blend["pop"]     * pop_s
        )

        records.append({
            "user_id":          user_id,
            "product_id":       product_id,
            "score":            round(final, 6),
            "ai_score":         round(ai_s,  6),
            "cf_score":         round(cf_s,  6),
            "popularity_score": round(pop_s, 6),
            "computed_at":      now,
        })

    log.info("Upserting %d recommendation records…", len(records))

    for i in range(0, len(records), UPSERT_CHUNK):
        chunk = records[i : i + UPSERT_CHUNK]
        supabase.table("product_recommendations").upsert(
            chunk,
            on_conflict="user_id,product_id",
        ).execute()
        log.info("  → %d / %d", min(i + UPSERT_CHUNK, len(records)), len(records))

    log.info("Done. %d recommendations written.", len(records))


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    client = get_supabase_client()
    dataset = fetch_all(client)
    compute_and_upsert(client, dataset)
