import * as React from 'react';
import { cn } from '@/lib/utils';

const field = 'w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-soft disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-3';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(field, 'h-9', className)} {...p} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(field, 'min-h-20 py-2 leading-relaxed', className)} {...p} />
));
Textarea.displayName = 'Textarea';

export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, 'h-9 cursor-pointer pr-8', className)} {...p}>{children}</select>;
}

export function Field({ label, htmlFor, hint, children, className }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-2">{label}</label>
      {children}
      {hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-5 w-9 rounded-full transition-colors duration-150', checked ? 'bg-brand-ink' : 'bg-line-strong')}
      >
        <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150', checked && 'translate-x-4')} />
      </button>
      {label}
    </label>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-sunken p-0.5">
      {options.map(o => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn('h-7 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors', o.value === value ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
