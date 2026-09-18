import * as React from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea, Toggle } from '@/components/ui/form';
import { useUI } from '@/store/ui';
import { useHive } from '@/store/hive';
import { api } from '@/lib/api';
import { assigneeName } from '@/lib/utils';
import type { Task } from '@/lib/types';

const EMPTY = { title: '', description: '', acceptance: '', assignee: '@agy-cli', kind: '', folder: '', priority: 'normal', dependsOn: '', auto: false, go: false };

export function NewTaskDialog() {
  const { newTask, closeNewTask, openTask } = useUI();
  const refresh = useHive(s => s.refresh);
  const [f, setF] = React.useState(EMPTY);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (newTask.open) { setF({ ...EMPTY, assignee: newTask.assignee || EMPTY.assignee }); setErr(''); setTimeout(() => titleRef.current?.focus(), 30); }
  }, [newTask.open, newTask.assignee]);

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
        status: newTask.status, actor: 'dashboard', dispatch: f.go && f.assignee === '@agy-cli' ? {} : undefined,
      });
      toast.success(`${t.id} created${f.go ? ' and a worker started' : ''}`);
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
        <Field label="Brief" htmlFor="nt-desc" hint="The worker starts cold. Name the files, the goal and the rules.">
          <Textarea id="nt-desc" rows={4} value={f.description} onChange={set('description')} />
        </Field>
        <Field label="Acceptance criteria" htmlFor="nt-acc" hint="One per line. Each should be checkable.">
          <Textarea id="nt-acc" rows={3} value={f.acceptance} onChange={set('acceptance')} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Assignee" htmlFor="nt-as"><Select id="nt-as" value={f.assignee} onChange={set('assignee')}>{['@agy-cli', '@agy-desktop', '@claude'].map(a => <option key={a} value={a}>{assigneeName(a)}</option>)}</Select></Field>
          <Field label="Kind" htmlFor="nt-kind"><Select id="nt-kind" value={f.kind} onChange={set('kind')}><option value="">Auto route</option>{['code', 'design', 'content', 'review', 'bulk', 'research'].map(k => <option key={k}>{k}</option>)}</Select></Field>
          <Field label="Priority" htmlFor="nt-pr"><Select id="nt-pr" value={f.priority} onChange={set('priority')}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></Select></Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Folder" htmlFor="nt-folder"><Input id="nt-folder" value={f.folder} onChange={set('folder')} placeholder="e.g. docs or src/247site" /></Field>
          <Field label="Waits on" htmlFor="nt-dep" hint="Ticket ids, comma separated"><Input id="nt-dep" value={f.dependsOn} onChange={set('dependsOn')} placeholder="T-001, T-002" /></Field>
        </div>
        <div className="flex flex-col gap-2.5">
          {f.dependsOn.trim() ? <Toggle id="nt-auto" checked={f.auto} onChange={v => setF({ ...f, auto: v })} label="Start a worker on its own once those are done" /> : null}
          {f.assignee === '@agy-cli' && !f.dependsOn.trim() ? <Toggle id="nt-go" checked={f.go} onChange={v => setF({ ...f, go: v })} label="Start a worker now" /> : null}
        </div>
        {err ? <p role="alert" className="text-[13px] text-blocked">{err}</p> : null}
      </form>
    </Dialog>
  );
}
