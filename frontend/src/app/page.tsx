import Link from "next/link"
import { getAllPosts } from "@/lib/content"
import { getAllProjects } from "@/lib/content"
import { PostCard } from "@/components/blog/post-card"
import { ProjectCard } from "@/components/portfolio/project-card"

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3)
  const projects = getAllProjects().slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <section>
        <h1 className="text-4xl font-bold mb-2">안녕하세요!</h1>
        <p className="text-lg text-muted-foreground">
          개발을 배우며 성장하는 주니어 개발자입니다.
          이 블로그에서 학습한 내용과 프로젝트를 기록합니다.
        </p>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">최신 포스트</h2>
          <Link href="/blog" className="text-sm text-primary hover:underline">
            더 보기 →
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              frontmatter={post.frontmatter}
              readingTime={post.readingTime}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground">아직 포스트가 없습니다.</p>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">프로젝트</h2>
          <Link href="/portfolio" className="text-sm text-primary hover:underline">
            더 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              title={project.title}
              summary={project.summary}
              tags={project.tags}
              github={project.github}
              demo={project.demo}
            />
          ))}
          {projects.length === 0 && (
            <p className="text-muted-foreground">아직 프로젝트가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}
