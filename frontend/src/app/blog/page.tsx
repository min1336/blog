import { Suspense } from 'react';
import { getPosts, getCategories } from '@/lib/api';
import { PostCard } from '@/components/blog/post-card';
import { SearchInput } from '@/components/blog/search-input';
import type { Post, Category } from '@/lib/types';

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

  const [postsRes, categoriesRes] = await Promise.all([
    getPosts(query.toString()),
    getCategories(),
  ]);

  const posts = postsRes.data as Post[];
  const categories = categoriesRes.data as Category[];
  const meta = postsRes.meta;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          {params.search && (
            <p className="text-sm text-muted-foreground mt-1">
              &ldquo;{params.search}&rdquo; 검색 결과
            </p>
          )}
        </div>
        <div className="w-64">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/blog"
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${!params.category ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'hover:bg-accent'}`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.category}
              href={`/blog?category=${cat.category}`}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${params.category === cat.category ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'hover:bg-accent'}`}
            >
              {cat.category} ({cat.count})
            </a>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16">
          {/* 검색 중이면 검색 결과 없음, 아니면 게시글 없음 메시지 구분 */}
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
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-12">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/blog?page=${p}${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params.tag ? `&tag=${encodeURIComponent(params.tag)}` : ''}`}
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
