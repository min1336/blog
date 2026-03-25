import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Post } from '@/lib/types';

export function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readingTime = Math.ceil(post.content.length / 500);

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group hover:shadow-lg hover:border-foreground/20 transition-all duration-200">
        {post.thumbnail && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {post.category && (
              <Badge variant="secondary" className="text-xs font-normal">
                {post.category}
              </Badge>
            )}
            <span>{date}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {readingTime}분
            </span>
          </div>
          <CardTitle className="text-lg group-hover:text-foreground/80 transition-colors">
            {post.title}
          </CardTitle>
          {post.summary && (
            <CardDescription className="line-clamp-2">{post.summary}</CardDescription>
          )}
        </CardHeader>
        {post.tags && post.tags.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
