# Product Teardown — ShareChat / Moj

> A product-thinking artifact for a Product Analyst application. It dissects *why* the product works, where it leaks, and what I'd ship next — each bet with a success metric and a guardrail.
>
> **On numbers:** figures marked *(assumption)* are illustrative hypotheses used to reason with, **not published ShareChat data.** Stating assumptions explicitly is deliberate — it's how an analyst should work, and it means nothing here misrepresents the company.

---

## 0 · TL;DR / Thesis

ShareChat (feed) and Moj (short video) won vernacular India by making **language — not production quality — the unit of distribution.** That unlocked a creator base and an audience that metro-first apps (Instagram Reels, YouTube Shorts) structurally under-serve.

The open problem isn't growth. It's **monetizing attention without taxing the session-length that is the entire moat.** Heavy ad-load buys revenue today and spends the thing that makes the product valuable. So the strategic arc is: *grow the vernacular long tail, and shift the revenue mix toward monetization that aligns with engagement (gifting, subscriptions, commerce) rather than against it (ad density).*

Everything below ladders up to that thesis.

---

## 1 · Who it serves

| Persona | Who they are | Job-to-be-done | Core pain |
|---|---|---|---|
| **Bharat Consumer** | Tier-2/3, 18–34, vernacular-first, often first smartphone | Kill boredom in my own language; feel represented | English-first apps feel alien; mobile data is precious |
| **Aspiring Creator** | Small-town talent, phone-only production | Get discovered & earn without English or a studio | Reels/Shorts reward polished, metro, English content |
| **Established Creator** | 100K+ followers, actively monetizing | Predictable income + an audience I own | Payout logic & reach feel like a black box |
| **Advertiser / SMB** | Regional brands, D2C | Reach vernacular India cheaply and measurably | Hard to target by language/region with proof of ROI |

The non-obvious insight: **the Aspiring Creator is the keystone.** They are cheap supply, they produce in thin-supply languages, and they're the group global apps can't win. Protecting their experience (discovery + payout trust) protects the moat.

---

## 2 · Competitive landscape

| Player | Core user | Language depth | Creator monetization | Moat | Biggest weakness |
|---|---|---|---|---|---|
| **ShareChat / Moj** ◂ | Tier-2/3, vernacular-first | **Deep** — 15+ languages as the core targeting signal | Live gifting + ads; long-tail focus | Vernacular supply + Bharat distribution | Monetization depth / ARPU; profitability pressure |
| Instagram Reels | Metro, aspirational | Shallow — language is incidental | Mature ads + off-platform brand deals | Existing social graph + creator gravity | Under-serves small-town, non-English creators |
| YouTube Shorts | Broad, cross-lingual | Medium — strong search, weak feed targeting | **Best-in-class payouts (AdSense)** | Payout trust + long-form funnel | Shorts cannibalize long-form; less community-led discovery |
| Josh (VerSe) | Tier-2/3 vernacular — direct rival | Deep — same Bharat thesis | Ads + gifting, similar model | Dailyhunt distribution + news cross-sell | Same monetization ceiling; thin differentiation |

**Strategic read:** Don't fight Reels/Shorts on polish or global creators — that's their game, and their social graph/payout trust are hard to dislodge. The winnable fights are (a) **deepening the vernacular long tail** where the structural advantage already is, and (b) **out-executing Josh on creator trust** — payout transparency is a cheap, defensible wedge against a near-identical rival.

---

## 3 · Business model & monetization

Four streams, different risk/margin profiles:

| Stream | How it works | Strength | Tension |
|---|---|---|---|
| **Feed & video ads** | In-feed / interstitial ads, targetable by language & region | Scales with DAU — the volume play | Low ARPU in Bharat; ad-load directly taxes session length |
| **Live streaming + virtual gifting** | Viewers buy coins, gift creators live; platform takes a cut | High-margin, creator-aligned, emotionally sticky | Revenue concentrated in top creators; needs payments trust & safety |
| **Creator tools / subscriptions** | Premium effects, fan subscriptions, tipping | Deepens the loop; recurring, less ad-dependent | Price sensitivity; still nascent in vernacular India |
| **Commerce / affiliate** | Shoppable content, regional SMB/D2C tie-ups | Natural fit for regional intent + brands | Needs a logistics/trust layer; long build |

**The core tension in one line:** ads monetize *against* the North Star, gifting/subscriptions/commerce monetize *with* it. A healthy long-term P&L shifts mix toward the latter without starving the former before it's ready.

---

## 4 · The core growth loop

```
      ┌─────────────────────────────────────────────┐
      │                                             │
      ▼                                             │
1. Creator posts in a regional language            │
   (low production bar → high, cheap supply)        │
      │                                             │
      ▼                                             │
2. Feed matches content to same-language consumers  │
   (language is the primary targeting signal)       │
      │                                             │
      ▼                                             │
3. Consumers engage — watch, like, gift, share      │
      │                                             │
      ▼                                             │
4. Creator earns + sees reach → posts more ─────────┘
      │
      ▼
5. Shares pull new users in  →  viral side-loop
   (WhatsApp-driven in India)
```

Two loops in one: a **core content loop** (steps 1–4) reinforced by a **viral acquisition loop** (step 5). The loop's fragility is step 4 — if the reward (reach + earnings) isn't *visible and predictable*, long-tail supply decays, and the long tail is where vernacular breadth lives.

