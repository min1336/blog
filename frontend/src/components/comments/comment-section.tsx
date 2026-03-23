"use client"

import { useEffect, useState, useCallback } from "react"
import { Separator } from "@/components/ui/separator"
import { CommentForm } from "@/components/comments/comment-form"
import { CommentItem } from "@/components/comments/comment-item"
import { LoginButton } from "@/components/comments/login-button"
import { getComments, getCurrentUser } from "@/lib/api"
import type { AuthUser, CommentResponse } from "@/lib/api"

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(postSlug)
      setComments(data)
    } catch {
      setComments([])
    }
  }, [postSlug])

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      try {
        const [userData] = await Promise.allSettled([
          getCurrentUser(),
          fetchComments(),
        ])
        if (userData.status === "fulfilled") {
          setUser(userData.value)
        }
      } catch {
        // backend might not be running
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [fetchComments])

  function handleCommentSubmit() {
    fetchComments()
  }

  if (isLoading) {
    return (
      <section className="mt-12">
        <Separator className="mb-8" />
        <h2 className="text-xl font-bold mb-6">댓글</h2>
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </section>
    )
  }

  return (
    <section className="mt-12">
      <Separator className="mb-8" />
      <h2 className="text-xl font-bold mb-6">댓글 {comments.length > 0 && `(${comments.length})`}</h2>

      {user?.authenticated ? (
        <div className="mb-8">
          <CommentForm postSlug={postSlug} onSubmit={handleCommentSubmit} />
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">댓글을 작성하려면 로그인하세요.</p>
          <LoginButton />
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              onReplySubmit={handleCommentSubmit}
            />
          ))}
        </div>
      )}
    </section>
  )
}
