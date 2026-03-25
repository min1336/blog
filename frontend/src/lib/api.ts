import type { ApiResponse, Post, Project, Comment, Category, Tag } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const isServer = typeof window === 'undefined';

function getBaseUrl(path: string) {
  if (isServer) return `${BACKEND_URL}/api${path}`;
  return `/api/proxy${path}`;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(getBaseUrl(path), {
      cache: 'no-store',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'API Error');
    }
    return json;
  } catch {
    return { success: false, data: [] as unknown as T, message: 'API unavailable' };
  }
}

// Posts
export const getPosts = (params?: string) =>
  fetchApi<Post[]>(`/posts${params ? `?${params}` : ''}`);

export const getPost = (slug: string) =>
  fetchApi<Post>(`/posts/${slug}`);

// Projects
export const getProjects = (params?: string) =>
  fetchApi<Project[]>(`/projects${params ? `?${params}` : ''}`);

export const getProject = (slug: string) =>
  fetchApi<Project>(`/projects/${slug}`);

// Comments
export const getComments = (slug: string) =>
  fetchApi<Comment[]>(`/posts/${slug}/comments`);

export const createComment = (slug: string, body: {
  nickname: string; password: string; content: string; parent_id?: number;
}) => fetchApi<Comment>(`/posts/${slug}/comments`, {
  method: 'POST', body: JSON.stringify(body),
});

export const updateComment = (id: number, body: { password: string; content: string }) =>
  fetchApi<Comment>(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteComment = (id: number, password: string) =>
  fetchApi<{ message: string }>(`/comments/${id}`, {
    method: 'DELETE', body: JSON.stringify({ password }),
  });

// Auth
export const login = (body: { username: string; password: string }) =>
  fetchApi<{ username: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const logout = () =>
  fetchApi<{ message: string }>('/auth/logout', { method: 'POST' });

export const getMe = () =>
  fetchApi<{ id: number; username: string }>('/auth/me');

// Categories & Tags
export const getCategories = () =>
  fetchApi<Category[]>('/posts/meta/categories');

export const getTags = () =>
  fetchApi<Tag[]>('/posts/meta/tags');

// Admin CRUD
export const createPost = (body: Partial<Post>) =>
  fetchApi<Post>('/posts', { method: 'POST', body: JSON.stringify(body) });

export const updatePost = (slug: string, body: Partial<Post>) =>
  fetchApi<Post>(`/posts/${slug}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deletePost = (slug: string) =>
  fetchApi<{ message: string }>(`/posts/${slug}`, { method: 'DELETE' });

export const createProject = (body: Partial<Project>) =>
  fetchApi<Project>('/projects', { method: 'POST', body: JSON.stringify(body) });

export const updateProject = (slug: string, body: Partial<Project>) =>
  fetchApi<Project>(`/projects/${slug}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteProject = (slug: string) =>
  fetchApi<{ message: string }>(`/projects/${slug}`, { method: 'DELETE' });

// Upload
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const url = isServer ? `${BACKEND_URL}/api/upload` : '/api/proxy/upload';
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload failed');
  return json.data as { url: string };
};
