import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getAll } from '../lib/data.js';
import { performanceTag, fmtNum } from '../lib/metrics.js';
import KpiCard from '../components/KpiCard.jsx';

export default function Overview() {
  const [d, setD] = useState(null);
  useEffect(() => { getAll().then(setD); }, []);

  const derived = useMemo(() => {
    if (!d) return null;
    const { posts, benchmarks, funnel } = d;
    const breakouts = posts.filter((p) => p.breakout_score >= 70).length;
    const promoted = posts.filter((p) => p.status === 'promoted').length;
    const avgH10 = (posts.reduce((s, p) => s + p.h10_ret, 0) / posts.length).toFixed(1);
    // posts per language
    const byLang = {};
    for (const p of posts) (byLang[p.language] ||= 0), byLang[p.language]++;
    const langRows = Object.entries(byLang).map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
    // performance tag distribution
    const tagCounts = {};
    for (const p of posts) { const { tag } = performanceTag(p, benchmarks); tagCounts[tag] = (tagCounts[tag] || 0) + 1; }
    const TAG_ORDER = ['Outperformer', 'Above Average', 'Mixed', 'Needs Attention', 'Insufficient Data'];
    const TAG_FILL = { 'Outperformer': 'var(--green)', 'Above Average': 'var(--blue)', 'Mixed': 'var(--amber)', 'Needs Attention': 'var(--red)', 'Insufficient Data': 'var(--muted)' };
    const tagRows = TAG_ORDER.filter((t) => tagCounts[t]).map((tag) => ({ tag, count: tagCounts[tag], fill: TAG_FILL[tag] }));
    return { breakouts, promoted, avgH10, langRows, tagRows, funnel, total: posts.length };
  }, [d]);

  if (!derived) return <div className="loading">Loading synthetic dataset…</div>;

  return (
    <div className="page">
      <h1>Overview</h1>
      <p className="sub">Content & creator intelligence across {fmtNum(derived.total)} posts · 15 languages · fully synthetic data</p>
      <div className="banner">Demo on synthetic data generated with a seeded RNG — modeled on an internal content-intelligence tool, re-framed for a ShareChat-style platform. Not real ShareChat data.</div>

      <div className="cards">
        <KpiCard label="Total Posts" value={fmtNum(derived.total)} />
        <KpiCard label="Breakouts (score ≥70)" value={fmtNum(derived.breakouts)} delta={`${(derived.breakouts / derived.total * 100).toFixed(0)}% of corpus`} deltaColor="var(--green)" />
        <KpiCard label="Promoted" value={fmtNum(derived.promoted)} />
        <KpiCard label="Avg H10 Retention" value={`${derived.avgH10}%`} />
        <KpiCard label="Avg Time-to-Decision" value={`${derived.funnel.avg_time_to_decision_h}h`} />
        <KpiCard label="Takedown Rate" value={`${derived.funnel.takedown_rate}%`} deltaColor="var(--red)" />
      </div>

      <div className="row">
        <div className="card">
          <div className="section-title">Posts by Language</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={derived.langRows} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <YAxis type="category" dataKey="language" width={70} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Performance Tag Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={derived.tagRows} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="tag" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval={0} angle={-12} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {derived.tagRows.map((r, i) => <Cell key={i} fill={r.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="legend">Each post is tagged by the share of hours its retention beats the language × genre benchmark.</div>
        </div>
      </div>
    </div>
  );
}
