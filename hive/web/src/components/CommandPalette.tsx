import { Command } from 'cmdk';
import { toast } from 'sonner';
import { Plus, RefreshCw, Bell, Terminal, Monitor, Hash, CornerDownLeft, Sparkles } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useHive, EMPTY } from '@/store/hive';
import { navigate } from '@/hooks/useRoute';
import { NAV, launch } from '@/components/layout/Sidebar';
import { StatusPill } from '@/components/ui/badge';
import { api } from '@/lib/api';

const item = 'flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[13.5px] text-ink-2 data-[selected=true]:bg-brand-soft data-[selected=true]:text-ink';

export function CommandPalette() {
  const { palette, setPalette, openNewTask, openTask, setConsult } = useUI();
  const tasks = useHive(s => s.data?.tasks ?? EMPTY);
  const close = () => setPalette(false);
  const run = (fn: () => void) => () => { close(); fn(); };

  if (!palette) return null;
  return (
    <div className="fixed inset-0 z-50 grid justify-items-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-[rgba(16,24,40,0.2)]" onClick={close} />
      <Command label="Command palette" className="relative h-fit w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-pop" onKeyDown={e => { if (e.key === 'Escape') close(); }}>
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Hash size={16} className="text-ink-3" />
          <Command.Input autoFocus placeholder="Jump to a ticket, a view, or run a command" className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-3" />
        </div>
        <Command.List className="scroll-thin max-h-[380px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-ink-3">Nothing matches.</Command.Empty>
          <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-3">
            <Command.Item className={item} onSelect={run(() => openNewTask())}><Plus size={16} />New ticket<Shortcut k="N" /></Command.Item>
            <Command.Item className={item} onSelect={run(() => setConsult(true))}><Sparkles size={16} />Ask a worker a question (read-only)</Command.Item>
            <Command.Item className={item} onSelect={run(() => launch('claude'))}><Terminal size={16} />Open Claude in a terminal</Command.Item>
            <Command.Item className={item} onSelect={run(() => launch('agy'))}><Terminal size={16} />Open agy in a terminal</Command.Item>
            <Command.Item className={item} onSelect={run(() => launch('desktop'))}><Monitor size={16} />Open Antigravity Desktop</Command.Item>
            <Command.Item className={item} onSelect={run(() => api.post('/api/brain/rebuild').then(() => toast.success('Brain rebuilt')))}><RefreshCw size={16} />Rebuild the shared brain</Command.Item>
            <Command.Item className={item} onSelect={run(() => api.post('/api/notify/test').then(() => toast.success('Test alert sent')))}><Bell size={16} />Send a test alert</Command.Item>
          </Command.Group>
          <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-3">
            {NAV.map(n => (
              <Command.Item key={n.id} className={item} onSelect={run(() => navigate(`/${n.id}`))}><n.icon size={16} />{n.label}<Shortcut k={`G ${n.key}`} /></Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Tickets" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-3">
            {tasks.slice().sort((a, b) => b.updated.localeCompare(a.updated)).map(t => (
              <Command.Item key={t.id} value={`${t.id} ${t.title}`} className={item} onSelect={run(() => openTask(t.id))}>
                <span className="w-24 shrink-0 font-mono text-xs text-ink-3">{t.id}</span>
                <span className="min-w-0 flex-1 truncate">{t.title}</span>
                <StatusPill status={t.status} />
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
        <div className="flex items-center gap-4 border-t border-line bg-canvas px-4 py-2 text-[11px] text-ink-3">
          <span className="inline-flex items-center gap-1"><CornerDownLeft size={12} /> open</span>
          <span>↑ ↓ move</span>
          <span>Esc close</span>
        </div>
      </Command>
    </div>
  );
}

function Shortcut({ k }: { k: string }) {
  return <span className="ml-auto font-mono text-[11px] text-ink-3">{k}</span>;
}
