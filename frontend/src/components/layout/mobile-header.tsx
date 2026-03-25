'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Briefcase, User, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { SearchInput } from '@/components/blog/search-input';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/about', label: 'About', icon: User },
];

export function MobileHeader() {
  const pathname = usePathname();
  // 검색창 표시 여부 상태
  const [searchOpen, setSearchOpen] = useState(false);

  // 현재 경로에 맞는 검색 대상 결정
  const searchBasePath = pathname.startsWith('/portfolio') ? '/portfolio' : '/blog';
  const searchPlaceholder = pathname.startsWith('/portfolio') ? '프로젝트 검색...' : '글 검색...';

  return (
    <header className="md:hidden flex flex-col border-b bg-background">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          Min&apos;s Dev Blog
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* 검색 아이콘 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="검색"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <Sheet>
            {/* @base-ui/react는 asChild 대신 render prop 패턴을 사용 (SheetClose와 동일) */}
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                      pathname.startsWith(item.href)
                        ? 'bg-accent font-medium'
                        : 'text-muted-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 검색창 확장 영역 — 기존 SearchInput 컴포넌트 재사용 (길이 제한, 초기화 로직 공유) */}
      {searchOpen && (
        <div className="px-4 pb-3">
          <SearchInput basePath={searchBasePath} placeholder={searchPlaceholder} />
        </div>
      )}
    </header>
  );
}
