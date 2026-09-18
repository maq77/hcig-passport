import * as React from 'react';
import { cn, modelColor, modelName, tokens as fmtTokens } from '@/lib/utils';

// Hand-rolled SVG charts that follow the dataviz rules: one axis, thin marks with
// 4px rounded data ends, 2px surface gaps between stacked segments, a recessive
// grid, a legend for 2+ series, a hover tooltip on every mark, and a table view.

export function Legend({ series }: { series: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {series.map(s => (
        <li key={s} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: modelColor(s) }} aria-hidden />
          {modelName(s)}
        </li>
      ))}
    </ul>
  );
}

type Row = { day: string } & Record<string, number | string>;

export function StackedBars({ rows, series, height = 220, format = fmtTokens }: { rows: Row[]; series: string[]; height?: number; format?: (n: number) => string }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(640);
  React.useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const totals = rows.map(r => series.reduce((a, s) => a + (Number(r[s]) || 0), 0));
  const max = Math.max(1, ...totals);
  const nice = niceMax(max);
  const padL = 44, padB = 22, padT = 8;
  const plotW = Math.max(100, w - padL - 4), plotH = height - padB - padT;
  const band = plotW / rows.length;
  const barW = Math.max(4, Math.min(28, band * 0.62));
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  const ticks = [0, nice / 2, nice];
  const labelEvery = Math.ceil(rows.length / Math.max(2, Math.floor(plotW / 56)));

  return (
    <div ref={wrap} className="relative w-full">
      <svg width={w} height={height} role="img" aria-label={`Stacked bar chart, ${rows.length} days`} className="block">
        {ticks.map(t => (
          <g key={t}>
            <line x1={padL} x2={w - 4} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-ink-3 text-[11px] tabular">{format(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cx = padL + band * i + band / 2;
          let acc = 0;
          const segs = series.map(s => ({ s, v: Number(r[s]) || 0 })).filter(x => x.v > 0);
          return (
            <g key={r.day}>
              {segs.map((seg, k) => {
                const y0 = y(acc), y1 = y(acc + seg.v);
                acc += seg.v;
                const top = k === segs.length - 1;
                const h = Math.max(1, y0 - y1 - (top ? 0 : 2));
                return top
                  ? <path key={seg.s} d={roundedTop(cx - barW / 2, y1, barW, h, Math.min(4, barW / 2, h))} fill={modelColor(seg.s)} opacity={hover === null || hover === i ? 1 : 0.45} />
                  : <rect key={seg.s} x={cx - barW / 2} y={y1 + 2} width={barW} height={h} fill={modelColor(seg.s)} opacity={hover === null || hover === i ? 1 : 0.45} />;
              })}
              {i % labelEvery === 0 ? <text x={cx} y={height - 6} textAnchor="middle" className="fill-ink-3 text-[11px]">{r.day.slice(5)}</text> : null}
              <rect x={padL + band * i} y={padT} width={band} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${r.day}: ${format(totals[i])}`} />
            </g>
          );
        })}
        <line x1={padL} x2={w - 4} y1={y(0)} y2={y(0)} stroke="var(--color-line-strong)" strokeWidth={1} />
      </svg>
      {hover !== null ? (
        <div className="pointer-events-none absolute top-1 z-10 min-w-40 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop"
          style={{ left: Math.min(w - 170, Math.max(0, padL + band * hover + band / 2 - 80)) }}>
          <p className="mb-1 font-semibold text-ink">{rows[hover].day}</p>
          {series.filter(s => Number(rows[hover][s]) > 0).map(s => (
            <p key={s} className="flex items-center justify-between gap-3 text-ink-2">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: modelColor(s) }} />{modelName(s)}</span>
              <span className="tabular text-ink">{format(Number(rows[hover][s]))}</span>
            </p>
          ))}
          <p className="mt-1 flex justify-between border-t border-line pt-1 font-medium text-ink"><span>Total</span><span className="tabular">{format(totals[hover])}</span></p>
        </div>
      ) : null}
    </div>
  );
}

// Horizontal bars with the value written at the end of each bar (direct labels).
export function HBars({ items, max, format, colorOf }: { items: { key: string; label: string; value: number; sub?: string }[]; max?: number; format: (n: number) => string; colorOf?: (k: string) => string }) {
  const m = max ?? Math.max(1, ...items.map(i => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map(it => (
        <li key={it.key} className="grid grid-cols-[minmax(110px,160px)_1fr_auto] items-center gap-3" title={`${it.label}: ${format(it.value)}`}>
          <span className="truncate text-xs text-ink-2">{it.label}</span>
          <span className="h-2.5 rounded-full bg-sunken">
            <span className="block h-full rounded-full" style={{ width: `${Math.max(2, (it.value / m) * 100)}%`, background: colorOf ? colorOf(it.key) : 'var(--color-brand-ink)' }} />
          </span>
          <span className="tabular text-xs font-medium text-ink">{format(it.value)}{it.sub ? <span className="ml-1 font-normal text-ink-3">{it.sub}</span> : null}</span>
        </li>
      ))}
    </ul>
  );
}

export function DataTable({ head, rows, className }: { head: string[]; rows: React.ReactNode[][]; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line">{head.map((h, i) => <th key={h} className={cn('px-3 py-2 text-xs font-medium text-ink-3', i > 0 && 'text-right')}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/60 last:border-0">
              {r.map((c, j) => <td key={j} className={cn('px-3 py-2', j > 0 && 'tabular text-right')}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
