// ─────────────────────────────────────────────────────────────────────────
// Pulse synthetic data generator
//
// Produces an internally-consistent corpus for a ShareChat-style multi-language
// social platform. Design goals (what an analyst should be able to defend):
//   1. Retention curves decay by genre — some sticky, some fast-decay.
//   2. ~12% of posts are injected "breakouts" with flatter curves.
//   3. Benchmarks are COMPUTED from the generated data (percentiles per
//      language × genre × hour) — never hard-coded, so colour-coding is fair.
//   4. Engagement (DAU) is loosely correlated with retention, not identical.
//   5. A moderation funnel with realistic stage drop-off + time-to-decision.
//
// Output: public/data/{posts,benchmarks,creators,funnel,meta}.json
// ─────────────────────────────────────────────────────────────────────────
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/data');
mkdirSync(OUT, { recursive: true });

// ── Seeded RNG (mulberry32) so the dataset is reproducible ──────────────────
let _seed = 42;
function rng() {
  _seed |= 0; _seed = (_seed + 0x6D2B79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const rand = (a, b) => a + rng() * (b - a);
const randint = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[randint(0, arr.length - 1)];
const gauss = (mean, sd) => { // Box-Muller
  const u = Math.max(rng(), 1e-9), v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ── Dimensions ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  ['Hindi', 0.26], ['Bhojpuri', 0.10], ['Tamil', 0.09], ['Telugu', 0.09],
  ['Marathi', 0.07], ['Bengali', 0.07], ['Kannada', 0.06], ['Malayalam', 0.05],
  ['Gujarati', 0.05], ['Punjabi', 0.04], ['Odia', 0.03], ['Haryanvi', 0.03],
  ['Rajasthani', 0.02], ['Assamese', 0.02], ['Urdu', 0.02],
];
// genre → [base retention rate at H5, decay constant k]. Higher k = faster decay.
const GENRES = {
  Devotional: [0.72, 0.018], Comedy: [0.66, 0.030], Romance: [0.64, 0.034],
  Dance: [0.60, 0.040], Education: [0.58, 0.016], News: [0.55, 0.055],
  Food: [0.57, 0.028], Sports: [0.59, 0.045], Beauty: [0.54, 0.038],
  Gaming: [0.56, 0.042],
};
const FORMATS = ['Short Video', 'Short Video', 'Short Video', 'Image', 'Live'];
const HOURS = [5, 10, 15, 20, 25, 30];
const TIERS = ['Rising', 'Established', 'Top', 'VIP'];
const STATUSES = ['published', 'promoted', 'in_review', 'flagged', 'taken_down'];

// ── Transliteration-ish romanized title (demo: keeps the multi-language story) ─
const TITLE_WORDS = {
  Devotional: ['Bhakti', 'Aarti', 'Mandir', 'Satsang', 'Katha'],
  Comedy: ['Masti', 'Hasi', 'Comedy', 'Funny', 'Prank'],
  Romance: ['Pyaar', 'Ishq', 'Dil', 'Mohabbat', 'Yaad'],
  Dance: ['Dance', 'Thumka', 'Beat', 'Nach', 'Step'],
  Education: ['Gyaan', 'Padhai', 'Tips', 'Learn', 'Fact'],
  News: ['Khabar', 'Breaking', 'News', 'Update', 'Alert'],
  Food: ['Recipe', 'Swaad', 'Khana', 'Chaat', 'Mithai'],
  Sports: ['Cricket', 'Match', 'Goal', 'Khel', 'Winner'],
  Beauty: ['Makeup', 'Glow', 'Style', 'Look', 'Fashion'],
  Gaming: ['Gaming', 'Battle', 'Win', 'Pro', 'Clutch'],
};
const FIRST = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vijay', 'Anjali', 'Ravi', 'Pooja',
  'Karan', 'Neha', 'Arjun', 'Divya', 'Suresh', 'Meena', 'Rohit', 'Kavya'];
const LAST = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Das', 'Singh', 'Gowda',
  'Iyer', 'Khan', 'Yadav', 'Mehta'];

function weightedLanguage() {
  const r = rng(); let acc = 0;
  for (const [lang, w] of LANGUAGES) { acc += w; if (r <= acc) return lang; }
  return LANGUAGES[0][0];
}

