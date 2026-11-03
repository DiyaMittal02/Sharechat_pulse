export default function KpiCard({ label, value, delta, deltaColor }) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta != null && <div className="delta" style={{ color: deltaColor || 'var(--muted)' }}>{delta}</div>}
    </div>
  );
}
