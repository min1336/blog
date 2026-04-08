'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { CategoryNav } from '@/components/layout/category-nav';
import { getSettings, updateSettings } from '@/lib/api';
import { cn } from '@/lib/utils';

// 더블클릭으로 인라인 편집 가능한 텍스트
function EditableText({
  value,
  onSave,
  className,
  inputClassName,
}: {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setText(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (text.trim() && text !== value) onSave(text.trim());
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') { setText(value); setEditing(false); }
        }}
        className={cn('bg-transparent border-b border-dashed border-foreground/30 outline-none text-center w-full', inputClassName)}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className={cn('cursor-default', className)}
      title="더블클릭으로 수정"
    >
      {value}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const [siteName, setSiteName] = useState("Min's Dev Blog");
  const [siteDesc, setSiteDesc] = useState('배우고 기록하고 공유하기');

  useEffect(() => {
    getSettings().then((res) => {
      if (res.success && res.data) {
        if (res.data.site_name) setSiteName(res.data.site_name);
        if (res.data.site_description) setSiteDesc(res.data.site_description);
      }
    });
  }, []);

  const handleSaveName = (value: string) => {
    setSiteName(value);
    updateSettings({ site_name: value });
  };

  const handleSaveDesc = (value: string) => {
    setSiteDesc(value);
    updateSettings({ site_description: value });
  };

  const staticNavItems = isAdmin
    ? [
        { href: '/admin/projects', label: 'Projects', icon: Briefcase },
        { href: '/about', label: 'About', icon: User },
      ]
    : [
        { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
        { href: '/about', label: 'About', icon: User },
      ];

  return (
    <aside className="sidebar-desktop flex-col w-64 min-h-screen border-r bg-background p-6">
      <Link href={isAdmin ? '/admin' : '/'} className="mb-8 group">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <span className="text-2xl font-bold text-zinc-100 dark:text-zinc-900">MH</span>
          </div>
          {isAdmin ? (
            <>
              <EditableText
                value={siteName}
                onSave={handleSaveName}
                className="font-bold text-lg"
                inputClassName="font-bold text-lg"
              />
              <EditableText
                value={siteDesc}
                onSave={handleSaveDesc}
                className="text-sm text-muted-foreground"
                inputClassName="text-sm text-muted-foreground"
              />
            </>
          ) : (
            <>
              <h2 className="font-bold text-lg">{siteName}</h2>
              <p className="text-sm text-muted-foreground">{siteDesc}</p>
            </>
          )}
        </div>
      </Link>

      <Separator className="mb-4" />

      {/* 계층형 카테고리 네비게이션 */}
      <div className="mb-4 flex-1 overflow-y-auto">
        <Suspense fallback={null}>
          <CategoryNav />
        </Suspense>
      </div>

      <Separator className="mb-4" />

      {/* 정적 링크 */}
      <nav className="flex flex-col gap-1 mb-4">
        {staticNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <Separator className="mb-4" />

      <div className="flex items-center justify-center gap-3">
        <a
          href="https://github.com/min1336"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <ThemeToggle />
      </div>
    </aside>
  );
}
