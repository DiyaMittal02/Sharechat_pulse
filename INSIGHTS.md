# Pulse — Analyst Findings

> Findings from the Pulse dataset, written as product recommendations. Each is: **the metric → the cut → the number → the decision it implies.** All figures come from the committed synthetic dataset (`npm run generate-data`), so they are reproducible. Queries behind each finding are in [`analyses.sql`](./analyses.sql).

---

## 1. Devotional is the retention engine; News is a leaky bucket

- **Metric:** average H10 retention, by genre.
- **Finding:** Devotional retains **68.0%** at H10 — the top genre — and decays slowest (**−33.6%** from H5→H30). News is the worst on *both*: **43.8%** H10 retention and the fastest decay (**−69.9%**).
- **Decision:** News earns its feed slot on *freshness*, not durability — rank it hard on recency and expect to refill constantly. Devotional is where sustained watch-time lives; it deserves evergreen surfaces and a larger benchmark-beating promotion budget.

## 2. Education is the "evergreen underdog" — don't judge it on H10 alone

- **Metric:** H10 retention vs. H5→H30 decay.
- **Finding:** Education looks mid-table at H10 (**55.3%**) but has the **slowest decay of any genre except Devotional (−30.0%)**. It loses almost nothing over time.
- **Decision:** A single headline retention number *misranks* Education. Judge long-form/education content on a later-hour metric (H25–H30), not H10 — otherwise the feed systematically under-promotes content that actually holds users.

## 3. The breakout model is a recall tool, not a precision tool — tune accordingly

- **Metric:** precision / recall of the breakout score vs. ground-truth breakouts, at three thresholds.

  | Threshold | Precision | Recall | Posts flagged |
  |---|---|---|---|
  | ≥60 | 30.7% | 86.1% | 2,064 |
  | **≥70** | **39.9%** | **78.7%** | **1,451** |
  | ≥80 | 49.4% | 65.4% | 974 |

- **Finding:** Even at ≥80, roughly half of flagged posts aren't true breakouts — but recall stays high, so few real hits are missed.
- **Decision:** Use the score as a **wide net for human shortlisting**, not for fully-automated promotion. If promotion spend is cheap and missing a hit is costly, run at ≥70 (catch ~79% of hits). If each promotion is expensive, move to ≥80 and accept ~1-in-3 misses. This is a business trade-off, not a modelling one — surface it to the growth team with the cost of a false positive attached.

## 4. Human review is the moderation bottleneck, not auto-mod

- **Metric:** time-to-decision distribution + stage drop-off.
- **Finding:** Platform avg time-to-decision is **3.5h**, but **10.7% of decided posts take over 6 hours** — and that tail sits entirely in the Human Review stage. Auto-moderation clears the vast majority instantly.
- **Decision:** Don't invest in tightening auto-mod thresholds to cut latency — the volume already clears there. The lever is **human-review capacity / routing** for the flagged tail. Quantify the SLA breach (>6h) by language and staff against it.

## 5. Takedown-rate outliers by language — real signal or small-sample noise?

- **Metric:** takedown rate by language vs. the **7.4%** platform mean.
- **Finding:** Rajasthani shows the highest rate at **11.0%** (1.5× the mean) — but on only **73 posts**. Odia (9.1%, n=164), Gujarati (8.7%, n=381) and Punjabi (8.7%, n=206) follow.
- **Decision / caveat:** *This is exactly where an analyst must not over-read a chart.* Rajasthani's 11% rests on 8 takedowns out of 73 — the confidence interval is wide and one labelling batch could move it. **Gujarati (n=381) being ~18% above the mean is the more trustworthy signal** and the one worth escalating as a possible content-policy or moderation-bias issue. Flag Rajasthani as "watch, insufficient volume," not "act."

---

### How I'd extend this with real data
- Attach **confidence intervals** to every rate (finding #5 is the whole reason).
- Add a **cohort LTV** view: does a creator's *second* hit predict a third? (one-hit vs. repeatable creators).
- Instrument an **A/B holdout** on promotion driven by the breakout score and measure true lift, with takedown-rate as a guardrail so we never buy watch-time at the cost of safety.
