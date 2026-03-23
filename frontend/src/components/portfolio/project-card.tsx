import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagBadge } from "@/components/blog/tag-badge"
import { ExternalLink, GitFork } from "lucide-react"

interface ProjectCardProps {
  slug: string
  title: string
  summary: string
  tags: string[]
  github?: string
  demo?: string
}

export function ProjectCard({ slug, title, summary, tags, github, demo }: ProjectCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <Link href={`/portfolio/${slug}`}>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">{summary}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </CardContent>
      </Link>
      <CardContent className="pt-0 flex gap-2">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <GitFork className="h-4 w-4" /> GitHub
          </a>
        )}
        {demo && (
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Demo
          </a>
        )}
      </CardContent>
    </Card>
  )
}
