import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagBadge } from "./tag-badge"
import { PostFrontmatter } from "@/lib/types"

interface PostCardProps {
  slug: string
  frontmatter: PostFrontmatter
  readingTime: string
}

export function PostCard({ slug, frontmatter, readingTime }: PostCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            <span>·</span>
            <span>{readingTime}</span>
          </div>
          <CardTitle className="text-xl">{frontmatter.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">{frontmatter.summary}</p>
          <div className="flex flex-wrap gap-2">
            {frontmatter.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
