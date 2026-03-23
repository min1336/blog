export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: customHeaders, ...rest } = options ?? {}
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    },
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export interface AuthUser {
  authenticated: boolean
  id?: string
  name?: string
  avatar?: string
}

export interface CommentResponse {
  id: string
  content: string
  authorName: string
  authorAvatar: string
  authorId: string | null
  createdAt: string
  deleted: boolean
  replies: CommentResponse[]
}

export async function getCurrentUser(): Promise<AuthUser> {
  return fetchAPI<AuthUser>("/api/auth/me")
}

export async function getComments(postSlug: string): Promise<CommentResponse[]> {
  return fetchAPI<CommentResponse[]>(`/api/comments/${postSlug}`)
}

export async function createComment(postSlug: string, content: string, parentId?: string): Promise<CommentResponse> {
  return fetchAPI<CommentResponse>(`/api/comments/${postSlug}`, {
    method: "POST",
    body: JSON.stringify({ content, parentId: parentId || null }),
  })
}

export async function deleteComment(postSlug: string, commentId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/comments/${postSlug}/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}
