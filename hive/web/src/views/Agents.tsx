import * as React from 'react';
import { toast } from 'sonner';
import { Terminal, Plus, Radio, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, Avatar } from '@/components/ui/badge';
import { Input } from '@/components/ui/form';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { api } from '@/lib/api';
import { assigneeName, modelName } from '@/lib/utils';

export interface Role { id: string; name: string; lead: string; when: string; kind: string; agyModel: string; skills: string[]; mcp: string[]; open: number; done: number; running: string[] }

const KIND_TONE: Record<string, 'brand' | 'review' | 'progress' | 'warn' | 'todo'> = { code: 'progress', design: 'brand', research: 'review', content: 'warn', review: 'todo', bulk: 'todo' };

// The specialist roster. Each role exists as a Claude subagent and an agy skill,
// defined once in hive/agents/roles.js.
export function AgentsView() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [q, setQ] = React.useState('');
  const stamp = useHive(s => s.data?.now);
  const openNewTask = useUI(s => s.openNewTask);
  React.useEffect(() => { api.get<Role[]>('/api/agents').then(setRoles).catch(e => toast.error(e.message)); }, [stamp]);

  const open = (r: Role, withWho: 'agy' | 'claude') =>
    api.post('/api/launch', { what: 'role', role: r.id, with: withWho })
      .then(() => toast.success(`${r.name} opened live in ${withWho === 'claude' ? 'Claude' : 'agy'}`))
      .catch(e => toast.error(e.message));
  const watch = (run: string) => api.post('/api/launch', { what: 'watch', run }).then(() => toast.success('Live monitor opened')).catch(e => toast.error(e.message));

  const shown = roles.filter(r => !q || `${r.name} ${r.when} ${r.id}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a specialist" className="pl-9" aria-label="Find a specialist" />
        </div>
        <p className="text-xs text-ink-3">{roles.length} specialists. Each works in Claude and in agy. New tickets pick one from their wording unless you choose.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map(r => (
          <Card key={r.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <Avatar who={r.lead} size={30} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{r.name}</p>
                <p className="text-xs text-ink-3">Led by {assigneeName(r.lead)} · agy runs {modelName(r.agyModel)}</p>
              </div>
              <Badge tone={KIND_TONE[r.kind] || 'todo'}>{r.kind}</Badge>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-2">{r.when}</p>
            {r.skills.length || r.mcp.length ? (
              <p className="flex flex-wrap gap-1">
                {[...r.skills, ...r.mcp.map(m => `mcp:${m}`)].map(s => <span key={s} className="rounded bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-3">{s}</span>)}
              </p>
            ) : null}
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="text-xs text-ink-3"><b className="tabular text-ink">{r.open}</b> open · {r.done} done</span>
              <span className="flex-1" />
              {r.running.length ? <Button size="sm" variant="subtle" onClick={() => watch(r.running[0])}><Radio size={13} />Watch</Button> : null}
              <Button size="sm" onClick={() => open(r, 'agy')} title="Open this specialist live in agy"><Terminal size={13} />agy</Button>
              <Button size="sm" onClick={() => open(r, 'claude')} title="Open this specialist live in Claude"><Terminal size={13} />Claude</Button>
              <Button size="sm" variant="primary" onClick={() => openNewTask({ agent: r.id })} title="New ticket for this specialist"><Plus size={13} />Ticket</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
