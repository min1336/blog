'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-');
      items.push({ id, text, level: match[1].length });
    }
    setHeadings(items);
  }, [content]);

  if (headings.length === 0) return null;

  // h1은 페이지 헤더에 있으므로 h2, h3만 표시
  const filtered = headings.filter((h) => h.level >= 2);
  if (filtered.length === 0) return null;

  return (
    <nav className="border rounded-lg p-5 mb-10 bg-muted/30">
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">목차</h3>
      <ul className="space-y-1.5">
        {filtered.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 16}px` }}
          >
            <a
              href={`#${h.id}`}
              className={cn(
                'text-sm transition-colors hover:text-foreground',
                h.level === 2 ? 'text-foreground/80 font-medium' : 'text-muted-foreground',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
