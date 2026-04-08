import type { Metadata } from 'next';
import Link from 'next/link';
import { getPost } from '@/lib/api';
import { MarkdownRenderer } from '@/components/blog/markdown-renderer';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { TagBadge } from '@/components/blog/tag-badge';
import { CommentSection } from '@/components/comments/comment-section';
import { ArrowLeft, ArrowRight, Eye, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPost(slug);
  const post = res.data;
  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || post.title,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPost(slug);
  const post = res.data;

  if (!post || !post.content) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const readingTime = Math.ceil(post.content.length / 500);
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>{date}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {post.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {readingTime}분
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>

      <TableOfContents content={post.content} />

      <MarkdownRenderer content={post.content} />

      <Separator className="my-8" />

      <nav className="flex justify-between">
        {post.prevPost ? (
          <Link
            href={`/blog/${post.prevPost.slug}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {post.prevPost.title}
          </Link>
        ) : (
          <div />
        )}
        {post.nextPost ? (
          <Link
            href={`/blog/${post.nextPost.slug}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            {post.nextPost.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </nav>

      <CommentSection slug={slug} />
    </article>
  );
}
