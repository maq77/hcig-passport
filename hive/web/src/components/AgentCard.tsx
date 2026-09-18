import { Bot, Crown, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, ModelTag } from '@/components/ui/badge';
import { cn, modelName, relTime } from '@/lib/utils';
import type { Agent } from '@/lib/types';

const TONE: Record<string, 'progress' | 'review' | 'todo'> = { working: 'progress', 'has tickets': 'review', 'on duty': 'progress' };

export function AgentCard({ a }: { a: Agent }) {
  const Icon = a.kind === 'head' ? Crown : a.kind === 'desktop' ? Monitor : Bot;
  return (
    <Card className={cn('flex flex-col gap-3 p-4', a.state === 'off' && 'bg-canvas')}>
      <div className="flex items-start gap-3">
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', a.kind === 'head' ? 'bg-gray-brand text-white' : a.state === 'off' ? 'bg-sunken text-ink-3' : 'bg-brand-soft text-brand-ink')}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.label}</p>
          <p className="text-xs text-ink-3">{a.role}{a.model ? ` · ${modelName(a.model)}` : ''}{a.maxParallel ? ` · up to ${a.maxParallel} at once` : ''}</p>
        </div>
        <Badge tone={TONE[a.state] || 'todo'} dot>{a.state}</Badge>
      </div>
      {a.runs?.length ? (
        <ul className="flex flex-col gap-2">
          {a.runs.map(r => (
            <li key={r.id} className="rounded-lg bg-sunken px-3 py-2 text-[13px]">
              <div className="flex items-center gap-2">
                <a href={`#/run/${r.id}`} className="font-mono text-xs font-medium text-brand-ink hover:underline">{r.task}</a>
                <ModelTag model={r.model} />
                <span className="ml-auto text-xs text-ink-3">{r.steps} steps</span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-ink-3">{r.lastStep || 'starting'}</p>
            </li>
          ))}
        </ul>
      ) : a.doing?.length ? (
        <p className="text-[13px] text-ink-2">{a.doing.join(', ')}</p>
      ) : null}
      <p className="line-clamp-2 text-xs text-ink-3">
        {a.state === 'off' && a.note ? a.note : a.last ? `${relTime(a.last.ts)}: ${a.last.msg}` : 'No activity yet.'}
      </p>
    </Card>
  );
}
