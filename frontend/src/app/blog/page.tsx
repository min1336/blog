import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getPosts } from '@/lib/api';
import { SearchInput } from '@/components/blog/search-input';
import type { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: '블로그',
  description: '웹 개발 학습 과정에서 배운 것들을 기록하고 공유합니다.',
  openGraph: {
    title: '블로그 | Min\'s Dev Blog',
    description: '웹 개발 학습 과정에서 배운 것들을 기록하고 공유합니다.',
  },
};

/**
 * 페이지네이션 URL 생성 헬퍼 — 현재 필터(category, tag, search)를 유지하며 page만 변경
 */
function buildPageUrl(
  page: number,
  params: { category?: string; tag?: string; search?: string },
): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (params.category) qs.set('category', params.category);
  if (params.tag) qs.set('tag', params.tag);
  if (params.search) qs.set('search', params.search);
  return `/blog?${qs.toString()}`;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.tag) query.set('tag', params.tag);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page);

  const postsRes = await getPosts(query.toString());
  const posts = postsRes.data as Post[];
  const meta = postsRes.meta;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          {params.search && (
            <p className="text-sm text-muted-foreground mt-1">
              &ldquo;{params.search}&rdquo; 검색 결과
            </p>
          )}
          {params.category && (
            <p className="text-sm text-muted-foreground mt-1">
              {params.category}
            </p>
          )}
        </div>
        <div className="w-64">
          <Suspense fallback={<div className="h-10 w-full rounded-lg border bg-muted animate-pulse" />}>
            <SearchInput />
          </Suspense>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          {params.search ? (
            <>
              <p className="text-muted-foreground text-lg">
                &ldquo;{params.search}&rdquo; 검색 결과가 없습니다.
              </p>
              <p className="text-sm text-muted-foreground mt-1">다른 키워드로 검색해보세요.</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-lg">아직 글이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">첫 번째 글을 작성해보세요.</p>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex items-baseline gap-4 py-3.5 group transition-colors hover:bg-accent/50 -mx-3 px-3 rounded-lg"
            >
              <time className="text-sm text-muted-foreground shrink-0 tabular-nums w-24">
                {new Date(post.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </time>
              <span className="text-sm group-hover:text-foreground transition-colors truncate">
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-12">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={buildPageUrl(p, params)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors ${p === meta.page ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'hover:bg-accent'}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
