'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Briefcase, User } from 'lucide-react';
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

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
      <Link href="/" className="font-bold text-lg">
        My Blog
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
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
    </header>
  );
}
