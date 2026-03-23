"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createComment } from "@/lib/api"

interface CommentFormProps {
  postSlug: string
  parentId?: string
  onSubmit?: () => void
  onCancel?: () => void
}

export function CommentForm({ postSlug, parentId, onSubmit, onCancel }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await createComment(postSlug, trimmed, parentId)
      setContent("")
      onSubmit?.()
    } catch {
      // silently fail if backend is not running
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 작성하세요..."
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  )
}
