import { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ZAxis } from 'recharts';
import { getCreators, getMeta } from '../lib/data.js';
import { toCSV, downloadCSV, fmtNum } from '../lib/metrics.js';

const TIER_COLORS = { Rising: 'var(--muted)', Established: 'var(--blue)', Top: 'var(--purple)', VIP: 'var(--accent)' };

export default function Creators() {
  const [creators, setCreators] = useState(null);
  const [meta, setMeta] = useState(null);
  const [language, setLanguage] = useState('All');
  const [sort, setSort] = useState({ key: 'breakout_rate', dir: -1 });
  useEffect(() => { getCreators().then(setCreators); getMeta().then(setMeta); }, []);

  const rows = useMemo(() => {
    if (!creators) return [];
    let r = language === 'All' ? creators : creators.filter((c) => c.language === language);
    return [...r].filter((c) => c.total_posts >= 3).sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      return typeof av === 'string' ? sort.dir * av.localeCompare(bv) : sort.dir * (av - bv);
    });
  }, [creators, language, sort]);

  if (!creators || !meta) return <div className="loading">Loading…</div>;
  const setSortKey = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }));
  const scatter = rows.map((c) => ({ x: c.avg_h10_ret, y: c.breakout_rate, z: c.total_dau, tier: c.tier, name: c.name }));

  const exportCSV = () => {
    const cols = [['creator_id'], ['name'], ['language'], ['tier'], ['total_posts'], ['avg_h10_ret'], ['breakout_posts'], ['breakout_rate'], ['total_dau']]
      .map(([k]) => ({ key: k, label: k }));
    downloadCSV('pulse_creators.csv', toCSV(rows, cols));
  };

  return (
    <div className="page">
      <h1>Creators</h1>
      <p className="sub">Who is worth investing in? A repeatable creator (high breakout rate) beats a one-hit one, even at similar average retention.</p>

      <div className="filterbar">
        <div><label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}><option>All</option>{meta.languages.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div style={{ alignSelf: 'flex-end' }}><button className="iconbtn" onClick={exportCSV}>⭳ Export CSV</button></div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Avg H10 retention vs. breakout rate (bubble = total DAU)</div>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" dataKey="x" name="Avg H10 Ret" unit="%" tick={{ fontSize: 11, fill: 'var(--muted)' }} label={{ value: 'Avg H10 Retention %', position: 'insideBottom', offset: -5, fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Breakout Rate" unit="%" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <ZAxis type="number" dataKey="z" range={[30, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            {['VIP', 'Top', 'Established', 'Rising'].map((tier) => (
              <Scatter key={tier} name={tier} data={scatter.filter((s) => s.tier === tier)} fill={TIER_COLORS[tier]} fillOpacity={0.6} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="legend">
          {['VIP', 'Top', 'Established', 'Rising'].map((t) => <span key={t}><span className="sw" style={{ background: TIER_COLORS[t] }} />{t}</span>)}
        </div>
      </div>

      <div className="tablewrap">
        <table>
          <thead><tr>
            {[['name', 'Creator'], ['language', 'Lang'], ['tier', 'Tier'], ['total_posts', 'Posts'],
              ['avg_h10_ret', 'Avg H10'], ['breakout_posts', 'Breakouts'], ['breakout_rate', 'Breakout %'], ['total_dau', 'Total DAU']].map(([k, l]) =>
              <th key={k} onClick={() => setSortKey(k)}>{l}{sort.key === k ? (sort.dir < 0 ? ' ▾' : ' ▴') : ''}</th>)}
          </tr></thead>
          <tbody>
            {rows.slice(0, 80).map((c) => (
              <tr key={c.creator_id}>
                <td>{c.name}</td><td>{c.language}</td>
                <td><span className="pill" style={{ color: TIER_COLORS[c.tier], background: 'var(--surface-2)' }}>{c.tier}</span></td>
                <td className="mono">{c.total_posts}</td>
                <td className="mono">{c.avg_h10_ret}%</td>
                <td className="mono">{c.breakout_posts}</td>
                <td className="mono" style={{ fontWeight: 700 }}>{c.breakout_rate}%</td>
                <td className="mono">{fmtNum(c.total_dau)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
