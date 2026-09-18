import * as React from 'react';
import { AlertTriangle, FileText, GitCommit, MessageSquare, Play, CheckCircle2, XCircle, Gauge, Circle, Pause } from 'lucide-react';
import { useHive } from '@/store/hive';
import { Segmented } from '@/components/ui/form';
import { cn, clock } from '@/lib/utils';
import type { HiveEvent } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Workers' },
  { value: 'task', label: 'Tickets' },
  { value: 'alert', label: 'Alerts' },
  { value: 'files', label: 'Files' },
] as const;
type F = typeof FILTERS[number]['value'];

function match(e: HiveEvent, f: F) {
  if (f === 'all') return e.type !== 'files.changed';
  if (f === 'work') return e.type.startsWith('run.');
  if (f === 'task') return e.type.startsWith('task.') || e.type === 'order';
  if (f === 'alert') return e.type === 'deploy.alert' || e.type === 'quota' || e.type.startsWith('budget') || e.type === 'hive.error';
  return e.type === 'files.changed' || e.type === 'git';
}

function icon(e: HiveEvent) {
  if (e.type === 'deploy.alert') return <AlertTriangle size={15} className="text-blocked" />;
  if (e.type === 'quota' || e.type.startsWith('budget')) return <Gauge size={15} className="text-warn" />;
  if (e.type === 'run.start') return <Play size={15} className="text-progress" />;
  if (e.type === 'run.end') return e.data?.state === 'done' ? <CheckCircle2 size={15} className="text-done" /> : <XCircle size={15} className="text-blocked" />;
  if (e.type === 'files.changed') return <FileText size={15} className="text-ink-3" />;
  if (e.type === 'git') return <GitCommit size={15} className="text-ink-3" />;
  if (e.type === 'order' || e.type.startsWith('task.')) return <MessageSquare size={15} className="text-review" />;
  return <Circle size={9} className="mx-[3px] text-line-strong" fill="currentColor" />;
}

export function EventFeed({ limit = 120, className }: { limit?: number; className?: string }) {
  const events = useHive(s => s.events);
  const [f, setF] = React.useState<F>('all');
  const [paused, setPaused] = React.useState<HiveEvent[] | null>(null);
  const shown = (paused ?? events).filter(e => match(e, f)).slice(0, limit);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <Segmented label="Filter activity" value={f} onChange={setF} options={FILTERS as unknown as { value: F; label: string }[]} />
        <button onClick={() => setPaused(paused ? null : events)} className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs text-ink-3 hover:bg-sunken hover:text-ink" aria-pressed={!!paused}>
          {paused ? <Play size={13} /> : <Pause size={13} />}{paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <ol className="scroll-thin min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        {shown.length ? shown.map((e, i) => (
          <li key={e.ts + i} className={cn('grid grid-cols-[40px_18px_1fr] gap-2 border-t border-line/70 px-4 py-2 text-[13px]', e.type === 'deploy.alert' && 'bg-blocked-soft')}>
            <time className="tabular pt-px font-mono text-[11px] text-ink-3">{clock(e.ts)}</time>
            <span className="pt-0.5">{icon(e)}</span>
            <div className="min-w-0">
              <span className="mr-1.5 font-medium text-ink">{e.actor}</span>
              <span className="break-words text-ink-2">{e.msg}</span>
              {e.type === 'files.changed' && e.data?.files ? <p className="truncate font-mono text-[11px] text-ink-3">{e.data.files.slice(0, 5).map((x: { f: string }) => x.f).join('  ')}</p> : null}
            </div>
          </li>
        )) : <li className="px-4 py-8 text-center text-[13px] text-ink-3">Quiet for now.</li>}
      </ol>
    </div>
  );
}
