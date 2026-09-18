import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

function useEscape(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [open, onClose]);
}

// Focus moves into the overlay on open, Tab cycles inside it, and focus returns
// to whatever opened it on close.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function useFocusTrap(ref: React.RefObject<HTMLElement | null>, open: boolean) {
  React.useEffect(() => {
    if (!open || !ref.current) return;
    const el = ref.current;
    const before = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => { if (!el.contains(document.activeElement)) (el.querySelector<HTMLElement>('[autofocus]') || el).focus({ preventScroll: true }); }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(x => x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); el.removeEventListener('keydown', onKey); before?.focus?.(); };
  }, [open, ref]);
}

// Right-hand panel, like a ClickUp task view. Light scrim, never dark.
export function SlideOver({ open, onClose, title, width = 720, children, headerExtra }: { open: boolean; onClose: () => void; title: React.ReactNode; width?: number; children: React.ReactNode; headerExtra?: React.ReactNode }) {
  useEscape(open, onClose);
  const panel = React.useRef<HTMLElement>(null);
  useFocusTrap(panel, open);
  return (
    <div className={cn('fixed inset-0 z-40', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div className={cn('absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-apple', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        className={cn('absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-pop transition-transform duration-300 ease-apple', open ? 'translate-x-0' : 'translate-x-full')}
        style={{ maxWidth: width }}
      >
        <header className="flex items-center gap-3 border-b border-line/70 px-5 py-3.5">
          <div className="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-tight">{title}</div>
          {headerExtra}
          <button onClick={onClose} className="grid h-8 w-8 cursor-pointer place-items-center rounded-xl text-ink-3 hover:bg-sunken hover:text-ink active:scale-95 transition-transform" aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto">{open ? children : null}</div>
      </aside>
    </div>
  );
}

export function Dialog({ open, onClose, title, children, footer, width = 560 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  useEscape(open, onClose);
  const box = React.useRef<HTMLDivElement>(null);
  useFocusTrap(box, open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-items-center overflow-y-auto p-4 pt-[10vh]">
      <div className="fixed inset-0 bg-black/25 backdrop-blur-md transition-opacity duration-200" onClick={onClose} />
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="relative w-full rounded-2xl border border-line/80 bg-surface shadow-pop transition-all duration-200 ease-apple" style={{ maxWidth: width }}>
        <header className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 cursor-pointer place-items-center rounded-xl text-ink-3 hover:bg-sunken hover:text-ink active:scale-95 transition-transform" aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-line/70 bg-sunken/40 px-5 py-3 rounded-b-2xl">{footer}</footer> : null}
      </div>
    </div>
  );
}
