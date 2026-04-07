export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category_id: number | null;
  categoryEntity?: { id: number; name: string; slug: string } | null;
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

// 계층형 카테고리
export interface CategoryChild {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  post_count: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  post_count: number;
  children: CategoryChild[];
}

export interface Tag {
  name: string;
  count: number;
}
