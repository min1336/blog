'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStats, getProjects } from '@/lib/api';
import { FileText, Briefcase, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalPosts: number;
  draftPosts: number;
  totalViews: number;
  topPosts: { title: string; slug: string; views: number }[];
  categories: { name: string; count: number; views: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    getStats().then((res) => { if (res.data) setStats(res.data); }).catch(() => {});
    getProjects().then((res) => setProjectCount(res.data?.length || 0)).catch(() => {});
    fetch('/api/proxy/admin/comments', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => { if (json.success) setCommentCount(json.data.length); })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* 상단 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">게시글</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPosts ?? '-'}</div>
            {stats && stats.draftPosts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">임시저장 {stats.draftPosts}개</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 조회수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalViews?.toLocaleString() ?? '-'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">프로젝트</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">댓글</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{commentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 인기 글 Top 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">인기 글 Top 5</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.topPosts && stats.topPosts.length > 0 ? (
              <div className="space-y-3">
                {stats.topPosts.map((post, i) => (
                  <div key={post.slug} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm hover:underline truncate block"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 카테고리별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.categories && stats.categories.length > 0 ? (
              <div className="space-y-3">
                {stats.categories.map((cat) => {
                  const maxViews = Math.max(...stats.categories.map((c) => c.views), 1);
                  const width = Math.max((cat.views / maxViews) * 100, 4);
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">{cat.count}개 / {cat.views.toLocaleString()} 조회</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
