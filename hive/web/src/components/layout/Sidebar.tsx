import { Users, Home, Columns3, ListTodo, Activity, BarChart3, BookOpen, SlidersHorizontal, Terminal, Monitor, Bot, X } from 'lucide-react';
import { cn, tokens } from '@/lib/utils';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { navigate } from '@/hooks/useRoute';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Meter } from '@/components/ui/card';

export const NAV = [
  { id: 'home', label: 'Home', icon: Home, key: 'H' },
  { id: 'board', label: 'Board', icon: Columns3, key: 'B' },
  { id: 'list', label: 'List', icon: ListTodo, key: 'L' },
  { id: 'runs', label: 'Runs', icon: Activity, key: 'R' },
  { id: 'agents', label: 'Agents', icon: Users, key: 'T' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, key: 'A' },
  { id: 'brain', label: 'Brain', icon: BookOpen, key: 'M' },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal, key: 'S' },
] as const;

const STATE_DOT: Record<string, string> = { working: 'bg-progress', 'on duty': 'bg-gray-brand', 'has tickets': 'bg-review', idle: 'bg-line-strong', off: 'bg-line' };

export function launch(what: 'claude' | 'agy' | 'desktop') {
  api.post('/api/launch', { what })
    .then(() => toast.success(what === 'desktop' ? 'Antigravity Desktop opened' : `${what === 'claude' ? 'Claude' : 'agy'} opened in Windows Terminal`))
    .catch(e => toast.error(e.message));
}

export function Sidebar({ view }: { view: string }) {
  const data = useHive(s => s.data);
  const { navOpen, setNav } = useUI();
  const counts = {
    board: data?.tasks.filter(t => t.status !== 'done').length,
    runs: data?.runs.filter(r => r.state === 'running').length,
  } as Record<string, number | undefined>;
  const b = data?.budget;

  return (
    <>
      <div className={cn('fixed inset-0 z-30 bg-[rgba(16,24,40,0.16)] lg:hidden', navOpen ? 'block' : 'hidden')} onClick={() => setNav(false)} />
      <nav
        aria-label="Main"
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line/70 bg-surface/90 backdrop-blur-xl saturate-180 transition-transform duration-300 ease-apple lg:static lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-line/70 px-4">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-ink text-[13px] font-bold text-on-brand shadow-sm">H</span>
          <span className="font-semibold tracking-tight text-ink">HCIG Hive</span>
          <button className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-ink-3 hover:bg-sunken active:scale-95 transition-transform lg:hidden" onClick={() => setNav(false)} aria-label="Close menu"><X size={16} /></button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV.map(n => {
              const active = view === n.id || (view === 'task' && n.id === 'board') || (view === 'run' && n.id === 'runs');
              return (
                <li key={n.id}>
                  <a
                    href={`#/${n.id}`}
                    onClick={() => setNav(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn('flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13.5px] font-medium transition-all duration-150 active:scale-[0.98]',
                      active ? 'bg-brand-soft text-brand-ink font-semibold' : 'text-ink-2 hover:bg-sunken/80 hover:text-ink')}
                  >
                    <n.icon size={17} strokeWidth={1.9} />
                    <span className="flex-1">{n.label}</span>
                    {counts[n.id] ? <span className={cn('tabular rounded-md px-1.5 text-[11px] font-semibold', active ? 'bg-surface text-brand-ink shadow-sm' : 'bg-sunken text-ink-3')}>{counts[n.id]}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 mb-1.5 px-2.5 text-[11px] font-semibold tracking-wide text-ink-3 uppercase">Fleet</p>
          <ul className="flex flex-col gap-0.5">
            {(data?.agents || []).map(a => (
              <li key={a.id}>
                <button onClick={() => { navigate('/home'); setNav(false); }} className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink-2 hover:bg-sunken">
                  <span className="relative">
                    <Bot size={16} strokeWidth={1.9} className={a.state === 'off' ? 'text-line-strong' : 'text-ink-3'} />
                    <span className={cn('absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full ring-2 ring-surface', STATE_DOT[a.state] || 'bg-line-strong')} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                  <span className="text-[11px] text-ink-3">{a.state}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line p-3">
          {b ? (
            <div className="mb-3 px-1">
              <div className="mb-1.5 flex justify-between text-[11px] text-ink-3">
                <span>Worker tokens today</span>
                <span className="tabular">{tokens(b.used)} / {tokens(b.limit)}</span>
              </div>
              <Meter value={b.pct} />
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-1.5">
            {([['claude', 'Claude', Terminal], ['agy', 'agy', Terminal], ['desktop', 'Desktop', Monitor]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => launch(k)} className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-line text-[11px] font-medium text-ink-2 hover:border-brand-ink hover:text-brand-ink" title={`Open ${l}`}>
                <I size={15} />{l}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
