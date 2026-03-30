import type { MetadataRoute } from 'next';

const SITE_URL = 'https://blog-ebon-eta-50.vercel.app';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 블로그 글 동적 페이지
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/posts?limit=100`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) {
      postPages = json.data.map((post: { slug: string; updated_at: string }) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // API 실패 시 정적 페이지만 반환
  }

  // 프로젝트 동적 페이지
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) {
      projectPages = json.data.map((project: { slug: string; updated_at: string }) => ({
        url: `${SITE_URL}/portfolio/${project.slug}`,
        lastModified: new Date(project.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // API 실패 시 정적 페이지만 반환
  }

  return [...staticPages, ...postPages, ...projectPages];
}
