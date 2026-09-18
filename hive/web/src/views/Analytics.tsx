import * as React from 'react';
import { toast } from 'sonner';
import { BarChart3, Table2 } from 'lucide-react';
import { useHive } from '@/store/hive';
import { Card, CardHeader, Empty, Kpi } from '@/components/ui/card';
import { Segmented } from '@/components/ui/form';
import { StackedBars, HBars, Legend, DataTable } from '@/components/ui/charts';
import { api } from '@/lib/api';
import { duration, modelColor, modelName, pct, tokens } from '@/lib/utils';
import type { Analytics } from '@/lib/types';

export function AnalyticsView() {
  const [days, setDays] = React.useState(14);
  const [a, setA] = React.useState<Analytics | null>(null);
  const [asTable, setAsTable] = React.useState(false);
  const runsCount = useHive(s => s.data?.runs.length);
  const claude = useHive(s => s.data?.usage.claude);

  React.useEffect(() => { api.get<Analytics>(`/api/analytics?days=${days}`).then(setA).catch(e => toast.error(e.message)); }, [days, runsCount]);
  if (!a) return null;

  const success = a.totals.runs ? a.totals.done / a.totals.runs : null;
  const empty = !a.totals.runs && !a.totals.tokens;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Time range" value={days} onChange={setDays} options={[{ value: 7, label: '7 days' }, { value: 14, label: '14 days' }, { value: 30, label: '30 days' }]} />
        <p className="text-xs text-ink-3">Worker tokens come from agy runs. Claude Code is shown on its own.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={`Worker tokens, ${days} days`} value={tokens(a.totals.tokens)} hint={`${a.models.length} model${a.models.length === 1 ? '' : 's'} used`} />
        <Kpi label="Runs" value={a.totals.runs} hint={`${a.totals.done} finished`} />
        <Kpi label="Success rate" value={pct(success)} tone={success !== null && success < 0.7 ? 'blocked' : undefined} hint="Finished without failing" />
        <Kpi label="Claude Code today" value={tokens((claude?.output || 0) + (claude?.input || 0))} hint={`${claude?.messages || 0} messages, ${tokens(claude?.cacheRead)} from cache`} />
      </div>

      {empty ? <Card><Empty icon={<BarChart3 size={22} />} title="No worker runs in this range" hint="Charts fill in as soon as the first worker finishes." /></Card> : <>
        <Card>
          <CardHeader title="Tokens per day, by model" sub="Each model keeps its color everywhere in the Hive"
            action={<button onClick={() => setAsTable(!asTable)} aria-pressed={asTable} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs text-ink-2 hover:border-line-strong">{asTable ? <BarChart3 size={14} /> : <Table2 size={14} />}{asTable ? 'Chart' : 'Table'}</button>} />
          <div className="flex flex-col gap-3 p-4">
            {a.models.length > 1 ? <Legend series={a.models} /> : null}
            {asTable
              ? <DataTable head={['Day', ...a.models.map(modelName), 'Total']} rows={a.perDay.map(r => [r.day, ...a.models.map(m => tokens(Number(r[m]))), tokens(a.models.reduce((s, m) => s + Number(r[m] || 0), 0))])} />
              : <StackedBars rows={a.perDay} series={a.models} />}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Success rate by model" sub="Runs that finished without failing" />
            <div className="p-4">
              <HBars items={a.perModel.map(m => ({ key: m.model, label: modelName(m.model), value: m.success ?? 0, sub: `${m.runs} runs` }))} max={1} format={v => pct(v)} colorOf={modelColor} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Average time per run" sub="By model, every run including failures" />
            <div className="p-4">
              <HBars items={a.perModel.map(m => ({ key: m.model, label: modelName(m.model), value: m.avgSeconds }))} format={v => duration(v)} colorOf={modelColor} />
            </div>
          </Card>
          <Card>
            <CardHeader title="By kind of work" sub="How the router splits the work, and how long each kind takes" />
            <DataTable className="px-1 pb-2" head={['Kind', 'Runs', 'Finished', 'Avg time']} rows={a.kinds.map(k => [k.kind, k.runs, k.done, duration(k.avgSeconds)])} />
          </Card>
          <Card>
            <CardHeader title="Most expensive tickets" sub="Worker tokens per ticket" />
            <div className="p-4">
              {a.topTickets.length ? <HBars items={a.topTickets.map(t => ({ key: t.task, label: t.task, value: t.tokens }))} format={tokens} /> : <p className="text-[13px] text-ink-3">Token counts per ticket start with the next worker run.</p>}
            </div>
          </Card>
        </div>
      </>}
    </div>
  );
}
