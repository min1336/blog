const SITE_URL = 'https://blog-ebon-eta-50.vercel.app';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts: { slug: string; title: string; summary: string; created_at: string; categoryEntity?: { name: string } | null; tags: string[] }[] = [];

  try {
    const res = await fetch(`${BACKEND_URL}/api/posts?limit=50`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) posts = json.data;
  } catch {
    // API 실패 시 빈 피드
  }

  const items = posts.map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.summary || post.title)}</description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(post.categoryEntity?.name || '')}</category>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Min's Dev Blog</title>
    <link>${SITE_URL}</link>
    <description>웹 개발을 학습하며 배운 것들을 기록하고 공유하는 블로그</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
