'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPosts, deletePost } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Post } from '@/lib/types';

export default function AdminPostsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const params = categorySlug ? `limit=100&category=${categorySlug}` : 'limit=100';
      const res = await getPosts(params);
      setPosts(res.data);
    } catch {}
  };

  useEffect(() => { fetchPosts(); }, [categorySlug]);

  const handleDelete = async (slug: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePost(slug);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Posts</h1>
          {categorySlug && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{categorySlug}</Badge>
              <Link href="/admin/posts" className="text-xs text-muted-foreground hover:text-foreground">
                전체보기
              </Link>
            </div>
          )}
        </div>
        <Link href="/admin/posts/new">
          <Button><Plus className="h-4 w-4 mr-1" /> New Post</Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-3 font-medium">{post.title}</td>
                <td className="p-3">{post.categoryEntity?.name || '-'}</td>
                <td className="p-3">
                  <Badge variant={post.published ? 'default' : 'secondary'}>
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/posts/${post.slug}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.slug)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">
                {categorySlug ? '이 카테고리에 글이 없습니다.' : 'No posts yet'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
