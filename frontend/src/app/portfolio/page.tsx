import { getProjects } from '@/lib/api';
import { ProjectCard } from '@/components/portfolio/project-card';

export default async function PortfolioPage() {
  const res = await getProjects();
  const projects = res.data;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">아직 프로젝트가 없습니다.</p>
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
