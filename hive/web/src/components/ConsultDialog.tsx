import * as React from 'react';
import { toast } from 'sonner';
import { Sparkles, Copy } from 'lucide-react';
import { Dialog } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea } from '@/components/ui/form';
import { AttachBar, DropArea, useAttachments } from '@/components/Attachments';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { api } from '@/lib/api';
import { modelName, tokens } from '@/lib/utils';

// Ask a worker a read-only question (the /delegate pattern). No ticket, no edits.
export function ConsultDialog() {
  const { consult, setConsult } = useUI();
  const models = useHive(s => s.data?.models.allowed);
  const [q, setQ] = React.useState('');
  const [model, setModel] = React.useState('gemini-3.1-pro-high');
  const [busy, setBusy] = React.useState(false);
  const [answer, setAnswer] = React.useState<{ answer: string; model: string; seconds: number; tokens: number } | null>(null);
  const att = useAttachments();

  const ask = async () => {
    if (!q.trim()) return;
    setBusy(true); setAnswer(null);
    try { setAnswer(await api.post('/api/consult', { question: q.trim(), files: att.files.map(f => f.path), model })); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Dialog open={consult} onClose={() => setConsult(false)} title="Ask a worker" width={680}
      footer={<><Button onClick={() => setConsult(false)}>Close</Button><Button variant="primary" loading={busy} onClick={ask}><Sparkles size={15} />{busy ? 'Thinking' : 'Ask'}</Button></>}>
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-2">A quick, read-only answer from an agy model. It can read files, never change them. Good for second opinions and big documents.</p>
        <DropArea att={att}>
          <Field label="Question" htmlFor="c-q">
            <Textarea id="c-q" rows={4} value={q} onChange={e => setQ(e.target.value)} onPaste={att.onPaste} placeholder="What should the worker look at, and what do you want back?"
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) ask(); }} />
          </Field>
        </DropArea>
        <AttachBar att={att} />
        <Field label="Model" htmlFor="c-m" className="w-64">
          <Select id="c-m" value={model} onChange={e => setModel(e.target.value)}>{(models || ['gemini-3.1-pro-high']).map(m => <option key={m} value={m}>{modelName(m)}</option>)}</Select>
        </Field>
        {busy ? <p className="text-[13px] text-ink-3" role="status">Working. Big files take a minute or two.</p> : null}
        {answer ? (
          <div className="rounded-lg border border-line bg-canvas">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs text-ink-3">
              {modelName(answer.model)} · {answer.seconds}s · {tokens(answer.tokens)} tokens
              <button className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 hover:bg-sunken" onClick={() => navigator.clipboard.writeText(answer.answer).then(() => toast.success('Copied'))}><Copy size={12} />Copy</button>
            </div>
            <p className="scroll-thin max-h-80 overflow-y-auto px-3 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
