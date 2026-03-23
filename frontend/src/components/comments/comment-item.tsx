"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommentForm } from "@/components/comments/comment-form"
import type { CommentResponse } from "@/lib/api"

interface CommentItemProps {
  comment: CommentResponse
  postSlug: string
  isReply?: boolean
  onReplySubmit?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function CommentItem({ comment, postSlug, isReply = false, onReplySubmit }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  function handleReplySubmit() {
    setShowReplyForm(false)
    onReplySubmit?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar size="sm">
          {comment.authorAvatar && (
            <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
          )}
          <AvatarFallback>{comment.authorName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>
          {comment.deleted ? (
            <p className="text-sm italic text-muted-foreground">삭제된 댓글입니다.</p>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}
          {!isReply && !comment.deleted && (
            <Button
              variant="ghost"
              size="xs"
              className="mt-1 text-muted-foreground"
              onClick={() => setShowReplyForm((prev) => !prev)}
            >
              답글
            </Button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-9">
          <CommentForm
            postSlug={postSlug}
            parentId={comment.id}
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 border-l-2 border-border pl-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postSlug={postSlug}
              isReply
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
