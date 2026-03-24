'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommentForm } from './comment-form';
import type { Comment } from '@/lib/types';

interface CommentItemProps {
  comment: Comment;
  slug: string;
  onRefresh: () => void;
  isReply?: boolean;
}

export function CommentItem({ comment, slug, onRefresh, isReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const isDeleted = !!comment.deleted_at;

  const date = new Date(comment.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={isReply ? 'ml-8 border-l-2 pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {isDeleted ? '' : comment.nickname}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <p className={`text-sm ${isDeleted ? 'text-muted-foreground italic' : ''}`}>
          {comment.content}
        </p>
        {!isDeleted && !isReply && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            답글
          </Button>
        )}
        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              onSuccess={() => {
                setShowReplyForm(false);
                onRefresh();
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              slug={slug}
              onRefresh={onRefresh}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
