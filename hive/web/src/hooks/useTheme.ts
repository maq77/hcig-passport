import { useEffect, useState } from 'react';

export type ThemePref = 'light' | 'dark' | 'system';
const KEY = 'hive-theme';

function read(): ThemePref {
  try { return (localStorage.getItem(KEY) as ThemePref) || 'light'; } catch { return 'light'; }
}

function apply(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

// Light by default. The choice is a per-browser convenience, so localStorage is enough.
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(read);
  useEffect(() => {
    apply(pref);
    try { localStorage.setItem(KEY, pref); } catch { /* private mode: still applies for this visit */ }
    if (pref !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => apply('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [pref]);
  return { pref, setPref, cycle: () => setPref(p => (p === 'light' ? 'dark' : p === 'dark' ? 'system' : 'light')) };
}

apply(read());
