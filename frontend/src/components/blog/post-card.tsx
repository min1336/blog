import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TagBadge } from './tag-badge';
import type { Post } from '@/lib/types';

export function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        {post.thumbnail && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            {post.category && <span>{post.category}</span>}
            <span>{date}</span>
          </div>
          <CardTitle className="text-lg">{post.title}</CardTitle>
          <CardDescription>{post.summary}</CardDescription>
        </CardHeader>
        {post.tags && post.tags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
