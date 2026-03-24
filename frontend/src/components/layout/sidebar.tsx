'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Briefcase, User } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/about', label: 'About', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-background p-6">
      <Link href="/" className="mb-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-muted mb-3" />
          <h2 className="font-bold text-lg">My Blog</h2>
          <p className="text-sm text-muted-foreground">개발 학습 기록</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
}
