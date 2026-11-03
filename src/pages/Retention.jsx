import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getAll } from '../lib/data.js';
import { HOURS, aggregateRetention, benchmarkBand, fmtNum } from '../lib/metrics.js';
import KpiCard from '../components/KpiCard.jsx';

export default function Retention() {
  const [d, setD] = useState(null);
  const [language, setLanguage] = useState('Hindi');
  const [genre, setGenre] = useState('Comedy');
  useEffect(() => { getAll().then(setD); }, []);

  const view = useMemo(() => {
    if (!d) return null;
    const cohort = d.posts.filter((p) => p.language === language && p.genre === genre);
    const agg = aggregateRetention(cohort);           // DAU-weighted cohort retention
    const band = benchmarkBand(d.benchmarks, language, genre);
    const merged = HOURS.map((h, i) => ({
      hour: `H${h}`,
      cohort: agg[i].retention,
      p25: band[i].p25, p50: band[i].p50, p75: band[i].p75,
    }));
    const n = cohort.length;
    const totalDau = cohort.reduce((s, p) => s + p.dau, 0);
    const breakouts = cohort.filter((p) => p.breakout_score >= 70).length;
    return { merged, n, totalDau, breakouts };
  }, [d, language, genre]);

  if (!view) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <h1>Retention</h1>
      <p className="sub">DAU-weighted cohort retention plotted against its benchmark band (P25 / P50 / P75). A post is judged against fair peers — same language, same genre.</p>

      <div className="filterbar">
        <div><label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>{d.meta.languages.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label>Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>{d.meta.genres.map((x) => <option key={x}>{x}</option>)}</select></div>
      </div>

      <div className="cards">
        <KpiCard label="Posts in Cohort" value={fmtNum(view.n)} />
        <KpiCard label="Total DAU" value={fmtNum(view.totalDau)} />
        <KpiCard label="Breakouts" value={fmtNum(view.breakouts)} deltaColor="var(--green)" />
        <KpiCard label="H5 → H30 Drop" value={view.merged[0].cohort && view.merged[5].cohort ? `${(view.merged[0].cohort - view.merged[5].cohort).toFixed(1)} pts` : '—'} />
      </div>

      <div className="card">
        <div className="section-title">{language} · {genre} — retention vs. benchmark</div>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={view.merged} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} domain={[0, 'auto']} label={{ value: 'Retention %', angle: -90, position: 'insideLeft', fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="p75" name="Benchmark P75" stroke="var(--muted)" strokeDasharray="4 3" dot={false} strokeWidth={1} />
            <Line type="monotone" dataKey="p50" name="Benchmark P50 (median)" stroke="var(--blue)" strokeDasharray="5 4" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="p25" name="Benchmark P25" stroke="var(--muted)" strokeDasharray="4 3" dot={false} strokeWidth={1} />
            <Line type="monotone" dataKey="cohort" name="Cohort (DAU-weighted)" stroke="var(--accent)" dot={{ r: 3 }} strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
        <div className="legend">
          Cohort line above P50 = this slice outperforms its typical peer. Percentages are aggregated as a DAU-weighted mean, never a simple average of per-post rates (denominators differ).
        </div>
      </div>
    </div>
  );
}
