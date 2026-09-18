export type Status = 'todo' | 'in_progress' | 'needs_review' | 'blocked' | 'done';

export interface Note { ts: string; by: string; text: string }

export interface Task {
  id: string;
  title: string;
  description: string;
  acceptance: string[];
  assignee: string;
  priority: 'low' | 'normal' | 'high' | string;
  status: Status;
  folder: string;
  branch: string;
  dependsOn?: string[];
  autoDispatch?: boolean;
  kind?: string;
  parent?: string;
  details?: string;
  notes: Note[];
  runs: string[];
  created: string;
  updated: string;
}

export interface Run {
  id: string;
  task: string;
  account: string;
  model: string;
  effort: string;
  kind: string;
  cwd: string;
  branch: string;
  isolated: boolean;
  state: 'running' | 'done' | 'failed' | 'killed' | 'lost';
  started: string;
  ended?: string;
  steps: number;
  lastStep?: string;
  tokens?: number;
  seconds?: number;
  response?: string;
  diffstat?: string;
}

export interface Agent {
  id: string;
  label: string;
  role: string;
  kind: 'head' | 'cli' | 'desktop';
  model?: string;
  state: string;
  enabled?: boolean;
  note?: string;
  maxParallel?: number;
  doing?: string[];
  runs?: { id: string; task: string; model: string; effort: string; steps: number; lastStep?: string; started: string }[];
  last?: { ts: string; msg: string } | null;
}

export interface HiveEvent { ts: string; type: string; actor: string; msg: string; data?: any }

export interface UsageRow { day: string; account: string; model: string; runs: number; total: number; fails: number; seconds: number }

export interface Budget { limit: number; used: number; pct: number; over: boolean; warnAt: number; hardStop: boolean }

export interface HiveState {
  now: string;
  tasks: Task[];
  runs: Run[];
  agents: Agent[];
  events: HiveEvent[];
  usage: {
    today: UsageRow[];
    last7: UsageRow[];
    exhausted: { key: string; until: string }[];
    claude: { messages: number; input: number; output: number; cacheRead: number; cacheWrite: number };
  };
  budget: Budget;
  inbox: { id: string; ts: string; from: string; text: string; files?: string[] }[];
  models: { allowed: string[]; routes: { kind: string; model: string; effort: string }[]; effort: { default: string; minimum: string } };
}

export interface Analytics {
  days: number;
  models: string[];
  perDay: ({ day: string } & Record<string, number | string>)[];
  perModel: { model: string; runs: number; fails: number; success: number | null; tokens: number; avgSeconds: number }[];
  kinds: { kind: string; runs: number; done: number; avgSeconds: number }[];
  topTickets: { task: string; tokens: number }[];
  totals: { runs: number; done: number; tokens: number };
  budget: Budget;
  flow: { day: string; created: number; done: number }[];
  hours: number[][];
  workload: { assignee: string; open: number; review: number; done: number }[];
  status: { status: string; count: number }[];
  consults: number;
}

export interface Step { i: number; type: string; tool: string | null; what?: string; output?: string; text: string; secs?: number; tokens?: number; state: string }

export interface Standup {
  since: string;
  line: string;
  done: { id: string; title: string }[];
  review: { id: string; title: string }[];
  blocked: { id: string; title: string; why: string }[];
  running: { id: string; title: string; who: string }[];
  runs: { total: number; ok: number };
  deploys: { ts: string; msg: string }[];
  quota: string[];
  orders: number;
}

export interface Schedule {
  id: string;
  label: string;
  kind: 'standup' | 'ticket';
  at: string;
  days: 'daily' | 'weekdays' | number[];
  enabled: boolean;
  dispatch?: boolean;
  note?: string;
  lastRun: string | null;
  ticket?: { title: string; description: string };
}
