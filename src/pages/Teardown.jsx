import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ReferenceLine, Cell } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────
// Product Teardown — ShareChat / Moj
// A product-thinking artifact (not analytics on the demo data). Numbers marked
// "assumption" are illustrative hypotheses to reason with, not published facts.
// ─────────────────────────────────────────────────────────────────────────

const PERSONAS = [
  { name: 'Bharat Consumer', who: 'Tier-2/3, 18–34, vernacular-first, first-smartphone', job: 'Kill boredom in my own language; feel seen', pain: 'English-first apps feel alien; data is precious', color: 'var(--accent)' },
  { name: 'Aspiring Creator', who: 'Small-town talent, phone-only production', job: 'Get discovered & earn without English or a studio', pain: 'Reels/Shorts favour polished, metro creators', color: 'var(--purple)' },
  { name: 'Established Creator', who: '100K+ followers, monetizing', job: 'Predictable income + audience I own', pain: 'Payouts unclear; reach feels algorithm-locked', color: 'var(--blue)' },
  { name: 'Advertiser / SMB', who: 'Regional brands, D2C', job: 'Reach vernacular India cheaply, measurably', pain: 'Hard to target by language/region with proof of ROI', color: 'var(--green)' },
];

const LOOP = [
  { step: 'Creator posts in a regional language', note: 'Low production bar = high supply' },
  { step: 'Feed matches content to same-language consumers', note: 'Language is the core targeting signal' },
  { step: 'Consumers engage (watch, like, gift, share)', note: 'Gifting + shares = creator signal + distribution' },
  { step: 'Creator earns + sees reach → posts more', note: 'Reward closes the loop' },
  { step: 'Shares pull new users into the app', note: 'Viral side-loop (WhatsApp-driven in India)' },
];

// Activation funnel — illustrative assumption to show funnel thinking.
const FUNNEL = [
  { stage: 'Install', value: 100, fill: 'var(--accent)' },
  { stage: 'Pick language + first feed', value: 82, fill: '#f0792f' },
  { stage: 'First meaningful session (5+ posts)', value: 54, fill: '#f59e0b' },
  { stage: 'First engagement (like/follow/gift)', value: 31, fill: '#eab308' },
  { stage: 'D7 return', value: 18, fill: 'var(--green)' },
];

const METRIC_TREE = {
  north: 'Weekly Engaged Time per User (in-language)',
  why: 'Time captures the real value exchange better than DAU (vanity) or installs (leaky). In-language because that is ShareChat\'s moat — a minute in Bhojpuri is worth more than a minute of generic content.',
  drivers: [
    { k: 'Supply', metrics: ['Posts/active creator', 'Creator D30 retention', '% languages with fresh daily supply'] },
    { k: 'Matching', metrics: ['Feed CTR', 'Watch-through %', 'Scroll depth / session'] },
    { k: 'Demand', metrics: ['Sessions/WAU', 'Session length', 'Engagement rate'] },
    { k: 'Loop health', metrics: ['Creator payout/earning', 'Share rate', 'Invite → install conversion'] },
  ],
};

const FINDINGS = [
  { t: 'Activation leaks at "first engagement"', d: 'The steepest funnel drop (assumption: ~54%→31%) is from first session to first like/follow/gift. A consuming-only user is a churning user — passive viewers don\'t form the social bonds that drive D7 return.', tag: 'Retention' },
  { t: 'Creator payout opacity weakens the loop', d: 'Creators post because the reward is visible and predictable. If earnings/reach feel like a black box, supply from the long tail dries up — and the long tail is exactly where vernacular breadth comes from.', tag: 'Supply' },
  { t: 'Monetization vs. experience tension', d: 'Vernacular users are price-sensitive on data and attention. Over-dense ads buy short-term revenue but tax the very session-length that is the North Star. The teardown\'s core trade-off.', tag: 'Monetization' },
  { t: 'Language is underused as a growth lever', d: 'Language is treated as a setting, not a product surface. Supply/demand balance differs wildly by language; a single global feed model under-serves thin-supply languages.', tag: 'Growth' },
];

