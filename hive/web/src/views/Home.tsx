import * as React from 'react';
import { toast } from 'sonner';
import { Send, ArrowRight, Eye, AlertOctagon, Inbox } from 'lucide-react';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { Card, CardHeader, Empty, Kpi } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { StatusPill } from '@/components/ui/badge';
import { AgentCard } from '@/components/AgentCard';
import { EventFeed } from '@/components/EventFeed';
import { StandupCard } from '@/components/StandupCard';
import { AttachBar, DropArea, useAttachments } from '@/components/Attachments';
import { WorkGlance } from '@/components/WorkGlance';
import { api } from '@/lib/api';
import { relTime, tokens, assigneeName, pct } from '@/lib/utils';

export function HomeView() {
  const data = useHive(s => s.data);
  const refresh = useHive(s => s.refresh);
  const openTask = useUI(s => s.openTask);
  const [order, setOrder] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const att = useAttachments();
  if (!data) return null;

  const running = data.runs.filter(r => r.state === 'running').length;
  const review = data.tasks.filter(t => t.status === 'needs_review');
  const blocked = data.tasks.filter(t => t.status === 'blocked');
  const week = data.usage.last7;
  const runs7 = week.reduce((a, r) => a + r.runs, 0), fails7 = week.reduce((a, r) => a + r.fails, 0);
  const needsYou = [...blocked, ...review];

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.trim()) return;
    setSending(true);
    try { await api.post('/api/orders', { text: order.trim(), files: att.files.map(f => f.path) }); setOrder(''); att.clear(); toast.success('Sent to Claude. It reads orders at the start of its next turn.'); refresh(); }
    catch (x) { toast.error((x as Error).message); } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Workers running" value={running} tone={running ? 'progress' : undefined} hint={running ? 'Live now' : 'All idle'} />
        <Kpi label="Needs review" value={review.length} tone={review.length ? 'review' : undefined} hint="Waiting for Claude" />
        <Kpi label="Blocked" value={blocked.length} tone={blocked.length ? 'blocked' : undefined} hint={blocked.length ? 'See below' : 'Nothing stuck'} />
        <Kpi label="Worker tokens today" value={tokens(data.budget.used)} meter={data.budget.pct} hint={`of ${tokens(data.budget.limit)} daily budget`} />
        <Kpi label="Success, 7 days" value={runs7 ? pct((runs7 - fails7) / runs7) : '-'} hint={`${runs7} runs, ${fails7} failed`} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader title="Needs you" sub="Blocked tickets, work to review, and orders not yet read" />
            {needsYou.length || data.inbox.length ? (
              <ul className="divide-y divide-line">
                {data.inbox.map(i => (
                  <li key={i.id} className="flex items-start gap-3 px-4 py-3">
                    <Inbox size={16} className="mt-0.5 text-warn" />
                    <div className="min-w-0 flex-1"><p className="text-[13.5px]">{i.text}</p>{i.files?.length ? <p className="truncate text-xs text-ink-3">{i.files.length} attached: {i.files.map(f => f.split(/[\/]/).pop()).join(', ')}</p> : null}<p className="text-xs text-ink-3">Order for Claude · {relTime(i.ts)}</p></div>
                  </li>
                ))}
                {needsYou.map(t => (
                  <li key={t.id}>
                    <button onClick={() => openTask(t.id)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-canvas">
                      {t.status === 'blocked' ? <AlertOctagon size={16} className="text-blocked" /> : <Eye size={16} className="text-review" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                        <p className="truncate text-xs text-ink-3"><span className="font-mono">{t.id}</span> · {assigneeName(t.assignee)} · {relTime(t.updated)}{t.notes.length ? ` · ${t.notes[t.notes.length - 1].text.slice(0, 90)}` : ''}</p>
                      </div>
                      <StatusPill status={t.status} />
                      <ArrowRight size={15} className="text-ink-3" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Empty title="All caught up 🎉" hint="Nothing blocked, nothing waiting for review." />}
          </Card>

          <WorkGlance />

          <div>
            <h2 className="mb-3 text-sm font-semibold">Fleet</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{data.agents.map(a => <AgentCard key={a.id} a={a} />)}</div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <StandupCard />
          <Card>
            <CardHeader title="Tell Claude" sub="Claude reads these with hive_inbox and plans the work" />
            <form onSubmit={send} className="flex flex-col gap-2 p-4">
              <DropArea att={att}>
                <Textarea rows={4} value={order} onChange={e => setOrder(e.target.value)} onPaste={att.onPaste} placeholder="An order for the head, in your own words. Paste screenshots, drop files." aria-label="Order for Claude"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(e); }} />
              </DropArea>
              <AttachBar att={att} />
              <div className="flex items-center justify-between"><span className="text-xs text-ink-3">Ctrl Enter to send</span><Button variant="primary" loading={sending} type="submit"><Send size={15} />Send</Button></div>
            </form>
          </Card>
          <Card className="flex max-h-[640px] min-h-[360px] flex-col">
            <CardHeader title="Live activity" className="mb-3" />
            <EventFeed className="flex-1" />
          </Card>
        </div>
      </div>
    </div>
  );
}
