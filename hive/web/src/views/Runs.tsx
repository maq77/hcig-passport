import * as React from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Square, Terminal, FileText, Globe, Search, Pencil, Bot, ChevronRight, Activity } from 'lucide-react';
import { useHive, EMPTY } from '@/store/hive';
import { Card, CardHeader, Empty } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModelTag, RunState } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn, duration, relTime, tokens } from '@/lib/utils';
import type { Run, Step } from '@/lib/types';

export function RunsView() {
  const runs = useHive(s => s.data?.runs ?? EMPTY);
  return (
    <Card>
      <CardHeader title="Worker runs" sub="Every agy run the Hive started, newest first. Open one to replay it step by step." />
      {runs.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead><tr className="border-b border-line bg-canvas text-xs text-ink-3">
              {['Run', 'Ticket', 'State', 'Model', 'Account', 'Steps', 'Tokens', 'Time', 'Started'].map((h, i) => <th key={h} className={cn('px-4 py-2 font-medium', i >= 5 && 'text-right')}>{h}</th>)}
            </tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className="cursor-pointer border-b border-line/60 hover:bg-canvas" onClick={() => (location.hash = `#/run/${r.id}`)}>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-ink">{r.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{r.task}</td>
                  <td className="px-4 py-2.5"><RunState state={r.state} /></td>
                  <td className="px-4 py-2.5"><ModelTag model={r.model} /></td>
                  <td className="px-4 py-2.5 text-ink-2">{r.account}</td>
                  <td className="tabular px-4 py-2.5 text-right">{r.steps}</td>
                  <td className="tabular px-4 py-2.5 text-right">{tokens(r.tokens)}</td>
                  <td className="tabular px-4 py-2.5 text-right">{duration(r.seconds ?? (r.ended ? (Date.parse(r.ended) - Date.parse(r.started)) / 1000 : (Date.now() - Date.parse(r.started)) / 1000))}</td>
                  <td className="px-4 py-2.5 text-right text-ink-3">{relTime(r.started)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty icon={<Activity size={22} />} title="No runs yet" hint="Start a worker from any ticket assigned to an agy worker." />}
    </Card>
  );
}

const TOOL_ICON: Record<string, typeof Terminal> = { run_command: Terminal, view_file: FileText, write_to_file: Pencil, replace_file_content: Pencil, read_url_content: Globe, search_web: Search, grep_search: Search };

export function RunReplayView({ id }: { id: string }) {
  const [data, setData] = React.useState<{ steps: Step[]; run: Run | null } | null>(null);
  const [open, setOpen] = React.useState<Record<number, boolean>>({});
  const events = useHive(s => s.events.length);

  React.useEffect(() => { api.get<{ steps: Step[]; run: Run | null }>(`/api/runs/${id}/steps`).then(setData).catch(e => toast.error(e.message)); }, [id, events]);

  if (!data) return null;
  const { run, steps } = data;
  const total = steps.reduce((a, s) => a + (s.secs || 0), 0) || 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => (location.hash = '#/runs')}><ArrowLeft size={15} />All runs</Button>
        {run ? <>
          <RunState state={run.state} />
          <ModelTag model={run.model} />
          <a href={`#/task/${run.task}`} className="font-mono text-xs text-brand-ink hover:underline">{run.task}</a>
          <span className="text-xs text-ink-3">{run.steps} steps · {tokens(run.tokens)} tokens · started {relTime(run.started)}</span>
          {run.state === 'running' ? <Button size="sm" variant="danger" className="ml-auto" onClick={() => api.post(`/api/runs/${run.id}/kill`).then(() => toast.success('Worker stopped'))}><Square size={12} />Stop</Button> : null}
        </> : null}
      </div>

      <Card>
        <CardHeader title="Replay" sub={run ? `${run.cwd}${run.branch ? ` on ${run.branch}` : ''}` : ''} />
        {steps.length ? (
          <ol className="relative px-4 py-3">
            {steps.map(s => {
              const Icon = s.type === 'agent_response' ? Bot : TOOL_ICON[s.tool || ''] || Terminal;
              const isOpen = open[s.i];
              const hasMore = !!(s.output || (s.text && s.text.length > 180));
              return (
                <li key={s.i} className="relative grid grid-cols-[28px_1fr] gap-3 pb-3 last:pb-0">
                  <span className={cn('z-10 grid h-7 w-7 place-items-center rounded-full border', s.type === 'agent_response' ? 'border-brand-ink/30 bg-brand-soft text-brand-ink' : 'border-line bg-surface text-ink-2')}><Icon size={14} /></span>
                  <div className="min-w-0 rounded-lg border border-line px-3 py-2">
                    <button className="flex w-full cursor-pointer items-center gap-2 text-left" onClick={() => hasMore && setOpen({ ...open, [s.i]: !isOpen })} aria-expanded={hasMore ? isOpen : undefined}>
                      <span className="text-xs font-semibold text-ink">{s.type === 'agent_response' ? 'Thinks and replies' : s.tool}</span>
                      {s.secs ? <span className="h-1 rounded-full bg-brand" style={{ width: `${Math.max(3, (s.secs / total) * 120)}px` }} title={`${s.secs}s`} /> : null}
                      <span className="tabular text-[11px] text-ink-3">{s.secs ? `${s.secs}s` : ''}{s.tokens ? ` · ${tokens(s.tokens)} tokens` : ''}</span>
                      {hasMore ? <ChevronRight size={14} className={cn('ml-auto text-ink-3 transition-transform', isOpen && 'rotate-90')} /> : null}
                    </button>
                    {s.what ? <p className="mt-1 font-mono text-[12px] break-all text-ink-2">{s.what}</p> : null}
                    {s.text ? <p className={cn('mt-1 text-[13px] whitespace-pre-wrap text-ink', !isOpen && 'line-clamp-3')}>{s.text}</p> : null}
                    {isOpen && s.output ? <pre className="scroll-thin mt-2 max-h-72 overflow-auto rounded-md bg-sunken p-2 font-mono text-[11.5px] whitespace-pre-wrap">{s.output}</pre> : null}
                  </div>
                </li>
              );
            })}
            <span className="absolute top-4 bottom-4 left-[29px] w-px bg-line" aria-hidden />
          </ol>
        ) : <Empty title="No steps recorded" hint="The run may have failed before its first step. Check the ticket notes." />}
      </Card>
      {run?.response ? (
        <Card><CardHeader title="Final answer" /><p className="px-4 py-3 text-[13.5px] whitespace-pre-wrap">{run.response}</p></Card>
      ) : null}
    </div>
  );
}
