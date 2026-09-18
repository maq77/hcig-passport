import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Status } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== FORMATTING ====================

export function relTime(ts?: string | null): string {
  if (!ts) return '';
  const s = (Date.now() - Date.parse(ts)) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function clock(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function tokens(n?: number): string {
  if (!n) return '0';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(n);
}

export function duration(sec?: number): string {
  if (!sec && sec !== 0) return '';
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  return `${Math.floor(sec / 3600)}h ${Math.round((sec % 3600) / 60)}m`;
}

export function pct(n: number | null | undefined): string {
  return n === null || n === undefined ? '-' : `${Math.round(n * 100)}%`;
}

// ==================== STATUS ====================

export const STATUSES: { id: Status; label: string; dot: string; text: string; soft: string }[] = [
  { id: 'todo', label: 'To do', dot: 'bg-todo', text: 'text-todo', soft: 'bg-todo-soft' },
  { id: 'in_progress', label: 'In progress', dot: 'bg-progress', text: 'text-progress', soft: 'bg-progress-soft' },
  { id: 'needs_review', label: 'Needs review', dot: 'bg-review', text: 'text-review', soft: 'bg-review-soft' },
  { id: 'blocked', label: 'Blocked', dot: 'bg-blocked', text: 'text-blocked', soft: 'bg-blocked-soft' },
  { id: 'done', label: 'Done', dot: 'bg-done', text: 'text-done', soft: 'bg-done-soft' },
];
export const statusMeta = (s: string) => STATUSES.find(x => x.id === s) || STATUSES[0];

export const RUN_STATE: Record<string, { label: string; tone: 'progress' | 'done' | 'blocked' | 'todo' | 'warn' }> = {
  running: { label: 'Running', tone: 'progress' },
  done: { label: 'Finished', tone: 'done' },
  failed: { label: 'Failed', tone: 'blocked' },
  killed: { label: 'Stopped', tone: 'todo' },
  lost: { label: 'Lost', tone: 'warn' },
};

// ==================== MODELS ====================
// Color follows the entity, never its rank: each model keeps its slot everywhere.
const MODEL_SLOTS: Record<string, string> = {
  'claude-opus-4-6-thinking': 'var(--color-s1)',
  'gemini-3.1-pro-high': 'var(--color-s2)',
  'claude-sonnet-4-6': 'var(--color-s3)',
  'gemini-3.8-flash-high': 'var(--color-s4)',
  'gpt-oss-120b-medium': 'var(--color-s5)',
};
export const modelColor = (m: string) => MODEL_SLOTS[m] || 'var(--color-ink-3)';

const MODEL_NAMES: Record<string, string> = {
  'claude-opus-4-6-thinking': 'Claude Opus 4.6',
  'gemini-3.1-pro-high': 'Gemini 3.1 Pro',
  'claude-sonnet-4-6': 'Claude Sonnet 4.6',
  'gemini-3.8-flash-high': 'Gemini 3.8 Flash',
  'gpt-oss-120b-medium': 'GPT-OSS 120B',
  'claude-opus-5': 'Claude Opus 5',
};
export const modelName = (m?: string) => (m ? MODEL_NAMES[m] || m : '');

export function assigneeName(a: string): string {
  return ({ '@claude': 'Claude', '@agy-cli': 'agy worker', '@agy-desktop': 'agy Desktop' } as Record<string, string>)[a] || a;
}
