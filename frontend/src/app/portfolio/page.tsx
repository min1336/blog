import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProjects } from '@/lib/api';
import { ProjectCard } from '@/components/portfolio/project-card';
import { SearchInput } from '@/components/blog/search-input';

export const metadata: Metadata = {
  title: '포트폴리오',
  description: '직접 만든 프로젝트들을 소개합니다.',
  openGraph: {
    title: '포트폴리오 | Min\'s Dev Blog',
    description: '직접 만든 프로젝트들을 소개합니다.',
  },
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);

  const res = await getProjects(query.toString());
  const projects = res.data;

  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          {params.search && (
            <p className="text-sm text-muted-foreground mt-1">
              &ldquo;{params.search}&rdquo; 검색 결과
            </p>
          )}
        </div>
        <div className="w-64">
          {/* 검색 입력창 로딩 중 skeleton fallback */}
          <Suspense fallback={<div className="h-10 w-full rounded-lg border bg-muted animate-pulse" />}>
            <SearchInput basePath="/portfolio" placeholder="프로젝트 검색..." />
          </Suspense>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          {/* 검색 중이면 검색 결과 없음, 아니면 프로젝트 없음 메시지 구분 */}
          {params.search ? (
            <>
              <p className="text-muted-foreground text-lg">
                &ldquo;{params.search}&rdquo; 검색 결과가 없습니다.
              </p>
              <p className="text-sm text-muted-foreground mt-1">다른 키워드로 검색해보세요.</p>
            </>
          ) : (
            <p className="text-muted-foreground">아직 프로젝트가 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
