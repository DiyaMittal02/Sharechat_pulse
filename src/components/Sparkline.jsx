import { HOURS } from '../lib/metrics.js';

// Tiny inline SVG retention sparkline (H5→H30), no chart lib needed per-row.
export default function Sparkline({ post, width = 90, height = 26, color = 'var(--accent)' }) {
  const vals = HOURS.map((h) => post[`h${h}_ret`]).filter((v) => v != null);
  if (vals.length < 2) return <span className="chip">—</span>;
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * (width - 2) + 1;
    const y = height - 1 - ((v - min) / span) * (height - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
