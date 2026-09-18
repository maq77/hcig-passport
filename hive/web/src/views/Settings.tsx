import * as React from 'react';
import { toast } from 'sonner';
import { Bell, Save } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Toggle } from '@/components/ui/form';
import { useHive } from '@/store/hive';
import { api } from '@/lib/api';
import { modelName } from '@/lib/utils';

interface Cfg {
  budget: { dailyTokens: number; warnAt: number; hardStop: boolean };
  notify: { desktop: boolean; ntfyTopic: string; on: string[] };
  models: { allowBelowBest: boolean; routes: { kind: string; model: string; effort: string }[]; tiers: Record<string, string[]> };
  accounts: { id: string; label: string; kind: string; enabled: boolean; maxParallel?: number; note?: string }[];
  fullAccess: boolean;
}

const ALERTS = [['run.end', 'A worker finishes or fails'], ['deploy.alert', 'A worker runs a deploy or server command'], ['budget', 'The token budget passes its warning line'], ['quota', 'A model hits its quota'], ['order', 'A new order for Claude']] as const;

export function SettingsView() {
  const [c, setC] = React.useState<Cfg | null>(null);
  const [saving, setSaving] = React.useState(false);
  const refresh = useHive(s => s.refresh);
  React.useEffect(() => { api.get<Cfg>('/api/config').then(setC).catch(e => toast.error(e.message)); }, []);
  if (!c) return null;
  const models = [...c.models.tiers.best, ...c.models.tiers.strong, ...(c.models.allowBelowBest ? c.models.tiers.fallbackBelowBest : [])];

  const save = async () => {
    setSaving(true);
    try {
      setC(await api.patch<Cfg>('/api/config', { budget: c.budget, notify: c.notify, allowBelowBest: c.models.allowBelowBest, routes: c.models.routes, accounts: c.accounts.map(a => ({ id: a.id, enabled: a.enabled, maxParallel: a.maxParallel })) }));
      toast.success('Settings saved'); refresh();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <Card>
        <CardHeader title="Token budget" sub="Worker tokens per day across all agy accounts" />
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <Field label="Daily limit" htmlFor="b-lim"><Input id="b-lim" type="number" min={0} step={100000} value={c.budget.dailyTokens} onChange={e => setC({ ...c, budget: { ...c.budget, dailyTokens: +e.target.value } })} /></Field>
          <Field label="Warn at" htmlFor="b-warn" hint="Share of the limit"><Select id="b-warn" value={c.budget.warnAt} onChange={e => setC({ ...c, budget: { ...c.budget, warnAt: +e.target.value } })}>{[0.5, 0.7, 0.8, 0.9].map(v => <option key={v} value={v}>{v * 100}%</option>)}</Select></Field>
          <div className="flex items-end pb-2"><Toggle id="b-stop" checked={c.budget.hardStop} onChange={v => setC({ ...c, budget: { ...c.budget, hardStop: v } })} label="Pause new workers at the limit" /></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Model routing" sub="Best models only. Effort high by default and never below medium. Only Gemini accepts an effort setting." />
        <div className="flex flex-col gap-2 p-4">
          {c.models.routes.map((r, i) => (
            <div key={r.kind} className="grid grid-cols-[90px_1fr_130px] items-center gap-3">
              <span className="text-[13px] font-medium capitalize">{r.kind}</span>
              <Select aria-label={`${r.kind} model`} value={r.model} onChange={e => { const routes = [...c.models.routes]; routes[i] = { ...r, model: e.target.value }; setC({ ...c, models: { ...c.models, routes } }); }}>
                {models.map(m => <option key={m} value={m}>{modelName(m)}</option>)}
              </Select>
              <Select aria-label={`${r.kind} effort`} value={r.effort} disabled={!r.model.startsWith('gemini-')} onChange={e => { const routes = [...c.models.routes]; routes[i] = { ...r, effort: e.target.value }; setC({ ...c, models: { ...c.models, routes } }); }}>
                <option value="high">High</option><option value="medium">Medium</option>
              </Select>
            </div>
          ))}
          <div className="mt-2"><Toggle id="m-below" checked={c.models.allowBelowBest} onChange={v => setC({ ...c, models: { ...c.models, allowBelowBest: v } })} label="Allow Gemini Flash as a last fallback when every best model is out of quota" /></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Accounts" sub={c.fullAccess ? 'Workers run with full access, by your choice. Every deploy command raises an alert.' : 'Workers stop at a committed branch.'} />
        <ul className="divide-y divide-line">
          {c.accounts.map((a, i) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1"><p className="text-[13.5px] font-medium">{a.label}</p>{a.note ? <p className="text-xs text-ink-3">{a.note}</p> : null}</div>
              {a.kind === 'cli' ? <>
                <Field label="At once" htmlFor={`a-${a.id}`} className="w-24"><Input id={`a-${a.id}`} type="number" min={1} max={6} value={a.maxParallel || 1} onChange={e => { const accounts = [...c.accounts]; accounts[i] = { ...a, maxParallel: +e.target.value }; setC({ ...c, accounts }); }} /></Field>
                <Toggle id={`e-${a.id}`} checked={a.enabled} onChange={v => { const accounts = [...c.accounts]; accounts[i] = { ...a, enabled: v }; setC({ ...c, accounts }); }} label="Enabled" />
              </> : <span className="text-xs text-ink-3">Takes tickets from the board</span>}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Alerts" sub="Desktop notifications, and your phone through the free ntfy app if you set a topic" action={<Button size="sm" onClick={() => api.post('/api/notify/test').then(() => toast.success('Test alert sent'))}><Bell size={14} />Send test</Button>} />
        <div className="flex flex-col gap-4 p-4">
          <Toggle id="n-desk" checked={c.notify.desktop} onChange={v => setC({ ...c, notify: { ...c.notify, desktop: v } })} label="Windows desktop notifications" />
          <Field label="ntfy topic for phone alerts" htmlFor="n-topic" hint="Use a long random name: anyone who knows it can read the alerts. Leave empty to keep alerts on this PC only.">
            <Input id="n-topic" value={c.notify.ntfyTopic} onChange={e => setC({ ...c, notify: { ...c.notify, ntfyTopic: e.target.value.trim() } })} placeholder="hive-7f3k9q2x" />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium text-ink-2">Alert me when</legend>
            {ALERTS.map(([k, l]) => (
              <label key={k} className="inline-flex cursor-pointer items-center gap-2 text-[13.5px]">
                <input type="checkbox" className="h-4 w-4 accent-[var(--color-brand-ink)]" checked={c.notify.on.includes(k)} onChange={e => setC({ ...c, notify: { ...c.notify, on: e.target.checked ? [...c.notify.on, k] : c.notify.on.filter(x => x !== k) } })} />
                {l}
              </label>
            ))}
          </fieldset>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button variant="primary" loading={saving} onClick={save}><Save size={15} />Save settings</Button>
      </div>
    </div>
  );
}