// ── Build creators ───────────────────────────────────────────────────────────
const N_CREATORS = 400;
const creators = [];
for (let i = 0; i < N_CREATORS; i++) {
  const language = weightedLanguage();
  // creator "quality" skews their posts' retention; a few are stars
  const quality = Math.min(1.25, Math.max(0.75, gauss(1.0, 0.12)));
  const tierRoll = rng();
  const tier = tierRoll > 0.96 ? 'VIP' : tierRoll > 0.85 ? 'Top' : tierRoll > 0.55 ? 'Established' : 'Rising';
  creators.push({
    creator_id: `cr_${String(i).padStart(4, '0')}`,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    language, tier, quality,
    joined_at: new Date(Date.now() - randint(30, 1400) * 864e5).toISOString().slice(0, 10),
  });
}

// ── Build posts ────────────────────────────────────────────────────────────
const N_POSTS = 6000;
const posts = [];
const NOW = Date.now();
for (let i = 0; i < N_POSTS; i++) {
  const creator = pick(creators);
  const language = creator.language;
  const genre = pick(Object.keys(GENRES));
  const [base, k] = GENRES[genre];
  const isBreakout = rng() < 0.12;

  // retention curve: base * quality * exp(-k*h), breakouts decay ~60% slower
  const kEff = isBreakout ? k * 0.4 : k;
  const baseEff = base * creator.quality * (isBreakout ? 1.12 : 1) * (1 + gauss(0, 0.06));
  const ret = {};
  HOURS.forEach((h) => {
    let v = baseEff * Math.exp(-kEff * (h - 5)) + gauss(0, 0.02);
    v = Math.max(0.02, Math.min(0.98, v));
    ret[`h${h}_ret`] = +(v * 100).toFixed(1);
  });

  // engagement loosely tracks H10 retention + noise
  const dau = Math.max(50, Math.round((ret.h10_ret * rand(80, 240)) + gauss(0, 1500)));
  const watch_through = +Math.max(5, Math.min(95, ret.h20_ret * rand(0.8, 1.1))).toFixed(1);
  const llm_score = +Math.max(5, Math.min(99, baseEff * 100 * rand(0.85, 1.1))).toFixed(1);

  // status + moderation timing
  const sRoll = rng();
  let status = sRoll > 0.93 ? 'taken_down' : sRoll > 0.86 ? 'flagged'
    : sRoll > 0.78 ? 'in_review' : sRoll > 0.62 ? 'promoted' : 'published';
  // promoted posts skew toward breakouts
  if (isBreakout && status === 'published' && rng() < 0.5) status = 'promoted';
  const ingested = NOW - randint(1, 90) * 864e5 - randint(0, 23) * 36e5;
  // time-to-decision: most fast, a tail stalls in human review
  const ttdHours = status === 'in_review' ? null
    : +(Math.max(0.2, gauss(status === 'flagged' ? 9 : 3, status === 'flagged' ? 6 : 2))).toFixed(1);

  const word = pick(TITLE_WORDS[genre]);
  posts.push({
    id: `p_${String(i).padStart(5, '0')}`,
    title: `${word} ${randint(1, 999)}`,
    titleRomanized: `${word.toLowerCase()} ${language.toLowerCase()}`,
    creator_id: creator.creator_id,
    creator_name: creator.name,
    creator_tier: creator.tier,
    language, genre, format: pick(FORMATS),
    published_at: new Date(ingested).toISOString(),
    status,
    is_breakout_truth: isBreakout, // ground truth, used to measure breakout-model precision
    llm_score,
    dau,
    watch_through,
    time_to_decision_h: ttdHours,
    ...ret,
  });
}

// ── Derive benchmarks: percentiles per language × genre × hour ───────────────
function pctile(sorted, p) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return +(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)).toFixed(1);
}
const benchmarks = {}; // benchmarks[lang][genre][h] = {p10,p25,p50,p75,p90}
const groups = {};
for (const p of posts) {
  for (const h of HOURS) {
    const key = `${p.language}|${p.genre}|${h}`;
    (groups[key] ||= []).push(p[`h${h}_ret`]);
  }
}
for (const [key, vals] of Object.entries(groups)) {
  const [lang, genre, h] = key.split('|');
  vals.sort((a, b) => a - b);
  ((benchmarks[lang] ||= {})[genre] ||= {})[h] = {
    p10: pctile(vals, 0.10), p25: pctile(vals, 0.25), p50: pctile(vals, 0.50),
    p75: pctile(vals, 0.75), p90: pctile(vals, 0.90), n: vals.length,
  };
}

