# Pulse — Content & Creator Intelligence

A content & creator **analytics platform demo** for a ShareChat-style multi-language social feed. Built as a Product Analyst portfolio project: it shows how I define metrics, build fair benchmarks, measure a funnel, and turn dashboards into decisions.

> **Fully synthetic data**, generated with a seeded RNG — *not* real ShareChat data. Modeled on an internal content-intelligence tool (Scout) and re-framed for ShareChat's product world (regional-language feed, creators, moderation at scale).

**[→ Analyst findings (INSIGHTS.md)](./INSIGHTS.md) · [the SQL (analyses.sql)](./analyses.sql) · [Product Teardown (TEARDOWN.md)](./TEARDOWN.md)**

---

## What it does

| View | Question it answers | Analyst technique on show |
|---|---|---|
| **Overview** | How is the platform doing? | KPI definition, performance-tag distribution |
| **Discovery** | Which posts are over/under-performing? | Benchmark colour-coding, auto performance tags, CSV export |
| **Retention** | How does a cohort retain vs. fair peers? | DAU-weighted aggregation, percentile benchmark band |
| **Moderation** | Where does T&S lose time? | Funnel drop-off, SLA tail, per-language fairness cut |
| **Breakout** | What's about to pop, and how reliably? | Precision/recall at a tunable threshold vs. ground truth |
| **Creators** | Who is worth investing in? | One-hit vs. repeatable (breakout rate), bubble scatter |
| **Product Teardown** | Is this candidate a product thinker? | Personas, growth loop, North-Star metric tree, activation funnel, RICE-prioritized recs with success metrics + guardrails |

## Analyst methodology baked in

- **One metric definition, reused everywhere** (`src/lib/metrics.js`) — three "teams" read the same number the same way.
- **Fair benchmarks** — every post is judged against its *language × genre* cohort percentiles, computed *from the data*, never hard-coded.
- **Correct aggregation** — cohort retention is a **DAU-weighted mean**, because percentages with different denominators can't be simple-averaged.
- **Honest guardrails** — small-sample cohorts are flagged, not trusted (see INSIGHTS.md finding #5).
- **Decisions, not just charts** — every insight states the action it implies.

## Run it

```bash
npm install
npm run generate-data   # writes synthetic JSON into public/data/
npm run dev             # http://localhost:5173
```

Deploy (static, zero backend):

```bash
npm run build           # regenerates data + builds to dist/
# push to GitHub → import into Vercel (framework: Vite) → done
```

## Tech

React 18 · Vite · Recharts · plain CSS (light/dark). No backend, no auth — the whole app is a static SPA over generated JSON, so it deploys anywhere and always runs. The `analyses.sql` file shows the equivalent warehouse queries for when this runs on real data.

## Data model (synthetic)

`scripts/generate.mjs` produces an internally-consistent corpus: 6,000 posts across 15 languages and 10 genres, with genre-specific retention decay, ~12% injected ground-truth breakouts, a moderation funnel with a realistic human-review tail, and percentile benchmarks derived from the posts themselves.

---

*Built by Diya Mittal as a Product Analyst portfolio project. Synthetic data only.*
