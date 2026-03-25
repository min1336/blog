'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, BookOpen, Briefcase, User, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/about', label: 'About', icon: User },
];

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  // 검색창 표시 여부 상태
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // 현재 경로에 맞는 검색 대상 결정
  const searchBasePath = pathname.startsWith('/portfolio') ? '/portfolio' : '/blog';
  const searchPlaceholder = pathname.startsWith('/portfolio') ? '프로젝트 검색...' : '글 검색...';

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`${searchBasePath}?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(searchBasePath);
    }
    setSearchOpen(false);
    setSearchValue('');
  }

  function handleSearchClose() {
    setSearchOpen(false);
    setSearchValue('');
  }

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

      {/* 검색창 확장 영역 */}
      {searchOpen && (
        <div className="px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => {
                if (e.target.value.length <= 100) setSearchValue(e.target.value);
              }}
              maxLength={100}
              autoFocus
              className="w-full pl-10 pr-8 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleSearchClose}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground"
                aria-label="검색어 초기화"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
