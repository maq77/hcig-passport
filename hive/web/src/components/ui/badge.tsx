import * as React from 'react';
import { cn, statusMeta, RUN_STATE, modelColor, modelName } from '@/lib/utils';

const TONES = {
  progress: 'bg-progress-soft text-progress',
  done: 'bg-done-soft text-done',
  blocked: 'bg-blocked-soft text-blocked',
  review: 'bg-review-soft text-review',
  todo: 'bg-todo-soft text-todo',
  warn: 'bg-warn-soft text-warn',
  brand: 'bg-brand-soft text-brand-ink',
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = 'todo', className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap', TONES[tone], className)}>
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

// Status always carries its word, never color alone.
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const m = statusMeta(status);
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap', m.soft, m.text, className)}>
      <span className={cn('h-2 w-2 rounded-full', m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

export function RunState({ state }: { state: string }) {
  const m = RUN_STATE[state] || { label: state, tone: 'todo' as const };
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}

export function ModelTag({ model, className }: { model: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-ink-2 whitespace-nowrap', className)}>
      <span className="h-2 w-2 rounded-sm" style={{ background: modelColor(model) }} aria-hidden />
      {modelName(model)}
    </span>
  );
}

const AVATAR: Record<string, { label: string; cls: string }> = {
  '@claude': { label: 'C', cls: 'bg-gray-brand text-white' },
  '@agy-cli': { label: 'A', cls: 'bg-brand-ink text-on-brand' },
  '@agy-desktop': { label: 'D', cls: 'bg-review text-on-brand' },
};
export function Avatar({ who, size = 22 }: { who: string; size?: number }) {
  const a = AVATAR[who] || { label: who.replace(/^@/, '').slice(0, 1).toUpperCase(), cls: 'bg-todo text-on-brand' };
  return (
    <span className={cn('inline-grid shrink-0 place-items-center rounded-full font-semibold', a.cls)} style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden>
      {a.label}
    </span>
  );
}

export function PriorityFlag({ priority }: { priority: string }) {
  if (priority !== 'high' && priority !== 'low') return null;
  return <Badge tone={priority === 'high' ? 'blocked' : 'todo'}>{priority === 'high' ? 'High' : 'Low'}</Badge>;
}
