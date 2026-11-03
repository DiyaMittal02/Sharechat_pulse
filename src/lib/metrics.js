// ─────────────────────────────────────────────────────────────────────────
// Metric logic — the single source of truth, mirroring Scout's approach.
// Every number on screen comes from here so three "teams" read it the same way.
// ─────────────────────────────────────────────────────────────────────────

export const HOURS = [5, 10, 15, 20, 25, 30];

// ── Benchmark lookup at a chosen percentile ──────────────────────────────────
export function benchmarkAt(benchmarks, language, genre, hour, pct = 'p50') {
  return benchmarks?.[language]?.[genre]?.[hour]?.[pct] ?? null;
}

// ── Per-cell colour vs. benchmark (Green ≥95% · Amber 80–95% · Red <80%) ─────
export function benchColor(value, bench) {
  if (value == null || bench == null) return 'var(--muted)';
  const ratio = value / bench;
  if (ratio >= 0.95) return 'var(--green)';
  if (ratio >= 0.80) return 'var(--amber)';
  return 'var(--red)';
}

// ── Automatic performance tag (collapses a curve into one verdict) ───────────
// Share of qualifying hours above the cohort benchmark.
export function performanceTag(post, benchmarks, pct = 'p50') {
  let above = 0, qualifying = 0;
  for (const h of HOURS) {
    const bench = benchmarkAt(benchmarks, post.language, post.genre, h, pct);
    const v = post[`h${h}_ret`];
    if (bench == null || v == null) continue;
    qualifying++;
    if (v >= bench) above++;
  }
  if (qualifying < 2) return { tag: 'Insufficient Data', key: 'insufficient', share: 0 };
  const share = above / qualifying;
  if (share >= 0.75) return { tag: 'Outperformer', key: 'outperformer', share };
  if (share >= 0.50) return { tag: 'Above Average', key: 'above', share };
  if (share >= 0.25) return { tag: 'Mixed', key: 'mixed', share };
  return { tag: 'Needs Attention', key: 'needs', share };
}

export const TAG_COLORS = {
  outperformer: 'var(--green)',
  above: 'var(--blue)',
  mixed: 'var(--amber)',
  needs: 'var(--red)',
  insufficient: 'var(--muted)',
};

// ── Cohort aggregation: SUM(retained)/SUM(elig) proxy ────────────────────────
// Percentages can't be averaged across cohorts with different denominators.
// We don't have raw numerators/denominators in the demo JSON, so we weight each
// post's retention by its DAU (its eligible base) — the correct spirit: a
// 1M-view post should dominate a 500-view post in a cohort average.
export function aggregateRetention(posts) {
  const out = [];
  for (const h of HOURS) {
    let num = 0, den = 0;
    for (const p of posts) {
      const v = p[`h${h}_ret`];
      if (v == null) continue;
      const w = p.dau || 1;          // eligible-base weight
      num += (v / 100) * w;
      den += w;
    }
    out.push({ hour: h, retention: den ? +((num / den) * 100).toFixed(1) : null });
  }
  return out;
}

// ── Benchmark band for a cohort (P25 / P50 / P75) over hours ─────────────────
export function benchmarkBand(benchmarks, language, genre) {
  return HOURS.map((h) => ({
    hour: h,
    p25: benchmarkAt(benchmarks, language, genre, h, 'p25'),
    p50: benchmarkAt(benchmarks, language, genre, h, 'p50'),
    p75: benchmarkAt(benchmarks, language, genre, h, 'p75'),
  }));
}

// ── CSV export (so analysis can leave the tool and enter a deck) ─────────────
export function toCSV(rows, columns) {
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((r) =>
    columns.map((c) => {
      const v = typeof c.get === 'function' ? c.get(r) : r[c.key];
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\n');
  return `${header}\n${body}`;
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const fmtNum = (n) =>
  n == null ? '—' : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');
