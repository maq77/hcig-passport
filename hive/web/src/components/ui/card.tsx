import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-line/80 bg-surface shadow-card transition-shadow duration-150', className)} {...props} />;
}

export function CardHeader({ title, action, className, sub }: { title: React.ReactNode; action?: React.ReactNode; className?: string; sub?: React.ReactNode }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-line/70 px-4.5 py-3.5', className)}>
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold tracking-tight text-ink">{title}</h2>
        {sub ? <p className="mt-0.5 text-xs text-ink-3">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint, action }: { icon?: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon ? <div className="text-ink-3">{icon}</div> : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint ? <p className="max-w-xs text-xs text-ink-3">{hint}</p> : null}
      {action}
    </div>
  );
}

export function Kpi({ label, value, hint, tone, meter }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: 'blocked' | 'review' | 'progress'; meter?: number }) {
  const toneCls = tone === 'blocked' ? 'text-blocked' : tone === 'review' ? 'text-review' : tone === 'progress' ? 'text-progress' : 'text-ink';
  return (
    <Card className="flex flex-col gap-1 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-card hover:-translate-y-0.5">
      <span className="text-xs font-medium text-ink-3">{label}</span>
      <span className={cn('tabular text-[26px] font-semibold tracking-tight', toneCls)}>{value}</span>
      {meter !== undefined ? <Meter value={meter} className="mt-1" /> : null}
      {hint ? <span className="mt-0.5 truncate text-xs text-ink-3">{hint}</span> : null}
    </Card>
  );
}

export function Meter({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  const color = v >= 1 ? 'bg-blocked' : v >= 0.8 ? 'bg-warn' : 'bg-brand-ink';
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-sunken', className)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <div className={cn('h-full rounded-full transition-[width] duration-300', color)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}
