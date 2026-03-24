'use client';

import { useEffect, useState, useCallback } from 'react';
import { getComments } from '@/lib/api';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';
import type { Comment } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await getComments(slug);
      setComments(res.data);
    } catch {
      // ignore
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-4">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>
      <CommentForm slug={slug} onSuccess={fetchComments} />
      <Separator className="my-6" />
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              onRefresh={fetchComments}
            />
          ))
        )}
      </div>
    </section>
  );
}
