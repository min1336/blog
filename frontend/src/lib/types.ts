export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  thumbnail: string;
  view_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  prevPost?: { slug: string; title: string } | null;
  nextPost?: { slug: string; title: string } | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  summary: string;
  tech_stack: string[];
  github_url: string;
  demo_url: string;
  thumbnail: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  nickname: string;
  content: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  category: string;
  count: number;
}

export interface Tag {
  name: string;
  count: number;
}