// ── Simple breakout SCORE (heuristic; transparent for a demo) ────────────────
// Blend: early retention lift vs. cohort P50 + watch-through. 0–100.
for (const p of posts) {
  const bm = benchmarks[p.language]?.[p.genre];
  let lift = 0, cnt = 0;
  for (const h of [5, 10, 15]) {
    const med = bm?.[h]?.p50;
    if (med) { lift += (p[`h${h}_ret`] - med) / med; cnt++; }
  }
  lift = cnt ? lift / cnt : 0;
  const score = Math.max(0, Math.min(100, 50 + lift * 180 + (p.watch_through - 40) * 0.4));
  p.breakout_score = +score.toFixed(1);
}

// ── Creator rollups ──────────────────────────────────────────────────────────
const byCreator = {};
for (const p of posts) (byCreator[p.creator_id] ||= []).push(p);
const creatorsOut = creators.map((c) => {
  const cp = byCreator[c.creator_id] || [];
  const avgH10 = cp.length ? +(cp.reduce((s, p) => s + p.h10_ret, 0) / cp.length).toFixed(1) : 0;
  const breakouts = cp.filter((p) => p.breakout_score >= 70).length;
  return {
    creator_id: c.creator_id, name: c.name, language: c.language, tier: c.tier,
    joined_at: c.joined_at, total_posts: cp.length,
    avg_h10_ret: avgH10,
    breakout_posts: breakouts,
    breakout_rate: cp.length ? +(breakouts / cp.length * 100).toFixed(1) : 0,
    total_dau: cp.reduce((s, p) => s + p.dau, 0),
  };
});

// ── Moderation funnel rollup ─────────────────────────────────────────────────
const funnel = (() => {
  const total = posts.length;
  const autoCleared = posts.filter((p) => p.status !== 'flagged' && p.status !== 'taken_down' && p.status !== 'in_review').length + posts.filter(p => p.status === 'in_review').length;
  const stages = [
    { stage: 'Ingestion', count: total },
    { stage: 'Auto-Moderation', count: total },
    { stage: 'LLM Scoring', count: total },
    { stage: 'Human Review', count: posts.filter((p) => ['in_review', 'flagged', 'taken_down'].includes(p.status)).length },
    { stage: 'Decision', count: posts.filter((p) => p.status !== 'in_review').length },
  ];
  const decided = posts.filter((p) => p.time_to_decision_h != null);
  const avgTtd = +(decided.reduce((s, p) => s + p.time_to_decision_h, 0) / decided.length).toFixed(1);
  const takedownRate = +(posts.filter((p) => p.status === 'taken_down').length / total * 100).toFixed(1);
  // per-language takedown rate for a fairness cut
  const byLang = {};
  for (const p of posts) {
    (byLang[p.language] ||= { total: 0, takedown: 0 });
    byLang[p.language].total++;
    if (p.status === 'taken_down') byLang[p.language].takedown++;
  }
  const langRows = Object.entries(byLang).map(([language, v]) => ({
    language, total: v.total, takedown: v.takedown,
    takedown_rate: +(v.takedown / v.total * 100).toFixed(1),
  })).sort((a, b) => b.takedown_rate - a.takedown_rate);
  return { stages, avg_time_to_decision_h: avgTtd, takedown_rate: takedownRate, by_language: langRows };
})();

// ── Meta ─────────────────────────────────────────────────────────────────────
const meta = {
  generated_at: new Date().toISOString(),
  n_posts: posts.length,
  n_creators: creatorsOut.length,
  languages: LANGUAGES.map((l) => l[0]),
  genres: Object.keys(GENRES),
  hours: HOURS,
  statuses: STATUSES,
  tiers: TIERS,
  note: 'Fully synthetic. Generated with a seeded RNG for reproducibility. Not real ShareChat data.',
};

// ── Write ─────────────────────────────────────────────────────────────────────
const w = (name, obj) => writeFileSync(resolve(OUT, name), JSON.stringify(obj));
w('posts.json', posts);
w('benchmarks.json', benchmarks);
w('creators.json', creatorsOut);
w('funnel.json', funnel);
w('meta.json', meta);

console.log(`✓ Generated ${posts.length} posts, ${creatorsOut.length} creators`);
console.log(`  avg time-to-decision: ${funnel.avg_time_to_decision_h}h · takedown rate: ${funnel.takedown_rate}%`);
console.log(`  breakout posts (score>=70): ${posts.filter((p) => p.breakout_score >= 70).length}`);
console.log(`  → ${OUT}`);
