import * as React from 'react';
import { CheckCircle2, Eye, AlertOctagon, AlertTriangle, Sun } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { api } from '@/lib/api';
import type { Standup } from '@/lib/types';

// The morning standup, live: what happened in the last 24 hours, built from the event log.
export function StandupCard() {
  const [s, setS] = React.useState<Standup | null>(null);
  const stamp = useHive(s => s.data?.now);
  const openTask = useUI(s => s.openTask);
  React.useEffect(() => { api.get<Standup>('/api/standup').then(setS).catch(() => {}); }, [stamp]);
  if (!s) return null;

  const rows: { icon: React.ReactNode; label: string; items: { id: string; title: string }[] }[] = [
    { icon: <CheckCircle2 size={15} className="text-done" />, label: 'Done', items: s.done },
    { icon: <Eye size={15} className="text-review" />, label: 'To review', items: s.review },
    { icon: <AlertOctagon size={15} className="text-blocked" />, label: 'Blocked', items: s.blocked },
  ];

  return (
    <Card>
      <CardHeader title={<span className="inline-flex items-center gap-2"><Sun size={15} className="text-warn" />Last 24 hours</span>} sub={s.line} />
      <div className="flex flex-col gap-3 px-4 py-3">
        {rows.filter(r => r.items.length).map(r => (
          <div key={r.label}>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-2">{r.icon}{r.label} <span className="tabular font-normal text-ink-3">{r.items.length}</span></p>
            <ul className="flex flex-col">
              {r.items.slice(0, 4).map(t => (
                <li key={t.id}>
                  <button onClick={() => openTask(t.id)} className="flex w-full cursor-pointer gap-2 rounded-md px-1.5 py-1 text-left text-[13px] hover:bg-sunken">
                    <span className="w-24 shrink-0 font-mono text-[11px] leading-5 text-ink-3">{t.id}</span>
                    <span className="min-w-0 truncate">{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {s.deploys.length ? (
          <p className="flex items-start gap-1.5 rounded-lg bg-blocked-soft px-2.5 py-2 text-xs text-blocked"><AlertTriangle size={14} className="mt-px shrink-0" />{s.deploys.length} deploy command{s.deploys.length > 1 ? 's' : ''} ran. Check the live sites.</p>
        ) : null}
        <p className="text-xs text-ink-3">{s.runs.total} worker run{s.runs.total === 1 ? '' : 's'}, {s.runs.ok} finished.</p>
      </div>
    </Card>
  );
}
