import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Link2, GitBranch, MessageSquare, Search } from 'lucide-react';
import { useHive, EMPTY } from '@/store/hive';
import { useUI } from '@/store/ui';
import { Avatar, PriorityFlag } from '@/components/ui/badge';
import { Input } from '@/components/ui/form';
import { api } from '@/lib/api';
import { cn, relTime, STATUSES, assigneeName } from '@/lib/utils';
import type { Task, Status } from '@/lib/types';

export function useTaskFilter() {
  const [q, setQ] = React.useState('');
  const [who, setWho] = React.useState<string>('all');
  const filter = (t: Task) =>
    (who === 'all' || t.assignee === who) &&
    (!q || `${t.id} ${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase()));
  const bar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter tickets" className="pl-9" aria-label="Filter tickets" />
      </div>
      {['all', '@claude', '@agy-cli', '@agy-desktop'].map(a => (
        <button key={a} onClick={() => setWho(a)} aria-pressed={who === a}
          className={cn('inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
            who === a ? 'border-brand-ink bg-brand-soft text-brand-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong')}>
          {a !== 'all' ? <Avatar who={a} size={16} /> : null}{a === 'all' ? 'Everyone' : assigneeName(a)}
        </button>
      ))}
    </div>
  );
  return { filter, bar };
}

export function BoardView() {
  const tasks = useHive(s => s.data?.tasks ?? EMPTY);
  const refresh = useHive(s => s.refresh);
  const { openTask, openNewTask } = useUI();
  const { filter, bar } = useTaskFilter();
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<Status | null>(null);

  const move = async (id: string, status: Status) => {
    const t = tasks.find(x => x.id === id);
    if (!t || t.status === status) return;
    try { await api.patch(`/api/tasks/${id}`, { status, actor: 'dashboard' }); toast.success(`${id} moved to ${STATUSES.find(s => s.id === status)!.label}`); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {bar}
      <div className="scroll-thin -mx-4 flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-2 lg:-mx-6 lg:px-6">
        {STATUSES.map(s => {
          const col = tasks.filter(t => t.status === s.id && filter(t)).sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0) || b.updated.localeCompare(a.updated));
          const shown = s.id === 'done' ? col.slice(0, 12) : col;
          return (
            <section
              key={s.id}
              aria-label={s.label}
              onDragOver={e => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={e => { e.preventDefault(); setOver(null); if (dragId) move(dragId, s.id); setDragId(null); }}
              className={cn('flex w-[280px] shrink-0 flex-col rounded-xl bg-sunken/70 transition-colors', over === s.id && 'bg-brand-soft ring-2 ring-brand-ink/30')}
            >
              <header className="flex items-center gap-2 px-3 pt-3 pb-2">
                <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold', s.soft, s.text)}>
                  <span className={cn('h-2 w-2 rounded-full', s.dot)} />{s.label}
                </span>
                <span className="tabular text-xs text-ink-3">{col.length}</span>
                <button onClick={() => openNewTask({ status: s.id })} className="ml-auto grid h-7 w-7 cursor-pointer place-items-center rounded-md text-ink-3 hover:bg-surface hover:text-ink" aria-label={`Add a ticket to ${s.label}`}>
                  <Plus size={15} />
                </button>
              </header>
              <ol className="scroll-thin flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {shown.map(t => (
                  <li key={t.id}>
                    <TaskCard t={t} all={tasks} dragging={dragId === t.id} onOpen={() => openTask(t.id)} onDrag={setDragId} />
                  </li>
                ))}
                {s.id === 'done' && col.length > shown.length ? <li className="px-2 py-1 text-xs text-ink-3">{col.length - shown.length} older in List view</li> : null}
                {!col.length ? <li className="rounded-lg border border-dashed border-line-strong px-3 py-5 text-center text-xs text-ink-3">Drop a ticket here</li> : null}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ t, all, dragging, onOpen, onDrag }: { t: Task; all: Task[]; dragging: boolean; onOpen: () => void; onDrag: (id: string | null) => void }) {
  const waiting = (t.dependsOn || []).filter(d => all.find(x => x.id === d)?.status !== 'done');
  return (
    <article
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDrag(t.id); }}
      onDragEnd={() => onDrag(null)}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      tabIndex={0}
      role="button"
      aria-label={`${t.id} ${t.title}`}
      className={cn('group cursor-pointer rounded-lg border border-line bg-surface p-3 shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-pop', dragging && 'opacity-50')}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-[11px] text-ink-3">{t.id}</span>
        <PriorityFlag priority={t.priority} />
      </div>
      <p className="line-clamp-3 text-[13.5px] leading-snug font-medium text-ink">{t.title}</p>
      <div className="mt-2.5 flex items-center gap-2.5 text-xs text-ink-3">
        <Avatar who={t.assignee} size={20} />
        {waiting.length ? <span className="inline-flex items-center gap-1 text-warn" title={`Waits on ${waiting.join(', ')}`}><Link2 size={13} />{waiting.length}</span> : null}
        {t.branch ? <span className="inline-flex items-center" title={t.branch}><GitBranch size={13} /></span> : null}
        {t.notes.length ? <span className="inline-flex items-center gap-1" title="Notes"><MessageSquare size={13} />{t.notes.length}</span> : null}
        <span className="ml-auto">{relTime(t.updated)}</span>
      </div>
    </article>
  );
}
