'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { getCategoryTree } from '@/lib/api';
import { useCategoryEvents } from '@/lib/use-category-events';
import { cn } from '@/lib/utils';
import type { CategoryTree } from '@/lib/types';

export function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get('category');

  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const fetchCategories = useCallback(() => {
    getCategoryTree().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // SSE: 카테고리 변경 시 자동 갱신
  useCategoryEvents(fetchCategories);

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 현재 slug가 이 대분류 또는 그 소분류에 해당하는지 확인
  const isParentActive = (cat: CategoryTree) => {
    if (currentSlug === cat.slug) return true;
    return cat.children.some((child) => child.slug === currentSlug);
  };

  const isAdmin = pathname.startsWith('/admin');
  const categoryBase = isAdmin ? '/admin/posts' : '/blog';

  if (categories.length === 0) return null;

  return (
    <nav className="flex flex-col gap-0.5">
      {categories.map((parent) => (
        <div key={parent.id}>
          {/* 대분류 헤더 */}
          <button
            onClick={() => toggleCollapse(parent.id)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors',
              isParentActive(parent)
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            <span>{parent.name}</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                collapsed[parent.id] && '-rotate-90',
              )}
            />
          </button>

          {/* 소분류 목록 */}
          {!collapsed[parent.id] && parent.children.length > 0 && (
            <div className="ml-3 border-l pl-2 flex flex-col gap-0.5">
              {parent.children.map((child) => (
                <Link
                  key={child.id}
                  href={`${categoryBase}?category=${child.slug}`}
                  className={cn(
                    'flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors',
                    currentSlug === child.slug
                      ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <span>{child.name}</span>
                  <span className="text-xs opacity-60">{child.post_count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
