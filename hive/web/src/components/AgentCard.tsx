import { Bot, Crown, Monitor, Terminal, Radio } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, ModelTag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, modelName, relTime } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Agent } from '@/lib/types';

const TONE: Record<string, 'progress' | 'review' | 'todo'> = { working: 'progress', 'has tickets': 'review', 'on duty': 'progress' };

export function AgentCard({ a }: { a: Agent }) {
  const Icon = a.kind === 'head' ? Crown : a.kind === 'desktop' ? Monitor : Bot;
  const isWorking = a.state === 'working' || Boolean(a.runs && a.runs.length > 0);

  const handleOpen = async (runId?: string) => {
    try {
      if (runId) {
        await api.post('/api/launch', { what: 'watch', run: runId });
        toast.success(`Live monitor opened for ${runId}`);
        return;
      }
      if (a.kind === 'desktop') {
        await api.post('/api/launch', { what: 'desktop' });
        toast.success('Antigravity Desktop opened');
        return;
      }
      if (a.kind === 'head') {
        await api.post('/api/launch', { what: 'claude' });
        toast.success('Claude opened in Windows Terminal');
        return;
      }
      if (isWorking && a.runs && a.runs.length > 0) {
        await api.post('/api/launch', { what: 'watch', run: a.runs[0].id });
        toast.success(`Watching ${a.label} live in Windows Terminal`);
        return;
      }
      await api.post('/api/launch', { what: 'agy', account: a.id });
      toast.success(`${a.label} opened in Windows Terminal`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

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
                <Button
                  size="sm"
                  variant="subtle"
                  className="h-6 px-2 text-xs font-semibold"
                  onClick={() => handleOpen(r.id)}
                  title={`Watch ${r.task} live in terminal`}
                >
                  <Radio size={12} className="text-progress" />
                  Live
                </Button>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-ink-3">{r.lastStep || 'starting'}</p>
            </li>
          ))}
        </ul>
      ) : a.doing?.length ? (
        <p className="text-[13px] text-ink-2">{a.doing.join(', ')}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line/60 pt-3">
        <p className="line-clamp-1 min-w-0 flex-1 text-xs text-ink-3">
          {a.state === 'off' && a.note ? a.note : a.last ? `${relTime(a.last.ts)}: ${a.last.msg}` : 'No activity yet.'}
        </p>
        {a.state !== 'off' && (
          <Button
            size="sm"
            variant={isWorking ? 'primary' : 'secondary'}
            onClick={() => handleOpen()}
            className="shrink-0"
          >
            {isWorking ? (
              <>
                <Radio size={13} className="text-progress" />
                Watch Live
              </>
            ) : a.kind === 'desktop' ? (
              <>
                <Monitor size={13} />
                Open Desktop
              </>
            ) : (
              <>
                <Terminal size={13} />
                Open CLI
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
