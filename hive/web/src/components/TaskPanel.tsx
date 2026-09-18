import * as React from 'react';
import { toast } from 'sonner';
import { Play, Copy, Eye, FileDiff, GitMerge, Link2, Send, Square, FolderOpen, GitBranch, Check } from 'lucide-react';
import { SlideOver } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { Avatar, Badge, ModelTag, PriorityFlag, RunState, StatusPill } from '@/components/ui/badge';
import { Select, Textarea } from '@/components/ui/form';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { api } from '@/lib/api';
import { navigate } from '@/hooks/useRoute';
import { assigneeName, modelName, relTime, STATUSES, cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

type Diff = { branch?: string; commits?: string; stat?: string; diff?: string; note?: string };

export function TaskPanel() {
  const { taskId, openTask } = useUI();
  const data = useHive(s => s.data);
  const refresh = useHive(s => s.refresh);
  const task = data?.tasks.find(t => t.id === taskId) || null;
  const close = React.useCallback(() => { openTask(null); if (location.hash.startsWith('#/task/')) navigate('/board'); }, [openTask]);

  return (
    <SlideOver
      open={!!task}
      onClose={close}
      title={task ? <span className="flex items-center gap-2"><span className="font-mono text-xs text-ink-3">{task.id}</span><StatusPill status={task.status} /></span> : ''}
    >
      {task ? <TaskBody key={task.id} task={task} refresh={refresh} /> : null}
    </SlideOver>
  );
}

function TaskBody({ task, refresh }: { task: Task; refresh: () => Promise<void> }) {
  const data = useHive(s => s.data)!;
  const runs = data.runs.filter(r => r.task === task.id);
  const [route, setRoute] = React.useState<{ kind: string; model: string; effort: string } | null>(null);
  const [model, setModel] = React.useState('');
  const [effort, setEffort] = React.useState('high');
  const [ws, setWs] = React.useState('');
  const [say, setSay] = React.useState('');
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [diff, setDiff] = React.useState<Diff | null>(null);

  React.useEffect(() => {
    api.get<{ kind: string; model: string; effort: string }>(`/api/tasks/${task.id}/route`).then(r => { setRoute(r); setModel(r.model); setEffort(r.effort); }).catch(() => {});
  }, [task.id]);

  const act = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try { await fn(); toast.success(ok); await refresh(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };
  const patch = (b: Record<string, unknown>, ok: string) => act('patch', () => api.patch(`/api/tasks/${task.id}`, { ...b, actor: 'dashboard' }), ok);
  const waiting = (task.dependsOn || []).filter(d => data.tasks.find(t => t.id === d)?.status !== 'done');
  const dispatchable = task.assignee === '@agy-cli';

  return (
    <div className="flex flex-col">
      <section className="border-b border-line px-6 py-5">
        <h2 className="text-lg leading-snug font-semibold tracking-tight">{task.title}</h2>
        <dl className="mt-4 grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-2.5 text-[13px]">
          <dt className="text-ink-3">Status</dt>
          <dd>
            <Select aria-label="Status" value={task.status} onChange={e => patch({ status: e.target.value }, 'Status changed')} className="h-8 w-44">
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </dd>
          <dt className="text-ink-3">Assignee</dt>
          <dd className="flex items-center gap-2">
            <Avatar who={task.assignee} />
            <Select aria-label="Assignee" value={task.assignee} onChange={e => patch({ assignee: e.target.value }, 'Reassigned')} className="h-8 w-44">
              {['@agy-cli', '@agy-desktop', '@claude'].map(a => <option key={a} value={a}>{assigneeName(a)}</option>)}
            </Select>
          </dd>
          <dt className="text-ink-3">Priority</dt>
          <dd><Select aria-label="Priority" value={task.priority} onChange={e => patch({ priority: e.target.value }, 'Priority changed')} className="h-8 w-44">
            {['low', 'normal', 'high'].map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
          </Select></dd>
          {route ? <><dt className="text-ink-3">Route</dt><dd className="flex items-center gap-2"><Badge tone="brand">{route.kind}</Badge><ModelTag model={route.model} /></dd></> : null}
          {task.folder ? <><dt className="text-ink-3">Folder</dt><dd className="flex items-center gap-1.5 font-mono text-xs"><FolderOpen size={14} className="text-ink-3" />{task.folder}</dd></> : null}
          {task.branch ? <><dt className="text-ink-3">Branch</dt><dd className="flex items-center gap-1.5 font-mono text-xs"><GitBranch size={14} className="text-ink-3" />{task.branch}</dd></> : null}
          {task.dependsOn?.length ? <><dt className="text-ink-3">Waits on</dt><dd className="flex flex-wrap gap-1.5">{task.dependsOn.map(d => {
            const done = data.tasks.find(t => t.id === d)?.status === 'done';
            return <a key={d} href={`#/task/${d}`} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs', done ? 'bg-done-soft text-done' : 'bg-warn-soft text-warn')}>{done ? <Check size={12} /> : <Link2 size={12} />}{d}</a>;
          })}{task.autoDispatch ? <span className="text-xs text-ink-3">starts on its own when ready</span> : null}</dd></> : null}
          {task.parent ? <><dt className="text-ink-3">Parent</dt><dd><a href={`#/task/${task.parent}`} className="font-mono text-xs text-brand-ink hover:underline">{task.parent}</a></dd></> : null}
          <dt className="text-ink-3">Updated</dt><dd className="text-ink-2">{relTime(task.updated)} <PriorityFlag priority={task.priority} /></dd>
        </dl>
      </section>

      {task.description || task.acceptance?.length || task.details ? (
        <section className="flex flex-col gap-3 border-b border-line px-6 py-5 text-[13.5px] leading-relaxed">
          {task.description ? <p className="whitespace-pre-wrap text-ink">{task.description}</p> : null}
          {task.acceptance?.length ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-3">Acceptance criteria</p>
              <ul className="flex flex-col gap-1">{task.acceptance.map((a, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-ink" />{a}</li>)}</ul>
            </div>
          ) : null}
          {task.details ? <pre className="scroll-thin max-h-64 overflow-auto rounded-lg bg-sunken p-3 font-mono text-xs whitespace-pre-wrap">{task.details}</pre> : null}
        </section>
      ) : null}

      <section className="border-b border-line px-6 py-5">
        <p className="mb-3 text-xs font-semibold text-ink-3">Work on it</p>
        {!dispatchable ? (
          <p className="text-[13px] text-ink-2">Assigned to {assigneeName(task.assignee)}. Only tickets for an agy worker can be started from here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Select aria-label="Model" value={model} onChange={e => setModel(e.target.value)}>{data.models.allowed.map(m => <option key={m} value={m}>{modelName(m)}</option>)}</Select>
              <Select aria-label="Effort" value={effort} onChange={e => setEffort(e.target.value)} disabled={!model.startsWith('gemini-')} title={model.startsWith('gemini-') ? '' : 'Claude models think at a fixed level'}>
                <option value="high">Effort high</option><option value="medium">Effort medium</option>
              </Select>
              <Select aria-label="Workspace" value={ws} onChange={e => setWs(e.target.value)}>
                <option value="">Auto workspace</option><option value="worktree">Own worktree</option><option value="main">Main folder</option>
              </Select>
            </div>
            <Textarea rows={2} value={say} onChange={e => setSay(e.target.value)} placeholder="Extra instructions for this run (optional)" className="min-h-0" />
            {waiting.length ? <p className="text-xs text-warn">Waits on {waiting.join(', ')}. Starting now overrides that.</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" loading={busy === 'go'} onClick={() => act('go', () => api.post(`/api/tasks/${task.id}/dispatch`, { model, effort, workspace: ws || undefined, instructions: say || undefined, force: waiting.length > 0 }), 'Worker started')}>
                <Play size={15} /> Start worker
              </Button>
              <Button loading={busy === 'best'} onClick={() => act('best', () => api.post(`/api/tasks/${task.id}/bestof`, {}), 'Two workers started on the best models')} title="Same brief to two models, pick the better one">
                <Copy size={15} /> Best of two
              </Button>
              <Button loading={busy === 'critic'} onClick={() => act('critic', () => api.post(`/api/tasks/${task.id}/critic`), 'Second opinion started')} title="A different model reviews the work">
                <Eye size={15} /> Second opinion
              </Button>
            </div>
          </div>
        )}
        {task.branch && task.status !== 'done' ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" loading={busy === 'diff'} onClick={async () => { setBusy('diff'); try { setDiff(await api.get<Diff>(`/api/tasks/${task.id}/diff`)); } catch (e) { toast.error((e as Error).message); } setBusy(null); }}><FileDiff size={14} /> View diff</Button>
            <Button size="sm" loading={busy === 'merge'} onClick={() => { if (confirm(`Merge ${task.branch} into main?`)) act('merge', () => api.post(`/api/tasks/${task.id}/merge`), 'Merged into main'); }}><GitMerge size={14} /> Merge</Button>
          </div>
        ) : null}
        {diff ? (
          <div className="mt-3 flex flex-col gap-2">
            {[diff.note, diff.commits, diff.stat].filter(Boolean).length ? <pre className="rounded-lg bg-sunken p-3 font-mono text-xs whitespace-pre-wrap">{[diff.note, diff.commits, diff.stat].filter(Boolean).join('\n\n')}</pre> : null}
            {diff.diff ? <DiffView text={diff.diff} /> : null}
          </div>
        ) : null}
      </section>

      {runs.length ? (
        <section className="border-b border-line px-6 py-5">
          <p className="mb-2 text-xs font-semibold text-ink-3">Runs</p>
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {runs.map(r => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[13px]">
                <a href={`#/run/${r.id}`} className="font-mono text-xs text-brand-ink hover:underline">{r.id}</a>
                <RunState state={r.state} />
                <ModelTag model={r.model} />
                <span className="ml-auto text-xs text-ink-3">{r.steps} steps · {relTime(r.started)}</span>
                {r.state === 'running' ? <Button size="sm" variant="danger" onClick={() => act('kill', () => api.post(`/api/runs/${r.id}/kill`), 'Worker stopped')}><Square size={12} /> Stop</Button> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="px-6 py-5">
        <p className="mb-3 text-xs font-semibold text-ink-3">Activity</p>
        <form className="mb-4 flex gap-2" onSubmit={e => { e.preventDefault(); if (!note.trim()) return; patch({ note: note.trim() }, 'Note added').then(() => setNote('')); }}>
          <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note for the team" className="min-h-0 flex-1" aria-label="Note" />
          <Button type="submit" variant="subtle" size="icon" aria-label="Add note"><Send size={15} /></Button>
        </form>
        {task.notes.length ? (
          <ol className="flex flex-col gap-4">
            {[...task.notes].reverse().map((n, i) => (
              <li key={i} className="flex gap-3">
                <Avatar who={n.by.startsWith('agy') ? '@agy-cli' : n.by} size={24} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-3"><span className="font-medium text-ink-2">{n.by}</span> · {relTime(n.ts)}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words">{n.text}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="text-[13px] text-ink-3">No notes yet.</p>}
      </section>
    </div>
  );
}

function DiffView({ text }: { text: string }) {
  return (
    <pre className="scroll-thin max-h-[420px] overflow-auto rounded-lg border border-line font-mono text-xs leading-5">
      {text.split('\n').map((l, i) => (
        <div key={i} className={cn('px-3', l.startsWith('+') && !l.startsWith('+++') ? 'bg-done-soft text-done' : l.startsWith('-') && !l.startsWith('---') ? 'bg-blocked-soft text-blocked' : l.startsWith('@@') ? 'bg-review-soft text-review' : 'text-ink-2')}>{l || ' '}</div>
      ))}
    </pre>
  );
}
