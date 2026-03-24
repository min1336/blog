import { getPosts, getCategories } from '@/lib/api';
import { PostCard } from '@/components/blog/post-card';
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href="/blog"
            className={`text-sm px-3 py-1 rounded-full border ${!params.category ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.category}
              href={`/blog?category=${cat.category}`}
              className={`text-sm px-3 py-1 rounded-full border ${params.category === cat.category ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
            >
              {cat.category} ({cat.count})
            </a>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-muted-foreground">아직 글이 없습니다.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/blog?page=${p}${params.category ? `&category=${params.category}` : ''}`}
              className={`px-3 py-1 rounded border text-sm ${p === meta.page ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
