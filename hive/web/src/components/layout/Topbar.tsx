import { Menu, Plus, Search, Inbox, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button, Kbd } from '@/components/ui/button';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { cn } from '@/lib/utils';

export function Topbar({ title, sub }: { title: string; sub?: string }) {
  const live = useHive(s => s.live);
  const inbox = useHive(s => s.data?.inbox.length || 0);
  const { setPalette, openNewTask, setNav, setConsult } = useUI();
  const theme = useTheme();
  const ThemeIcon = theme.pref === 'dark' ? Moon : theme.pref === 'system' ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line/70 bg-surface/75 px-4 backdrop-blur-xl saturate-180 lg:px-6">
      <button className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl text-ink-2 hover:bg-sunken lg:hidden" onClick={() => setNav(true)} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
        {sub ? <p className="hidden truncate text-xs text-ink-3 sm:block">{sub}</p> : null}
      </div>

      <button
        onClick={() => setPalette(true)}
        className="ml-auto hidden h-9 w-72 cursor-pointer items-center gap-2 rounded-xl border border-line/70 bg-sunken/50 px-3 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:bg-sunken md:flex"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search or run a command</span>
        <Kbd>Ctrl K</Kbd>
      </button>
      <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setPalette(true)} aria-label="Search"><Search size={17} /></Button>

      <span className={cn('hidden items-center gap-1.5 text-xs sm:inline-flex', live ? 'text-done' : 'text-blocked')} role="status">
        <span className={cn('h-2 w-2 rounded-full', live ? 'bg-done' : 'bg-blocked')} />
        {live ? 'Live' : 'Offline'}
      </span>

      {inbox ? (
        <a href="#/home" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-warn-soft px-2.5 text-xs font-medium text-warn" title="Orders waiting for Claude">
          <Inbox size={14} /> {inbox}
        </a>
      ) : null}

      <Button variant="ghost" size="icon" onClick={theme.cycle} aria-label={`Theme: ${theme.pref}. Switch`} title={`Theme: ${theme.pref}`}><ThemeIcon size={17} /></Button>
      <Button variant="secondary" className="hidden md:inline-flex" onClick={() => setConsult(true)} title="Ask a worker a read-only question"><Sparkles size={15} />Ask</Button>
      <Button variant="primary" onClick={() => openNewTask()} title="New ticket (N)" aria-label="New ticket">
        <Plus size={16} /> <span className="hidden sm:inline">New ticket</span>
      </Button>
    </header>
  );
}
