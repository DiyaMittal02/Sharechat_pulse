import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getFunnel } from '../lib/data.js';
import { fmtNum } from '../lib/metrics.js';
import KpiCard from '../components/KpiCard.jsx';

export default function Moderation() {
  const [f, setF] = useState(null);
  useEffect(() => { getFunnel().then(setF); }, []);
  if (!f) return <div className="loading">Loading…</div>;

  const top = f.stages[0].count;
  const stageRows = f.stages.map((s, i) => ({
    ...s,
    conversion: +((s.count / top) * 100).toFixed(1),
    drop: i === 0 ? 0 : +(((f.stages[i - 1].count - s.count) / f.stages[i - 1].count) * 100).toFixed(1),
  }));

  return (
    <div className="page">
      <h1>Moderation Funnel</h1>
      <p className="sub">Trust & safety pipeline as a conversion funnel — measure drop-off at each stage, not just the endpoints.</p>

      <div className="cards">
        <KpiCard label="Avg Time-to-Decision" value={`${f.avg_time_to_decision_h}h`} />
        <KpiCard label="Takedown Rate" value={`${f.takedown_rate}%`} deltaColor="var(--red)" />
        <KpiCard label="Reached Human Review" value={fmtNum(f.stages[3].count)} />
        <KpiCard label="Decisions Made" value={fmtNum(f.stages[4].count)} />
      </div>

      <div className="row">
        <div className="card">
          <div className="section-title">Stage-by-stage volume</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stageRows} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="legend">Most volume clears auto-moderation; the Human Review stage is where content stalls.</div>
        </div>

        <div className="card">
          <div className="section-title">Takedown rate by language — fairness cut</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={f.by_language} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="language" tick={{ fontSize: 9, fill: 'var(--muted)' }} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} unit="%" />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="takedown_rate" radius={[4, 4, 0, 0]}>
                {f.by_language.map((r, i) => <Cell key={i} fill={r.takedown_rate > f.takedown_rate * 1.3 ? 'var(--red)' : 'var(--accent)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="legend">Languages in red are &gt;30% above the platform mean takedown rate — a flag for either a content or a moderation-bias problem worth investigating.</div>
        </div>
      </div>
    </div>
  );
}
