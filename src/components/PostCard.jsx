import { HOURS, benchmarkAt, benchColor, performanceTag, TAG_COLORS, fmtNum } from '../lib/metrics.js';
import Sparkline from './Sparkline.jsx';

const STATUS_COLORS = {
  published: 'var(--muted)', promoted: 'var(--green)', in_review: 'var(--amber)',
  flagged: 'var(--amber)', taken_down: 'var(--red)',
};

// Card view of a post — mirrors Scout's ShowCard F-pattern: title zone,
// subtitle meta, metric row, retention curve.
export default function PostCard({ post, benchmarks }) {
  const t = performanceTag(post, benchmarks);
  const accent = post.status === 'taken_down' ? 'var(--red)' : post.breakout_score >= 70 ? 'var(--green)' : 'var(--accent)';
  return (
    <div className="postcard" style={{ borderLeft: `3px solid ${accent}` }}>
      {/* Zone 1 — title + breakout score */}
      <div className="pc-head">
        <div className="pc-title" title={post.title}>{post.title}</div>
        <div className="pc-score mono" title="Breakout score">{post.breakout_score}</div>
      </div>

      {/* Zone 2 — creator + tags */}
      <div className="pc-sub">
        <span>{post.creator_name}</span>
        <span className="chip">· {post.creator_tier}</span>
        <span className="pill" style={{ color: STATUS_COLORS[post.status], background: 'var(--surface-2)' }}>{post.status}</span>
      </div>

      {/* Zone 3 — meta line */}
      <div className="pc-meta">
        <span>{post.language}</span><span className="pc-dot">·</span>
        <span>{post.genre}</span><span className="pc-dot">·</span>
        <span>{post.format}</span>
      </div>

      {/* Zone 4 — metric row */}
      <div className="pc-metrics">
        <div><div className="pc-m-label">LLM</div><div className="pc-m-val mono">{post.llm_score}</div></div>
        <div><div className="pc-m-label">DAU</div><div className="pc-m-val mono">{fmtNum(post.dau)}</div></div>
        <div><div className="pc-m-label">Watch-thru</div><div className="pc-m-val mono">{post.watch_through}%</div></div>
      </div>

      {/* Zone 5 — retention cells + curve */}
      <div className="pc-ret">
        <div className="pc-ret-cells">
          {HOURS.map((h) => {
            const bench = benchmarkAt(benchmarks, post.language, post.genre, h, 'p50');
            return (
              <div key={h} className="pc-ret-cell">
                <span className="pc-ret-h">H{h}</span>
                <span className="mono" style={{ color: benchColor(post[`h${h}_ret`], bench), fontWeight: 700 }}>{post[`h${h}_ret`]}</span>
              </div>
            );
          })}
        </div>
        <Sparkline post={post} width={74} height={30} />
      </div>

      {/* Zone 6 — performance tag */}
      <div className="pc-foot">
        <span className="pill" style={{ color: TAG_COLORS[t.key], background: 'var(--surface-2)' }}>{t.tag}</span>
        <span className="chip mono">{post.id}</span>
      </div>
    </div>
  );
}
