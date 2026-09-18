import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownTextProps {
  text?: string | null;
  className?: string;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushCodeBlock = (key: string | number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <pre
          key={`code-${key}`}
          className="my-2 overflow-x-auto rounded-lg bg-sunken p-2.5 font-mono text-xs text-ink leading-normal"
        >
          {codeBlockLines.join('\n')}
        </pre>
      );
      codeBlockLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock(i);
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,6})\s+/)?.[1].length || 1;
      const content = trimmed.replace(/^#{1,6}\s+/, '');
      const headingClass =
        level === 1
          ? 'text-base font-bold text-ink mt-3 mb-1'
          : level === 2
          ? 'text-[14.5px] font-semibold text-ink mt-2.5 mb-1'
          : 'text-[13.5px] font-semibold text-ink mt-2 mb-0.5';

      elements.push(
        <div key={`h-${i}`} className={headingClass}>
          {renderInline(content)}
        </div>
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 py-0.5 text-[13px] leading-relaxed text-ink">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-ink" />
          <span className="flex-1">{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = numMatch ? numMatch[1] : '1';
      const content = numMatch ? numMatch[2] : trimmed;
      elements.push(
        <div key={`oli-${i}`} className="flex items-start gap-2 py-0.5 text-[13px] leading-relaxed text-ink">
          <span className="font-mono text-xs text-ink-3 font-semibold">{num}.</span>
          <span className="flex-1">{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-line" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-[13px] leading-relaxed text-ink break-words">
        {renderInline(rawLine)}
      </p>
    );
  }

  if (inCodeBlock) {
    flushCodeBlock('end');
  }

  return <div className={cn('flex flex-col text-[13px]', className)}>{elements}</div>;
}

function renderInline(text: string): React.ReactNode[] {
  // Matches `code`, **bold**, [link](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-sunken px-1.5 py-0.5 font-mono text-[11.5px] text-brand-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-brand-ink underline hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}
