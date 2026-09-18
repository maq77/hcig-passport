import * as React from 'react';

// One bar split into parts, for a share of a whole (tickets by status). Each part
// carries its label and count underneath, so color is never the only key.
export function ProportionBar({ parts, label }: { parts: { key: string; label: string; value: number; color: string }[]; label: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const shown = parts.filter(p => p.value > 0);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-sunken" role="img" aria-label={`${label}: ${shown.map(p => `${p.label} ${p.value}`).join(', ')}`}>
        {shown.map(p => <span key={p.key} title={`${p.label}: ${p.value}`} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} className="h-full first:rounded-l-full last:rounded-r-full" />)}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {parts.map(p => (
          <li key={p.key} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden />{p.label}<span className="tabular font-semibold text-ink">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Row = { day: string } & Record<string, number | string>;

// Two series side by side per day (opened vs finished). One axis, legend above.
export function GroupedBars({ rows, series, height = 180 }: { rows: Row[]; series: { key: string; label: string; color: string }[]; height?: number }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(600);
  const [hover, setHover] = React.useState<number | null>(null);
  React.useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);
  const max = Math.max(1, ...rows.flatMap(r => series.map(s => Number(r[s.key]) || 0)));
  const nice = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
  const padL = 28, padB = 22, padT = 8;
  const plotW = Math.max(100, w - padL - 4), plotH = height - padB - padT;
  const band = plotW / rows.length;
  const barW = Math.max(3, Math.min(12, (band * 0.7) / series.length));
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  const every = Math.ceil(rows.length / Math.max(2, Math.floor(plotW / 56)));

  return (
    <div ref={wrap} className="relative w-full">
      <svg width={w} height={height} role="img" aria-label="Grouped bar chart">
        {[0, nice / 2, nice].map(t => (
          <g key={t}>
            <line x1={padL} x2={w - 4} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" className="fill-ink-3 text-[11px] tabular">{t}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x0 = padL + band * i + (band - barW * series.length - 2 * (series.length - 1)) / 2;
          return (
            <g key={r.day} opacity={hover === null || hover === i ? 1 : 0.45}>
              {series.map((s, k) => {
                const v = Number(r[s.key]) || 0;
                if (!v) return null;
                const top = y(v), h = y(0) - top, rr = Math.min(3, barW / 2, h), x = x0 + k * (barW + 2);
                return <path key={s.key} fill={s.color} d={`M${x},${y(0)} V${top + rr} Q${x},${top} ${x + rr},${top} H${x + barW - rr} Q${x + barW},${top} ${x + barW},${top + rr} V${y(0)} Z`} />;
              })}
              {i % every === 0 ? <text x={padL + band * i + band / 2} y={height - 6} textAnchor="middle" className="fill-ink-3 text-[11px]">{r.day.slice(5)}</text> : null}
              <rect x={padL + band * i} y={padT} width={band} height={plotH} fill="transparent" tabIndex={0}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                aria-label={`${r.day}: ${series.map(s => `${s.label} ${r[s.key]}`).join(', ')}`} />
            </g>
          );
        })}
        <line x1={padL} x2={w - 4} y1={y(0)} y2={y(0)} stroke="var(--color-line-strong)" />
      </svg>
      {hover !== null ? (
        <div className="pointer-events-none absolute top-0 z-10 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop"
          style={{ left: Math.min(w - 150, Math.max(0, padL + band * hover + band / 2 - 70)) }}>
          <p className="mb-1 font-semibold">{rows[hover].day}</p>
          {series.map(s => (
            <p key={s.key} className="flex justify-between gap-4 text-ink-2">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />{s.label}</span>
              <span className="tabular text-ink">{rows[hover][s.key]}</span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const shade = (x: number) => `color-mix(in oklab, var(--color-brand-ink) ${Math.round(x * 100)}%, var(--color-sunken))`;

// Weekday by hour. One hue, light to dark (sequential), mixed against the surface
// so it reads in both themes. Every cell has its count in a title and label.
export function Heatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="overflow-x-auto">
      <div className="inline-grid min-w-full gap-[3px]" style={{ gridTemplateColumns: '36px repeat(24, minmax(14px, 1fr))' }} role="table" aria-label="Activity by weekday and hour">
        <span />
        {Array.from({ length: 24 }, (_, h) => <span key={h} className="text-center text-[10px] text-ink-3">{h % 3 === 0 ? h : ''}</span>)}
        {grid.map((row, d) => (
          <React.Fragment key={d}>
            <span className="text-[11px] leading-[18px] text-ink-3">{DAYS[d]}</span>
            {row.map((v, h) => (
              <span key={h} tabIndex={0} title={`${DAYS[d]} ${String(h).padStart(2, '0')}:00, ${v} events`} aria-label={`${DAYS[d]} ${h}:00, ${v} events`}
                className="h-[18px] rounded-[3px]" style={{ background: v ? shade(0.18 + (v / max) * 0.82) : 'var(--color-sunken)' }} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-3">
        Fewer {[0.18, 0.4, 0.6, 0.8, 1].map(x => <span key={x} className="h-2.5 w-4 rounded-sm" style={{ background: shade(x) }} />)} More · busiest hour {max} events
      </div>
    </div>
  );
}
