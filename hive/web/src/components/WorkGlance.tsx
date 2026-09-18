import { Card, CardHeader } from '@/components/ui/card';
import { HBars } from '@/components/ui/charts';
import { ProportionBar } from '@/components/ui/charts-more';
import { useHive } from '@/store/hive';
import { STATUSES, assigneeName } from '@/lib/utils';

export const STATUS_COLOR: Record<string, string> = {
  todo: 'var(--color-todo)', in_progress: 'var(--color-progress)', needs_review: 'var(--color-review)', blocked: 'var(--color-blocked)', done: 'var(--color-done)',
};

// Where the work stands and who carries it.
export function WorkGlance() {
  const tasks = useHive(s => s.data?.tasks);
  if (!tasks) return null;
  const parts = STATUSES.map(s => ({ key: s.id, label: s.label, value: tasks.filter(t => t.status === s.id).length, color: STATUS_COLOR[s.id] }));
  const who = ['@claude', '@agy-cli', '@agy-desktop'].map(a => ({ key: a, label: assigneeName(a), value: tasks.filter(t => t.assignee === a && t.status !== 'done').length }));
  return (
    <Card>
      <CardHeader title="Work at a glance" sub={`${tasks.length} tickets, ${tasks.filter(t => t.status !== 'done').length} open`} />
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
        <div><p className="mb-2.5 text-xs font-semibold text-ink-3">By status</p><ProportionBar parts={parts} label="Tickets by status" /></div>
        <div><p className="mb-2.5 text-xs font-semibold text-ink-3">Open, by who carries it</p><HBars items={who} format={v => String(v)} /></div>
      </div>
    </Card>
  );
}
