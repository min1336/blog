import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ExternalLink } from 'lucide-react';
import type { Project } from '@/lib/types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      {project.thumbnail && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">
          <Link href={`/portfolio/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription>{project.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tech_stack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="h-4 w-4" /> GitHub
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Demo
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