// RICE: score = Reach × Impact × Confidence / Effort
const RECS = [
  { r: 'Guided "first engagement" onboarding — nudge one like/follow/gift in session 1', reach: 9, impact: 3, conf: 0.8, effort: 2, metric: 'D7 return; % new users with a day-1 engagement', guard: 'No drop in session length' },
  { r: 'Creator earnings dashboard — transparent reach + payout, per post', reach: 5, impact: 3, conf: 0.7, effort: 3, metric: 'Creator D30 retention; posts/active creator', guard: 'Support-ticket volume on payouts' },
  { r: 'Per-language supply-health monitor → seed thin languages', reach: 7, impact: 2, conf: 0.6, effort: 2, metric: '% languages with fresh daily supply; feed CTR in thin langs', guard: 'Content quality / takedown rate' },
  { r: 'Ad-load A/B by session depth (lighter early, heavier for engaged users)', reach: 8, impact: 2, conf: 0.6, effort: 2, metric: 'Revenue/session WITHOUT session-length loss', guard: 'Session length; D7 return' },
  { r: 'Shareable "card" format optimized for WhatsApp preview', reach: 9, impact: 2, conf: 0.5, effort: 1, metric: 'Share rate; invite→install conversion', guard: 'Spam/abuse reports' },
].map((x) => ({ ...x, score: +((x.reach * x.impact * x.conf) / x.effort).toFixed(1) }))
  .sort((a, b) => b.score - a.score);

const TAG_FILL = { Retention: 'var(--blue)', Supply: 'var(--purple)', Monetization: 'var(--amber)', Growth: 'var(--green)' };

const COMPETITORS = [
  { name: 'ShareChat / Moj', user: 'Tier-2/3, vernacular-first', lang: 'Deep — 15+ Indian languages as the core targeting signal', money: 'Live gifting + ads; long-tail creator focus', moat: 'Vernacular supply + Bharat distribution', weak: 'Monetization depth / ARPU; profitability pressure', me: true },
  { name: 'Instagram Reels', user: 'Metro + urban, aspirational', lang: 'Shallow — language is incidental, not a surface', money: 'Mature ads + brand deals (off-platform)', moat: 'Existing social graph + creator gravity', weak: 'Under-serves small-town, non-English creators' },
  { name: 'YouTube Shorts', user: 'Broad, cross-lingual', lang: 'Medium — strong captions/search, weak feed targeting', money: 'Best-in-class creator payouts (AdSense)', moat: 'Payout trust + long-form funnel', weak: 'Shorts cannibalize long-form; discovery less community-led' },
  { name: 'Josh (VerSe)', user: 'Tier-2/3, vernacular — direct rival', lang: 'Deep — same Bharat thesis', money: 'Ads + gifting, similar model', weak: 'Same monetization ceiling; differentiation is thin', moat: 'Dailyhunt distribution + news cross-sell' },
];

// Positioning: x = language/vernacular depth, y = monetization maturity (0–10, assumption)
const POSITIONING = [
  { name: 'ShareChat / Moj', x: 9, y: 4, fill: 'var(--accent)' },
  { name: 'Josh', x: 8.5, y: 3.5, fill: 'var(--purple)' },
  { name: 'Instagram Reels', x: 3, y: 9, fill: 'var(--blue)' },
  { name: 'YouTube Shorts', x: 6, y: 8.5, fill: 'var(--green)' },
];

const MONETIZATION = [
  { stream: 'Feed & video ads', how: 'Interstitial + in-feed ads sold on reach, targetable by language/region', strength: 'Scales with DAU; the volume play', tension: 'Low ARPU in Bharat + ad-load taxes session length (the North Star)', color: 'var(--amber)' },
  { stream: 'Live streaming + virtual gifting', how: 'Viewers buy coins, gift creators live; platform takes a cut', strength: 'High-margin, creator-aligned, emotionally sticky', tension: 'Concentrated in top creators; needs trust & safety on payments', color: 'var(--green)' },
  { stream: 'Creator tools / subscriptions', how: 'Premium effects, fan subscriptions, tipping', strength: 'Deepens the loop; recurring, less ad-dependent', tension: 'Price sensitivity; still nascent in vernacular India', color: 'var(--purple)' },
  { stream: 'Commerce / affiliate', how: 'Shoppable content, SMB/D2C tie-ups by region', strength: 'Natural fit for regional brands + intent', tension: 'Requires logistics/trust layer; long build', color: 'var(--blue)' },
];