---

## 5 · North Star & metric tree

**North Star: Weekly Engaged Time per User (in-language).**

Why this and not the alternatives:
- *Not installs* — leaky, vanity, says nothing about value delivered.
- *Not DAU* — counts a user who opened and bounced the same as one who stayed an hour.
- *Time, in-language* — captures the real value exchange, and anchors on the moat (a minute in Bhojpuri is worth more than a generic minute, because that's what no one else can serve).

```
Weekly Engaged Time per User (in-language)
├── Supply       → posts / active creator · creator D30 retention · % languages with fresh daily supply
├── Matching     → feed CTR · watch-through % · scroll depth per session
├── Demand       → sessions / WAU · session length · engagement rate
└── Loop health  → creator payout / earnings · share rate · invite → install conversion
```

Any proposed feature should move a leaf of this tree; if it doesn't, it's a distraction.

---

## 6 · Activation funnel — where it leaks *(assumption)*

| Stage | % of installs | Note |
|---|---|---|
| Install | 100% | |
| Pick language + first feed | 82% | Language selection is the critical first-run step |
| First meaningful session (5+ posts) | 54% | |
| **First engagement (like / follow / gift)** | **31%** | **← steepest drop** |
| D7 return | 18% | |

**Diagnosis:** the biggest leak is first-session → first-engagement. A consuming-only user is a churning user — passive viewers never form the social bonds (follows, gifting relationships) that drive return. That makes it the single highest-leverage intervention point, and it's why Recommendation #1 targets it directly.

---

## 7 · Teardown findings

1. **Activation leaks at "first engagement" (Retention).** The steepest funnel drop is session-1 → first like/follow/gift. Fix the bond, fix retention.
2. **Creator payout opacity weakens the loop (Supply).** A black-box reward kills long-tail supply — precisely the vernacular breadth that is the moat.
3. **Monetization vs. experience tension (Monetization).** Dense ads tax session length; the whole P&L challenge is sequencing the mix shift toward engagement-aligned revenue.
4. **Language is underused as a lever (Growth).** It's treated as a setting, not a surface. Supply/demand balance differs wildly by language, but a single global feed model under-serves thin-supply ones.

---

## 8 · Prioritized recommendations (RICE)

`RICE = Reach × Impact × Confidence ÷ Effort`. Each ships with a **success metric** *and* a **guardrail** — a win on one metric at the cost of another isn't a win.

| # | Recommendation | R | I | C | E | RICE | Success metric | Guardrail |
|---|---|---|---|---|---|---|---|---|
| 1 | **Guided first-engagement onboarding** — nudge one like/follow/gift in session 1 | 9 | 3 | 0.8 | 2 | **10.8** | D7 return; % new users with a day-1 engagement | Session length doesn't drop |
| 2 | Per-language supply-health monitor → seed thin languages | 7 | 2 | 0.6 | 2 | 4.2 | % languages with fresh daily supply; feed CTR in thin langs | Content quality / takedown rate |
| 3 | Creator earnings dashboard — transparent reach + payout per post | 5 | 3 | 0.7 | 3 | 3.5 | Creator D30 retention; posts / active creator | Payout support-ticket volume |
| 4 | Ad-load A/B by session depth (lighter early, heavier once engaged) | 8 | 2 | 0.6 | 2 | 4.8 | Revenue / session **without** session-length loss | Session length; D7 return |
| 5 | Shareable "card" format optimized for WhatsApp preview | 9 | 2 | 0.5 | 1 | 9.0 | Share rate; invite → install conversion | Spam / abuse reports |

*(Sorted by RICE in the app; shown here grouped by theme.)*

**Do-first:** #1 (guided first-engagement) — cheap, high-reach, and it hits the funnel's worst leak. #5 (WhatsApp card) is the next-best cheap bet because it feeds the viral loop directly.

---

## 9 · How I'd measure it — and how this connects to Pulse

A teardown without a way to measure it is just an opinion. **Pulse** (the rest of this app) is the instrument:

- **Retention view** → watch-through %, cohort retention vs. benchmark (Recs #1, #4 guardrail)
- **Moderation view** → takedown rate, time-to-decision (Rec #2 guardrail, #5 guardrail)
- **Breakout view** → which content to promote, validated by precision/recall (feeds Rec #2)
- **Creators view** → creator D30 retention, one-hit vs. repeatable (Rec #3)

Each recommendation names a metric that already lives in a Pulse dashboard — so the loop from *hypothesis → ship → measure → learn* is closed, not hand-waved.

---

## 10 · Risks & open questions

- **Is gifting revenue too top-creator-concentrated to be the growth engine?** Need the Gini of gifting revenue by creator before betting the mix-shift on it.
- **Does language-level feed tuning fragment the catalog** and hurt cross-language discovery of breakout content? A/B before rollout.
- **What's the real cost of a false-positive promotion** (Breakout model)? That number sets the breakout-score threshold — it's a business input, not a modelling one.
- **Regulatory / safety load** scales with vernacular volume and live payments; moderation capacity is a first-class constraint, not an afterthought.

---

*Written by Diya Mittal as a Product Analyst portfolio artifact. All specific figures are illustrative assumptions, not published ShareChat data.*
