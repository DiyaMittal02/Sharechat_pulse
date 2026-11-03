import { useState, useEffect, useMemo } from 'react';
import { getAll } from '../lib/data.js';
import { HOURS, benchmarkAt, benchColor, performanceTag, TAG_COLORS, toCSV, downloadCSV, fmtNum, fmtDate } from '../lib/metrics.js';
import Sparkline from '../components/Sparkline.jsx';
import PostCard from '../components/PostCard.jsx';

const STATUS_COLORS = {
  published: 'var(--muted)', promoted: 'var(--green)', in_review: 'var(--amber)',
  flagged: 'var(--amber)', taken_down: 'var(--red)',
};

export default function Discovery() {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ language: 'All', genre: 'All', status: 'All', tier: 'All', q: '', tag: 'All' });
  const [sort, setSort] = useState({ key: 'breakout_score', dir: -1 });
  const [limit, setLimit] = useState(50);
  const [view, setView] = useState('table');
  useEffect(() => { getAll().then(setD); }, []);

  const filtered = useMemo(() => {
    if (!d) return [];
    const q = f.q.trim().toLowerCase();
    let rows = d.posts.filter((p) =>
      (f.language === 'All' || p.language === f.language) &&
      (f.genre === 'All' || p.genre === f.genre) &&
      (f.status === 'All' || p.status === f.status) &&
      (f.tier === 'All' || p.creator_tier === f.tier) &&
      (!q || p.title.toLowerCase().includes(q) || p.titleRomanized.includes(q) || p.creator_name.toLowerCase().includes(q))
    );
    if (f.tag !== 'All') rows = rows.filter((p) => performanceTag(p, d.benchmarks).tag === f.tag);
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av == null) return 1; if (bv == null) return -1;
      return typeof av === 'string' ? sort.dir * av.localeCompare(bv) : sort.dir * (av - bv);
    });
    return rows;
  }, [d, f, sort]);

  if (!d) return <div className="loading">Loading…</div>;
  const { benchmarks, meta } = d;
  const setSortKey = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }));
  const Opt = ({ k, list }) => (
    <div><label>{k[0].toUpperCase() + k.slice(1)}</label>
      <select value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setLimit(50); }}>
        <option>All</option>{list.map((x) => <option key={x}>{x}</option>)}
      </select></div>
  );

  const exportCSV = () => {
    const cols = [
      { key: 'id', label: 'post_id' }, { key: 'title', label: 'title' }, { key: 'creator_name', label: 'creator' },
      { key: 'language', label: 'language' }, { key: 'genre', label: 'genre' }, { key: 'status', label: 'status' },
      { key: 'llm_score', label: 'llm_score' }, { key: 'dau', label: 'dau' }, { key: 'breakout_score', label: 'breakout_score' },
      ...HOURS.map((h) => ({ key: `h${h}_ret`, label: `h${h}_ret` })),
      { label: 'performance_tag', get: (p) => performanceTag(p, benchmarks).tag },
    ];
    downloadCSV('pulse_discovery.csv', toCSV(filtered, cols));
  };

  return (
    <div className="page">
      <h1>Discovery</h1>
      <p className="sub">Search and filter the content corpus. Retention cells are colour-coded vs. the language × genre median benchmark.</p>

      <div className="filterbar">
        <div><label>Search</label><input placeholder="title / creator…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
        <Opt k="language" list={meta.languages} />
        <Opt k="genre" list={meta.genres} />
        <Opt k="status" list={meta.statuses} />
        <Opt k="tier" list={meta.tiers} />
        <div><label>Performance</label>
          <select value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>
            {['All', 'Outperformer', 'Above Average', 'Mixed', 'Needs Attention', 'Insufficient Data'].map((t) => <option key={t}>{t}</option>)}
          </select></div>
      </div>

      <div className="toolbar">
        <span className="chip">{fmtNum(filtered.length)} posts match</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="viewtoggle">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>☰ Table</button>
            <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>▦ Cards</button>
          </div>
          <button className="iconbtn" onClick={exportCSV}>⭳ Export CSV</button>
        </div>
      </div>

      {view === 'cards' ? (
        filtered.length === 0
          ? <div className="empty">No posts match these filters.</div>
          : <div className="cardgrid">
              {filtered.slice(0, limit).map((p) => <PostCard key={p.id} post={p} benchmarks={benchmarks} />)}
            </div>
      ) : (
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              {[['title', 'Post'], ['creator_name', 'Creator'], ['language', 'Lang'], ['genre', 'Genre'],
                ['status', 'Status'], ['llm_score', 'LLM'], ['dau', 'DAU']].map(([k, l]) =>
                <th key={k} onClick={() => setSortKey(k)}>{l}{sort.key === k ? (sort.dir < 0 ? ' ▾' : ' ▴') : ''}</th>)}
              {HOURS.map((h) => <th key={h} onClick={() => setSortKey(`h${h}_ret`)}>H{h}</th>)}
              <th>Curve</th>
              <th onClick={() => setSortKey('breakout_score')}>Breakout{sort.key === 'breakout_score' ? (sort.dir < 0 ? ' ▾' : ' ▴') : ''}</th>
              <th>Tag</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((p) => {
              const t = performanceTag(p, benchmarks);
              return (
                <tr key={p.id}>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</td>
                  <td>{p.creator_name} <span className="chip">· {p.creator_tier}</span></td>
                  <td>{p.language}</td>
                  <td>{p.genre}</td>
                  <td><span className="pill" style={{ color: STATUS_COLORS[p.status], background: 'var(--surface-2)' }}>{p.status}</span></td>
                  <td className="mono">{p.llm_score}</td>
                  <td className="mono">{fmtNum(p.dau)}</td>
                  {HOURS.map((h) => {
                    const bench = benchmarkAt(benchmarks, p.language, p.genre, h, 'p50');
                    return <td key={h} className="ret-cell mono" style={{ color: benchColor(p[`h${h}_ret`], bench) }}>{p[`h${h}_ret`]}</td>;
                  })}
                  <td><Sparkline post={p} /></td>
                  <td className="mono" style={{ fontWeight: 700 }}>{p.breakout_score}</td>
                  <td><span className="pill" style={{ color: TAG_COLORS[t.key], background: 'var(--surface-2)' }}>{t.tag}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty">No posts match these filters.</div>}
      </div>
      )}
      {limit < filtered.length && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button className="iconbtn" onClick={() => setLimit((l) => l + 50)}>Load more ({fmtNum(filtered.length - limit)} remaining)</button>
        </div>
      )}
      <div className="legend">
        <span><span className="sw" style={{ background: 'var(--green)' }} />≥95% of benchmark</span>
        <span><span className="sw" style={{ background: 'var(--amber)' }} />80–95%</span>
        <span><span className="sw" style={{ background: 'var(--red)' }} />&lt;80%</span>
      </div>
    </div>
  );
}
