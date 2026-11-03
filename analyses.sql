-- ─────────────────────────────────────────────────────────────────────────
-- Pulse — analysis queries
--
-- The app runs on synthetic JSON (no DB), but these are the SQL queries the
-- same analyses would use against a warehouse. Written for Postgres / standard
-- SQL. Schema assumed:
--
--   posts(id, title, creator_id, creator_name, creator_tier, language, genre,
--         format, published_at, status, is_breakout_truth, llm_score, dau,
--         watch_through, time_to_decision_h,
--         h5_ret, h10_ret, h15_ret, h20_ret, h25_ret, h30_ret)
--   creators(creator_id, name, language, tier, joined_at)
--
-- Every finding in INSIGHTS.md maps to one query below.
-- ─────────────────────────────────────────────────────────────────────────


-- #1 + #2 — Genre retention ranking AND decay (evergreen vs. fast-decay)
SELECT
  genre,
  ROUND(AVG(h10_ret), 1)                                  AS avg_h10_ret,
  ROUND(AVG(h30_ret), 1)                                  AS avg_h30_ret,
  ROUND((1 - AVG(h30_ret) / NULLIF(AVG(h5_ret), 0)) * 100, 1) AS decay_h5_h30_pct,
  COUNT(*)                                                AS n_posts
FROM posts
GROUP BY genre
ORDER BY avg_h10_ret DESC;


-- Benchmark table: percentiles per language × genre × hour (the "fair peer" set).
-- This is what the app's colour-coding + performance tags compare against.
-- Shown for H10; repeat per hour (or UNPIVOT the h*_ret columns first).
SELECT
  language, genre,
  PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY h10_ret) AS p10,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY h10_ret) AS p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY h10_ret) AS p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY h10_ret) AS p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY h10_ret) AS p90,
  COUNT(*) AS n
FROM posts
GROUP BY language, genre
HAVING COUNT(*) >= 20          -- suppress thin cohorts (fair-benchmark guardrail)
ORDER BY language, genre;


-- Cohort retention the CORRECT way: DAU-weighted, never a flat AVG of rates.
-- (Percentages across posts have different denominators, so weight by eligible base.)
SELECT
  'H5'  AS hour, ROUND(SUM(h5_ret  * dau) / SUM(dau), 1) AS weighted_ret FROM posts WHERE language = 'Hindi' AND genre = 'Comedy'
UNION ALL SELECT 'H10', ROUND(SUM(h10_ret * dau) / SUM(dau), 1) FROM posts WHERE language = 'Hindi' AND genre = 'Comedy'
UNION ALL SELECT 'H20', ROUND(SUM(h20_ret * dau) / SUM(dau), 1) FROM posts WHERE language = 'Hindi' AND genre = 'Comedy'
UNION ALL SELECT 'H30', ROUND(SUM(h30_ret * dau) / SUM(dau), 1) FROM posts WHERE language = 'Hindi' AND genre = 'Comedy';


-- #3 — Breakout model precision / recall at a threshold (vs. ground truth).
-- Swap 70 for the threshold under review.
WITH scored AS (
  SELECT
    (breakout_score >= 70) AS predicted,
    is_breakout_truth      AS actual
  FROM posts
)
SELECT
  SUM(CASE WHEN predicted AND actual THEN 1 ELSE 0 END)                                   AS tp,
  SUM(CASE WHEN predicted AND NOT actual THEN 1 ELSE 0 END)                               AS fp,
  SUM(CASE WHEN NOT predicted AND actual THEN 1 ELSE 0 END)                               AS fn,
  ROUND(1.0 * SUM(CASE WHEN predicted AND actual THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN predicted THEN 1 ELSE 0 END), 0), 3)                       AS precision,
  ROUND(1.0 * SUM(CASE WHEN predicted AND actual THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN actual THEN 1 ELSE 0 END), 0), 3)                          AS recall
FROM scored;


-- #4 — Moderation: time-to-decision distribution + the >6h SLA-breach tail.
SELECT
  COUNT(*)                                                             AS decided_posts,
  ROUND(AVG(time_to_decision_h), 1)                                    AS avg_ttd_h,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY time_to_decision_h)     AS p95_ttd_h,
  ROUND(100.0 * COUNT(*) FILTER (WHERE time_to_decision_h > 6) / COUNT(*), 1) AS pct_over_6h
FROM posts
WHERE time_to_decision_h IS NOT NULL;


-- #5 — Takedown rate by language WITH volume, so small-n outliers are visible.
SELECT
  language,
  COUNT(*)                                                      AS n_posts,
  SUM(CASE WHEN status = 'taken_down' THEN 1 ELSE 0 END)        AS takedowns,
  ROUND(100.0 * SUM(CASE WHEN status = 'taken_down' THEN 1 ELSE 0 END) / COUNT(*), 1) AS takedown_rate_pct
FROM posts
GROUP BY language
ORDER BY takedown_rate_pct DESC;


-- Creator value: repeatable (high breakout rate) vs. one-hit.
SELECT
  creator_name, language, creator_tier,
  COUNT(*)                                                        AS total_posts,
  ROUND(AVG(h10_ret), 1)                                          AS avg_h10_ret,
  SUM(CASE WHEN breakout_score >= 70 THEN 1 ELSE 0 END)           AS breakout_posts,
  ROUND(100.0 * SUM(CASE WHEN breakout_score >= 70 THEN 1 ELSE 0 END) / COUNT(*), 1) AS breakout_rate_pct,
  SUM(dau)                                                        AS total_dau
FROM posts
GROUP BY creator_name, language, creator_tier
HAVING COUNT(*) >= 3           -- need a track record before judging repeatability
ORDER BY breakout_rate_pct DESC
LIMIT 50;
