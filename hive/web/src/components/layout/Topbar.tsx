import { Menu, Plus, Search, Inbox } from 'lucide-react';
import { Button, Kbd } from '@/components/ui/button';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { cn } from '@/lib/utils';

export function Topbar({ title, sub }: { title: string; sub?: string }) {
  const live = useHive(s => s.live);
  const inbox = useHive(s => s.data?.inbox.length || 0);
  const { setPalette, openNewTask, setNav } = useUI();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:px-6">
      <button className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-ink-2 hover:bg-sunken lg:hidden" onClick={() => setNav(true)} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
        {sub ? <p className="hidden truncate text-xs text-ink-3 sm:block">{sub}</p> : null}
      </div>

      <button
        onClick={() => setPalette(true)}
        className="ml-auto hidden h-9 w-72 cursor-pointer items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink-3 hover:border-line-strong md:flex"
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

      <Button variant="primary" onClick={() => openNewTask()} title="New ticket (N)" aria-label="New ticket">
        <Plus size={16} /> <span className="hidden sm:inline">New ticket</span>
      </Button>
    </header>
  );
}
