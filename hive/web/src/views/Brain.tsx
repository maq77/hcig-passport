import * as React from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

// The shared brain every agent reads, rendered as light markdown.
export function BrainView() {
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { api.get<{ text: string }>('/api/brain').then(r => setText(r.text)).catch(e => toast.error(e.message)); }, []);

  const rebuild = async () => {
    setBusy(true);
    try { const r = await api.post<{ text: string }>('/api/brain/rebuild'); setText(r.text); toast.success('Brain rebuilt from memory, rules and the board'); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader title="Shared brain" sub="What every agent reads before it works. Rebuilt on its own when memory, rules or the board change."
        action={<Button size="sm" loading={busy} onClick={rebuild}><RefreshCw size={14} />Rebuild</Button>} />
      <article className="mx-auto max-w-3xl px-6 py-6 text-[14px] leading-relaxed">{render(text)}</article>
    </Card>
  );
}

function inline(s: string): React.ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('`') ? <code key={i} className="rounded bg-sunken px-1 py-px font-mono text-[12.5px]">{p.slice(1, -1)}</code> : p);
}

function render(md: string) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={out.length} className="my-2 flex list-disc flex-col gap-1 pl-5">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  for (const line of md.split('\n')) {
    if (/^\s*[-*] /.test(line)) { list.push(line.replace(/^\s*[-*] /, '')); continue; }
    flush();
    if (line.startsWith('# ')) out.push(<h1 key={out.length} className="mt-2 mb-3 text-xl font-semibold tracking-tight">{inline(line.slice(2))}</h1>);
    else if (line.startsWith('## ')) out.push(<h2 key={out.length} className="mt-6 mb-2 border-b border-line pb-1 text-base font-semibold">{inline(line.slice(3))}</h2>);
    else if (line.startsWith('### ')) out.push(<h3 key={out.length} className="mt-4 mb-1 text-sm font-semibold">{inline(line.slice(4))}</h3>);
    else if (line.trim() && !/^---+$/.test(line.trim()) && !line.startsWith('|')) out.push(<p key={out.length} className="my-1.5 text-ink-2">{inline(line)}</p>);
    else if (line.startsWith('|')) out.push(<p key={out.length} className="font-mono text-[12px] text-ink-3">{line}</p>);
  }
  flush();
  return out;
}
