import * as React from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea, Toggle } from '@/components/ui/form';
import { useUI } from '@/store/ui';
import { useHive } from '@/store/hive';
import { api } from '@/lib/api';
import { assigneeName } from '@/lib/utils';
import { AttachBar, DropArea, useAttachments } from '@/components/Attachments';
import { Wand2 } from 'lucide-react';
import type { Task } from '@/lib/types';

const EMPTY = { agent: 'auto', title: '', description: '', acceptance: '', assignee: 'auto', kind: '', folder: '', priority: 'normal', dependsOn: '', auto: false, go: true };

export function NewTaskDialog() {
  const { newTask, closeNewTask, openTask } = useUI();
  const refresh = useHive(s => s.refresh);
  const [f, setF] = React.useState(EMPTY);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const titleRef = React.useRef<HTMLInputElement>(null);
  const att = useAttachments();
  const [roles, setRoles] = React.useState<{ id: string; name: string }[]>([]);
  React.useEffect(() => { if (newTask.open && !roles.length) api.get<{ id: string; name: string }[]>('/api/agents').then(setRoles).catch(() => {}); }, [newTask.open, roles.length]);
  const [tri, setTri] = React.useState<{ assignee: string; rule: string; why: string; kind: string; agent?: string | null; agentName?: string | null } | null>(null);
  React.useEffect(() => {
    if (!f.title.trim()) { setTri(null); return; }
    const t = setTimeout(() => api.post<{ assignee: string; rule: string; why: string; kind: string; agent?: string | null; agentName?: string | null }>('/api/triage', { title: f.title, description: f.description, priority: f.priority, kind: f.kind || undefined, agent: f.agent === 'auto' ? undefined : f.agent }).then(setTri).catch(() => {}), 350);
    return () => clearTimeout(t);
  }, [f.title, f.description, f.priority, f.kind, f.assignee, f.agent]);

  React.useEffect(() => {
    if (newTask.open) { setF({ ...EMPTY, assignee: newTask.assignee || EMPTY.assignee, agent: newTask.agent || 'auto', go: true }); setErr(''); att.clear(); setTimeout(() => titleRef.current?.focus(), 30); }
  }, [newTask.open, newTask.assignee, newTask.agent]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!f.title.trim()) { setErr('Give the ticket a title.'); titleRef.current?.focus(); return; }
    setBusy(true);
    try {
      const t = await api.post<Task>('/api/tasks', {
        title: f.title.trim(), description: f.description.trim(), assignee: f.assignee, kind: f.kind || undefined, folder: f.folder.trim(), priority: f.priority,
        acceptance: f.acceptance.split('\n').map(s => s.trim()).filter(Boolean),
        dependsOn: f.dependsOn.split(/[\s,]+/).map(s => s.trim()).filter(Boolean), autoDispatch: f.auto,
        agent: f.agent === 'auto' ? undefined : f.agent, status: newTask.status, actor: 'dashboard', files: att.files.map(x => x.path), dispatch: f.go ? {} : undefined,
      });
      toast.success(`${t.id} created for ${assigneeName(t.assignee)}${f.go ? ', opened on screen' : ''}`);
      closeNewTask(); await refresh(); openTask(t.id);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  return (
    <Dialog open={newTask.open} onClose={closeNewTask} title="New ticket" width={620}
      footer={<><Button onClick={closeNewTask}>Cancel</Button><Button variant="primary" loading={busy} onClick={() => submit()}>Create ticket</Button></>}>
      <form onSubmit={submit} className="flex flex-col gap-4" onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}>
        <Field label="Title" htmlFor="nt-title">
          <Input id="nt-title" ref={titleRef} value={f.title} onChange={set('title')} placeholder="What needs doing" aria-invalid={!!err && !f.title} />
        </Field>
        <DropArea att={att}>
          <Field label="Brief" htmlFor="nt-desc" hint="In your own words. Paste screenshots, drop files, or add a path below.">
            <Textarea id="nt-desc" rows={5} value={f.description} onChange={set('description')} onPaste={att.onPaste} />
          </Field>
        </DropArea>
        <AttachBar att={att} />
        <Field label="Acceptance criteria" htmlFor="nt-acc" hint="One per line. Each should be checkable.">
          <Textarea id="nt-acc" rows={3} value={f.acceptance} onChange={set('acceptance')} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Assignee" htmlFor="nt-as"><Select id="nt-as" value={f.assignee} onChange={set('assignee')}><option value="auto">Auto: Claude decides</option>{['@agy-cli', '@agy-desktop', '@claude'].map(a => <option key={a} value={a}>{assigneeName(a)}</option>)}</Select></Field>
          <Field label="Kind" htmlFor="nt-kind"><Select id="nt-kind" value={f.kind} onChange={set('kind')}><option value="">Auto route</option>{['code', 'design', 'content', 'review', 'bulk', 'research'].map(k => <option key={k}>{k}</option>)}</Select></Field>
          <Field label="Priority" htmlFor="nt-pr"><Select id="nt-pr" value={f.priority} onChange={set('priority')}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></Select></Field>
        </div>
        <Field label="Specialist" htmlFor="nt-agent" hint="Which expert does the work. Auto picks one from your wording.">
          <Select id="nt-agent" value={f.agent} onChange={set('agent')}>
            <option value="auto">Auto: pick from the wording{tri?.agentName && f.agent === 'auto' ? ` (${tri.agentName})` : ''}</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Folder" htmlFor="nt-folder"><Input id="nt-folder" value={f.folder} onChange={set('folder')} placeholder="e.g. docs or src/247site" /></Field>
          <Field label="Waits on" htmlFor="nt-dep" hint="Ticket ids, comma separated"><Input id="nt-dep" value={f.dependsOn} onChange={set('dependsOn')} placeholder="T-001, T-002" /></Field>
        </div>
        {tri ? (
          <p className="flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2 text-[13px] text-ink" role="status">
            <Wand2 size={15} className="mt-0.5 shrink-0 text-brand-ink" />
            <span><b>{assigneeName(f.assignee === 'auto' ? tri.assignee : f.assignee)}</b> will take it{tri.agentName ? <> as the <b>{tri.agentName}</b></> : null} ({tri.kind}). {f.assignee === 'auto' ? tri.why : ''}{tri.assignee === '@agy-cli' ? ' A worker starts as soon as you create it.' : ''}</span>
          </p>
        ) : null}
        <div className="flex flex-col gap-2.5">
          {f.dependsOn.trim() ? <Toggle id="nt-auto" checked={f.auto} onChange={v => setF({ ...f, auto: v })} label="Start on its own once dependencies finish" /> : null}
          {!f.dependsOn.trim() ? <Toggle id="nt-go" checked={f.go} onChange={v => setF({ ...f, go: v })} label="Start immediately and open on screen" /> : null}
        </div>
        {err ? <p role="alert" className="text-[13px] text-blocked">{err}</p> : null}
      </form>
    </Dialog>
  );
}
