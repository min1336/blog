import { getAllProjects } from "@/lib/content"
import { ProjectCard } from "@/components/portfolio/project-card"

export const metadata = { title: "Portfolio", description: "프로젝트 포트폴리오" }

export default function PortfolioPage() {
  const projects = getAllProjects()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Portfolio</h1>
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
          <p className="text-muted-foreground col-span-2">아직 프로젝트가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