export default function Teardown() {
  return (
    <div className="page">
      <h1>Product Teardown — ShareChat / Moj</h1>
      <p className="sub">A product-thinking artifact: who it serves, the loop that makes it work, where it leaks, and what I'd ship next — with a success metric for each bet. Figures marked <em>assumption</em> are illustrative hypotheses, not published numbers.</p>

      {/* Thesis */}
      <div className="card td-thesis">
        <strong>Thesis.</strong> ShareChat/Moj won vernacular India by making <em>language</em>, not production quality, the unit of distribution — unlocking a creator base that metro-first apps (Reels, Shorts) structurally under-serve. The open question isn't growth; it's <strong>monetizing attention without taxing the session-length that is the whole moat.</strong> Every recommendation below protects that trade-off.
      </div>

      {/* Personas */}
      <div className="td-section">
        <div className="section-title">1 · Who it serves</div>
        <div className="td-grid">
          {PERSONAS.map((p) => (
            <div key={p.name} className="card td-persona" style={{ borderTop: `3px solid ${p.color}` }}>
              <div className="td-persona-name">{p.name}</div>
              <div className="td-kv"><span>Who</span>{p.who}</div>
              <div className="td-kv"><span>Job-to-be-done</span>{p.job}</div>
              <div className="td-kv"><span>Pain</span>{p.pain}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive landscape */}
      <div className="td-section">
        <div className="section-title">2 · Competitive landscape</div>
        <p className="sub">Short-video in India is a knife-fight. ShareChat/Moj's defensible wedge is <em>vernacular depth + Bharat distribution</em> — the dimension metro-first apps structurally can't match. Josh is the real like-for-like rival; the global apps compete for attention but not for the same creator.</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Player</th><th>Core user</th><th>Language depth</th><th>Creator monetization</th><th>Moat</th><th>Biggest weakness</th></tr></thead>
            <tbody>
              {COMPETITORS.map((c) => (
                <tr key={c.name} style={c.me ? { background: 'var(--accent-soft)' } : null}>
                  <td style={{ fontWeight: 700, whiteSpace: 'normal', minWidth: 120 }}>{c.name}{c.me && ' ◂'}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 130 }} className="chip">{c.user}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 170 }} className="chip">{c.lang}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 150 }} className="chip">{c.money}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 150 }} className="chip">{c.moat}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 150 }} className="chip">{c.weak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend">Takeaway: don't fight Reels/Shorts on polish or global creators — that's their game. Defend and deepen the vernacular long tail, where the structural advantage is, and out-execute Josh on creator trust (payout transparency).</div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="section-title">Positioning — vernacular depth vs. monetization maturity <span className="chip">(assumption)</span></div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" dataKey="x" domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--muted)' }}
                label={{ value: 'Vernacular / language depth →', position: 'insideBottom', offset: -15, fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis type="number" dataKey="y" domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--muted)' }}
                label={{ value: 'Monetization maturity →', angle: -90, position: 'insideLeft', fill: 'var(--muted)', fontSize: 12 }} />
              <ZAxis range={[300, 300]} />
              <ReferenceLine x={5} stroke="var(--border)" /><ReferenceLine y={5} stroke="var(--border)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Scatter data={POSITIONING}>
                {POSITIONING.map((p, i) => <Cell key={i} fill={p.fill} fillOpacity={0.75} />)}
                <LabelList dataKey="name" position="top" fontSize={11} fill="var(--text)" />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="legend">ShareChat/Moj and Josh own the high-vernacular / lower-monetization quadrant; Reels & Shorts own high-monetization / lower-vernacular. The strategic arrow for ShareChat is <strong>straight up</strong> — grow monetization maturity <em>without</em> sliding left off the language moat.</div>
        </div>
      </div>

      {/* Business model */}
      <div className="td-section">
        <div className="section-title">3 · Business model & monetization</div>
        <p className="sub">Four revenue streams, each with a different risk/margin profile. The strategic point: ads are the volume play but tax the experience, so the growth path is <strong>shifting mix toward gifting, subscriptions and commerce</strong> that align with (not against) session length.</p>
        <div className="td-grid">
          {MONETIZATION.map((m) => (
            <div key={m.stream} className="card" style={{ borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{m.stream}</div>
              <div className="td-kv"><span>How it works</span>{m.how}</div>
              <div className="td-kv"><span>Strength</span>{m.strength}</div>
              <div className="td-kv"><span>Tension</span>{m.tension}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth loop */}
      <div className="td-section">
        <div className="section-title">4 · The core growth loop</div>
        <div className="card">
          <div className="td-loop">
            {LOOP.map((l, i) => (
              <div key={i} className="td-loop-step">
                <div className="td-loop-num">{i + 1}</div>
                <div>
                  <div className="td-loop-title">{l.step}</div>
                  <div className="chip">{l.note}</div>
                </div>
                {i < LOOP.length - 1 && <div className="td-loop-arrow">↓</div>}
              </div>
            ))}
          </div>
          <div className="legend">A self-reinforcing loop: supply is cheap (low production bar), language does the matching, and gifting + shares both reward creators and distribute content. The share step is a second, viral loop — in India, largely WhatsApp-driven.</div>
        </div>
      </div>

      {/* North star + metric tree */}
      <div className="td-section">
        <div className="section-title">5 · North Star & metric tree</div>
        <div className="row">
          <div className="card">
            <div className="td-northstar">
              <div className="chip" style={{ fontWeight: 700 }}>NORTH STAR</div>
              <div className="td-ns-value">{METRIC_TREE.north}</div>
              <p className="sub" style={{ margin: 0 }}>{METRIC_TREE.why}</p>
            </div>
          </div>
          <div className="card">
            <div className="td-tree">
              {METRIC_TREE.drivers.map((d) => (
                <div key={d.k} className="td-tree-branch">
                  <div className="td-tree-driver">{d.k}</div>
                  <div className="td-tree-metrics">
                    {d.metrics.map((m) => <span key={m} className="pill" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>{m}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="td-section">
        <div className="section-title">6 · Activation funnel — where it leaks</div>
        <div className="card">
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Funnel dataKey="value" data={FUNNEL} isAnimationActive>
                <LabelList position="right" fill="var(--text)" stroke="none" dataKey="stage" fontSize={12} />
                <LabelList position="left" fill="var(--muted)" stroke="none" dataKey="value" fontSize={12} formatter={(v) => `${v}%`} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="legend">Illustrative (assumption). The steepest drop is first-session → first-engagement: passive viewers don't form the social bonds that drive return. That's the highest-leverage place to intervene — and recommendation #1 targets it.</div>
        </div>
      </div>

      {/* Findings */}
      <div className="td-section">
        <div className="section-title">7 · Teardown findings</div>
        <div className="td-grid">
          {FINDINGS.map((f) => (
            <div key={f.t} className="card">
              <span className="pill" style={{ color: TAG_FILL[f.tag], background: 'var(--surface-2)', marginBottom: 8, display: 'inline-block' }}>{f.tag}</span>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.t}</div>
              <div className="sub" style={{ margin: 0 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RICE recommendations */}
      <div className="td-section">
        <div className="section-title">8 · Prioritized recommendations (RICE)</div>
        <p className="sub">Score = Reach × Impact × Confidence ÷ Effort. Each ships with a success metric <em>and</em> a guardrail — because a win on one metric at the cost of another isn't a win.</p>
        <div className="tablewrap">
          <table>
            <thead><tr>
              <th>#</th><th>Recommendation</th><th>R</th><th>I</th><th>C</th><th>E</th><th>RICE</th><th>Success metric</th><th>Guardrail</th>
            </tr></thead>
            <tbody>
              {RECS.map((x, i) => (
                <tr key={i}>
                  <td className="mono">{i + 1}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 220 }}>{x.r}</td>
                  <td className="mono">{x.reach}</td>
                  <td className="mono">{x.impact}</td>
                  <td className="mono">{x.conf}</td>
                  <td className="mono">{x.effort}</td>
                  <td className="mono" style={{ fontWeight: 800, color: 'var(--accent)' }}>{x.score}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 180 }} className="chip">{x.metric}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 120 }} className="chip">{x.guard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend">Top of the list (guided first-engagement onboarding) is cheap, high-reach, and hits the funnel's worst leak — the classic "do this first" bet.</div>
      </div>

      {/* How this connects to Pulse */}
      <div className="td-section">
        <div className="section-title">9 · How this connects to Pulse</div>
        <div className="card">
          Pulse (the rest of this app) is the <strong>instrument</strong> that would measure these bets: the Retention view tracks watch-through and cohort health, Moderation tracks the safety guardrail, Breakout finds the content worth promoting, and Creators tracks supply-side retention. A teardown without a way to measure it is just an opinion — Pulse is how I'd close the loop.
        </div>
      </div>
    </div>
  );
}
