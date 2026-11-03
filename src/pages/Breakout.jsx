import { useState, useEffect, useMemo } from 'react';
import { getAll } from '../lib/data.js';
import { fmtNum } from '../lib/metrics.js';
import Sparkline from '../components/Sparkline.jsx';
import KpiCard from '../components/KpiCard.jsx';

export default function Breakout() {
  const [d, setD] = useState(null);
  const [threshold, setThreshold] = useState(70);
  useEffect(() => { getAll().then(setD); }, []);

  const m = useMemo(() => {
    if (!d) return null;
    const posts = d.posts;
    // confusion matrix vs. ground truth (is_breakout_truth) at the chosen score threshold
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const p of posts) {
      const pred = p.breakout_score >= threshold;
      const truth = p.is_breakout_truth;
      if (pred && truth) tp++; else if (pred && !truth) fp++;
      else if (!pred && truth) fn++; else tn++;
    }
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
    const flagged = tp + fp;
    const ranked = [...posts].sort((a, b) => b.breakout_score - a.breakout_score).slice(0, 60);
    return { precision, recall, f1, tp, fp, fn, flagged, ranked };
  }, [d, threshold]);

  if (!m) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <h1>Breakout Signals</h1>
      <p className="sub">Surface posts likely to outperform their cohort <em>early</em>. The score blends early-hours retention lift vs. the cohort median and watch-through.</p>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Threshold tuning — precision vs. recall</div>
        <p className="sub" style={{ marginBottom: 14 }}>Pick the score at which we <strong>act</strong> (e.g. auto-promote). Higher threshold = fewer false positives (wasted promotion) but more missed hits.</p>
        <input type="range" min="40" max="95" value={threshold} onChange={(e) => setThreshold(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ textAlign: 'center', fontWeight: 700, margin: '6px 0 16px' }}>Act when breakout score ≥ <span className="mono" style={{ color: 'var(--accent)' }}>{threshold}</span></div>
        <div className="cards" style={{ marginBottom: 0 }}>
          <KpiCard label="Precision" value={`${(m.precision * 100).toFixed(1)}%`} delta="of flagged are true breakouts" deltaColor="var(--green)" />
          <KpiCard label="Recall" value={`${(m.recall * 100).toFixed(1)}%`} delta="of true breakouts caught" deltaColor="var(--blue)" />
          <KpiCard label="F1 Score" value={m.f1.toFixed(3)} />
          <KpiCard label="Posts Flagged" value={fmtNum(m.flagged)} />
          <KpiCard label="Missed Hits (FN)" value={fmtNum(m.fn)} deltaColor="var(--red)" />
        </div>
        <div className="legend">Measured against the generator's ground-truth breakout flag — exactly how you'd validate a real model before trusting it to drive promotion budget.</div>
      </div>

      <div className="section-title">Top 60 by breakout score</div>
      <div className="tablewrap">
        <table>
          <thead><tr><th>#</th><th>Post</th><th>Creator</th><th>Lang</th><th>Genre</th><th>Score</th><th>H5</th><th>H10</th><th>Curve</th><th>True?</th></tr></thead>
          <tbody>
            {m.ranked.map((p, i) => (
              <tr key={p.id}>
                <td className="mono">{i + 1}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</td>
                <td>{p.creator_name}</td>
                <td>{p.language}</td>
                <td>{p.genre}</td>
                <td className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.breakout_score}</td>
                <td className="mono">{p.h5_ret}</td>
                <td className="mono">{p.h10_ret}</td>
                <td><Sparkline post={p} /></td>
                <td>{p.is_breakout_truth ? <span className="pill" style={{ color: 'var(--green)', background: 'var(--surface-2)' }}>✓</span> : <span className="chip">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
