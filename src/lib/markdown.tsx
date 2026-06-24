import React from 'react';
import { Callout } from '@/components/ui/Callout';

export interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugify(text: string): string {
  const clean = text.replace(/[\*_`\[\]\(\)]/g, '');
  return clean
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).trim();
      headings.push({
        id: slugify(text),
        text: text.replace(/[\*_`]/g, ''),
        level: 2,
      });
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).trim();
      headings.push({
        id: slugify(text),
        text: text.replace(/[\*_`]/g, ''),
        level: 3,
      });
    }
  }

  return headings;
}

export function parseInline(text: string): React.ReactNode[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, linkText, linkUrl, boldText, italicText, codeText] = match;
    const index = match.index;

    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index));
    }

    if (linkText && linkUrl) {
      result.push(
        <a
          key={index}
          href={linkUrl}
          className="text-primary hover:underline font-semibold"
          target={linkUrl.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      );
    } else if (boldText) {
      result.push(<strong key={index} className="font-bold">{boldText}</strong>);
    } else if (italicText) {
      result.push(<em key={index} className="italic">{italicText}</em>);
    } else if (codeText) {
      result.push(
        <code
          key={index}
          className="font-mono bg-primary-light text-primary-dark px-1.5 py-0.5 rounded text-[0.875rem] border border-border-strong font-medium"
        >
          {codeText}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

export function parseBlocks(content: string): React.ReactNode[] {
  const normalized = content.replace(/\r\n/g, '\n');
  const rawBlocks = normalized.split(/\n\n+/);

  return rawBlocks
    .map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('# ')) {
        const text = trimmed.slice(2);
        return (
          <h1
            key={idx}
            id={slugify(text)}
            className="text-[1.75rem] md:text-[2rem] font-bold mt-10 mb-6 text-text-primary leading-tight"
          >
            {parseInline(text)}
          </h1>
        );
      }

      if (trimmed.startsWith('## ')) {
        const text = trimmed.slice(3);
        return (
          <h2
            key={idx}
            id={slugify(text)}
            className="text-[1.375rem] md:text-[1.5rem] font-bold mt-10 mb-4 text-text-primary border-l-4 border-primary pl-3.5 leading-snug"
          >
            {parseInline(text)}
          </h2>
        );
      }

      if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4);
        return (
          <h3
            key={idx}
            id={slugify(text)}
            className="text-[1.125rem] md:text-[1.25rem] font-bold mt-8 mb-3 text-text-primary leading-snug"
          >
            {parseInline(text)}
          </h3>
        );
      }

      if (trimmed.startsWith('>')) {
        const lines = trimmed.split('\n');
        const quoteText = lines.map((line) => line.replace(/^>\s?/, '')).join('\n').trim();

        let title = 'সংজ্ঞা';
        let cleanText = quoteText;

        const titleMatch = quoteText.match(/^\*\*([^*]+)\*\*:\s*([\s\S]*)/);
        if (titleMatch) {
          title = titleMatch[1];
          cleanText = titleMatch[2];
        }

        return (
          <Callout key={idx} title={title}>
            {parseInline(cleanText)}
          </Callout>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="list-disc pl-6 mb-6 space-y-2 text-text-primary text-[1.125rem]">
            {lines.map((line, lIdx) => {
              const itemText = line.replace(/^[-*]\s+/, '');
              return <li key={lIdx}>{parseInline(itemText)}</li>;
            })}
          </ul>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const lines = trimmed.split('\n');
        return (
          <ol key={idx} className="list-decimal pl-6 mb-6 space-y-2 text-text-primary text-[1.125rem]">
            {lines.map((line, lIdx) => {
              const itemText = line.replace(/^\d+\.\s+/, '');
              return <li key={lIdx}>{parseInline(itemText)}</li>;
            })}
          </ol>
        );
      }

      return (
        <p key={idx} className="mb-6 text-text-primary leading-relaxed text-[1.125rem]">
          {parseInline(trimmed)}
        </p>
      );
    })
    .filter(Boolean) as React.ReactNode[];
}
