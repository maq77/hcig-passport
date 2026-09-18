import * as React from 'react';
import { toast } from 'sonner';
import { Paperclip, X, FileText, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Attached { path: string; name: string; size?: number; image?: boolean }

async function upload(file: File): Promise<Attached> {
  const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name || 'pasted.png')}`, { method: 'POST', body: file });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || 'Upload failed');
  return { path: j.path, name: j.name, size: j.size, image: file.type.startsWith('image/') };
}

// Paste, drop or browse files and images, or paste a path. Each file is saved by the
// hub and handed to the agents as an absolute path.
export function useAttachments() {
  const [files, setFiles] = React.useState<Attached[]>([]);
  const [busy, setBusy] = React.useState(0);
  const add = React.useCallback(async (list: FileList | File[]) => {
    const arr = [...list];
    if (!arr.length) return;
    setBusy(b => b + arr.length);
    for (const f of arr) {
      try { const a = await upload(f); setFiles(x => [...x, a]); }
      catch (e) { toast.error(`${f.name}: ${(e as Error).message}`); }
      finally { setBusy(b => b - 1); }
    }
  }, []);
  const addPath = (p: string) => setFiles(x => [...x, { path: p, name: p.split(/[\\/]/).pop() || p }]);
  const remove = (p: string) => setFiles(x => x.filter(f => f.path !== p));
  const clear = () => setFiles([]);
  // Pasting a file or screenshot into the text box attaches it; plain text pastes as text.
  const onPaste = (e: React.ClipboardEvent) => {
    const fs = [...e.clipboardData.files];
    if (fs.length) { e.preventDefault(); add(fs); }
  };
  return { files, busy, add, addPath, remove, clear, onPaste };
}

export function DropArea({ att, children, className }: { att: ReturnType<typeof useAttachments>; children: React.ReactNode; className?: string }) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      className={cn('relative rounded-lg transition-shadow', over && 'ring-2 ring-brand-ink', className)}
      onDragOver={e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { if (!e.dataTransfer.files.length) return; e.preventDefault(); setOver(false); att.add(e.dataTransfer.files); }}
    >
      {children}
      {over ? <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-brand-soft/80 text-sm font-medium text-brand-ink">Drop to attach</div> : null}
    </div>
  );
}

export function AttachBar({ att }: { att: ReturnType<typeof useAttachments> }) {
  const input = React.useRef<HTMLInputElement>(null);
  const [path, setPath] = React.useState('');
  const [showPath, setShowPath] = React.useState(false);
  return (
    <div className="flex flex-col gap-2">
      {att.files.length || att.busy ? (
        <ul className="flex flex-wrap gap-1.5">
          {att.files.map(f => (
            <li key={f.path} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-sunken py-1 pr-1 pl-2 text-xs" title={f.path}>
              {f.image ? <ImageIcon size={13} className="text-ink-3" /> : f.size === undefined ? <FolderOpen size={13} className="text-ink-3" /> : <FileText size={13} className="text-ink-3" />}
              <span className="max-w-52 truncate">{f.name}</span>
              <button type="button" onClick={() => att.remove(f.path)} className="grid h-5 w-5 cursor-pointer place-items-center rounded text-ink-3 hover:bg-surface hover:text-ink" aria-label={`Remove ${f.name}`}><X size={12} /></button>
            </li>
          ))}
          {att.busy ? <li className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-ink-3"><span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />Uploading {att.busy}</li> : null}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-1">
        <input ref={input} type="file" multiple hidden onChange={e => { if (e.target.files) att.add(e.target.files); e.target.value = ''; }} />
        <button type="button" onClick={() => input.current?.click()} className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs text-ink-2 hover:bg-sunken"><Paperclip size={13} />Attach files</button>
        <button type="button" onClick={() => setShowPath(!showPath)} className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs text-ink-2 hover:bg-sunken"><FolderOpen size={13} />Add a path</button>
        <span className="text-[11px] text-ink-3">or paste a screenshot, or drop files here</span>
      </div>
      {showPath ? (
        <div className="flex gap-2">
          <input value={path} onChange={e => setPath(e.target.value)} placeholder="D:\folder\file.pdf" aria-label="File or folder path"
            className="h-8 flex-1 rounded-md border border-line bg-surface px-2.5 text-xs focus:border-brand-ink focus:outline-none"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (path.trim()) { att.addPath(path.trim().replace(/^"|"$/g, '')); setPath(''); } } }} />
          <button type="button" className="h-8 cursor-pointer rounded-md border border-line px-2.5 text-xs hover:bg-sunken" onClick={() => { if (path.trim()) { att.addPath(path.trim().replace(/^"|"$/g, '')); setPath(''); } }}>Add</button>
        </div>
      ) : null}
    </div>
  );
}
