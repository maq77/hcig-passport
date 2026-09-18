import * as React from 'react';
import { Toaster } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { useHive } from '@/store/hive';
import { useUI } from '@/store/ui';
import { useRoute, navigate } from '@/hooks/useRoute';
import { Sidebar, NAV } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { TaskPanel } from '@/components/TaskPanel';
import { NewTaskDialog } from '@/components/NewTaskDialog';
import { CommandPalette } from '@/components/CommandPalette';
import { ConsultDialog } from '@/components/ConsultDialog';
import { HomeView } from '@/views/Home';
import { BoardView } from '@/views/Board';
import { ListView } from '@/views/List';
import { RunsView, RunReplayView } from '@/views/Runs';
import { AnalyticsView } from '@/views/Analytics';
import { BrainView } from '@/views/Brain';
import { SettingsView } from '@/views/Settings';

const TITLES: Record<string, [string, string]> = {
  home: ['Home', 'What needs you, who is working, and what just happened'],
  board: ['Board', 'Drag a ticket to change its status. Click it to open.'],
  task: ['Board', 'Drag a ticket to change its status. Click it to open.'],
  list: ['List', 'Every ticket, grouped by status'],
  runs: ['Runs', 'Worker runs and their replays'],
  run: ['Run replay', 'Every step the worker took'],
  analytics: ['Analytics', 'Tokens, success and time, per model and per kind of work'],
  brain: ['Brain', 'The shared memory every agent reads'],
  settings: ['Settings', 'Budget, models, accounts and alerts'],
};

export default function App() {
  const route = useRoute();
  const { data, connect, refresh, error, lastDeploy, dismissDeploy } = useHive();
  const { openTask, setPalette, openNewTask, palette, newTask, taskId } = useUI();

  React.useEffect(() => { refresh(); return connect(); }, [refresh, connect]);
  React.useEffect(() => { if (route.view === 'task' && route.id) openTask(route.id); }, [route.view, route.id, openTask]);

  // Keyboard: Ctrl K palette, N new ticket, G then a letter to jump.
  React.useEffect(() => {
    let g = false, gTimer: ReturnType<typeof setTimeout>;
    const on = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(!palette); return; }
      if (typing || palette || newTask.open || e.ctrlKey || e.metaKey || e.altKey) return;
      if (g) { const n = NAV.find(x => x.key.toLowerCase() === e.key.toLowerCase()); g = false; if (n) { e.preventDefault(); navigate(`/${n.id}`); } return; }
      if (e.key === 'g') { g = true; clearTimeout(gTimer); gTimer = setTimeout(() => (g = false), 900); return; }
      if (e.key === 'n' && !taskId) { e.preventDefault(); openNewTask(); }
      if (e.key === '/') { e.preventDefault(); setPalette(true); }
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [palette, newTask.open, taskId, setPalette, openNewTask]);

  const [title, sub] = TITLES[route.view] || TITLES.home;
  const view = route.view === 'task' ? 'board' : route.view;

  return (
    <div className="flex h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">Skip to content</a>
      <Sidebar view={route.view} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} sub={sub} />
        {lastDeploy ? (
          <div role="alert" className="flex items-start gap-3 border-b border-alert-line bg-blocked-soft px-4 py-2.5 text-[13px] text-blocked lg:px-6">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1"><strong className="font-semibold">Deploy command by {lastDeploy.actor}.</strong> {lastDeploy.msg}</p>
            <button onClick={dismissDeploy} className="grid h-6 w-6 cursor-pointer place-items-center rounded hover:bg-surface" aria-label="Dismiss"><X size={14} /></button>
          </div>
        ) : null}
        <main id="main" className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          {!data ? (
            error ? <p className="text-[13px] text-blocked">The hub is not answering: {error}. Start it with hive.bat.</p> : <Skeleton />
          ) : view === 'home' ? <HomeView />
            : view === 'board' ? <BoardView />
            : view === 'list' ? <ListView />
            : view === 'runs' ? <RunsView />
            : view === 'run' && route.id ? <RunReplayView id={route.id} />
            : view === 'analytics' ? <AnalyticsView />
            : view === 'brain' ? <BrainView />
            : view === 'settings' ? <SettingsView />
            : <HomeView />}
        </main>
      </div>
      <TaskPanel />
      <NewTaskDialog />
      <CommandPalette />
      <ConsultDialog />
      <Toaster position="bottom-right" richColors closeButton theme={document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'} toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[10px] bg-sunken" />)}</div>
      <div className="h-72 animate-pulse rounded-[10px] bg-sunken" />
    </div>
  );
}
