import * as React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useHive, EMPTY } from '@/store/hive';
import { useUI } from '@/store/ui';
import { Avatar, PriorityFlag } from '@/components/ui/badge';
import { useTaskFilter } from './Board';
import { cn, relTime, STATUSES, assigneeName } from '@/lib/utils';

// ClickUp-style list: grouped by status, each group collapsible, rows open the task panel.
export function ListView() {
  const tasks = useHive(s => s.data?.tasks ?? EMPTY);
  const { openTask, openNewTask } = useUI();
  const { filter, bar } = useTaskFilter();
  const [closed, setClosed] = React.useState<Record<string, boolean>>({ done: true });

  return (
    <div className="flex flex-col gap-4">
      {bar}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="hidden grid-cols-[110px_1fr_150px_90px_90px] gap-3 border-b border-line bg-canvas px-4 py-2 text-xs font-medium text-ink-3 md:grid">
          <span>ID</span><span>Title</span><span>Assignee</span><span>Priority</span><span className="text-right">Updated</span>
        </div>
        {STATUSES.map(s => {
          const rows = tasks.filter(t => t.status === s.id && filter(t)).sort((a, b) => b.updated.localeCompare(a.updated));
          const isClosed = closed[s.id];
          return (
            <section key={s.id} className="border-b border-line last:border-0">
              <div className="flex items-center gap-2 px-3 py-2">
                <button onClick={() => setClosed({ ...closed, [s.id]: !isClosed })} aria-expanded={!isClosed} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-sunken">
                  <ChevronDown size={15} className={cn('text-ink-3 transition-transform', isClosed && '-rotate-90')} />
                  <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold', s.soft, s.text)}><span className={cn('h-2 w-2 rounded-full', s.dot)} />{s.label}</span>
                  <span className="tabular text-xs text-ink-3">{rows.length}</span>
                </button>
                <button onClick={() => openNewTask({ status: s.id })} className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs text-ink-3 hover:bg-sunken hover:text-ink"><Plus size={14} />Add</button>
              </div>
              {!isClosed ? (
                <ul>
                  {rows.map(t => (
                    <li key={t.id}>
                      <button onClick={() => openTask(t.id)} className="grid w-full cursor-pointer grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t border-line/60 px-4 py-2.5 text-left text-[13.5px] hover:bg-canvas md:grid-cols-[110px_1fr_150px_90px_90px] md:items-center">
                        <span className="font-mono text-xs text-ink-3">{t.id}</span>
                        <span className="col-span-2 truncate font-medium md:col-span-1">{t.title}</span>
                        <span className="hidden items-center gap-2 text-xs text-ink-2 md:flex"><Avatar who={t.assignee} size={20} />{assigneeName(t.assignee)}</span>
                        <span className="hidden md:block"><PriorityFlag priority={t.priority} /></span>
                        <span className="text-right text-xs text-ink-3 max-md:row-start-1 max-md:col-start-2">{relTime(t.updated)}</span>
                      </button>
                    </li>
                  ))}
                  {!rows.length ? <li className="border-t border-line/60 px-4 py-3 text-xs text-ink-3">No tickets here.</li> : null}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
