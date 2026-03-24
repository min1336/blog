import Link from 'next/link';
import { getPosts, getProjects } from '@/lib/api';
import { PostCard } from '@/components/blog/post-card';
import { ProjectCard } from '@/components/portfolio/project-card';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const [postsRes, projectsRes] = await Promise.all([
    getPosts('limit=4'),
    getProjects(),
  ]);

  const posts = postsRes.data;
  const projects = projectsRes.data.slice(0, 3);

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Welcome</h1>
        <p className="text-muted-foreground">
          개발 학습 기록과 프로젝트를 공유하는 블로그입니다.
        </p>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">아직 글이 없습니다.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Link
              href="/portfolio"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              전체보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
