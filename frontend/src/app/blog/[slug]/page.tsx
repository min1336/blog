import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts } from "@/lib/content"
import { MDXContent } from "@/components/mdx/mdx-content"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { TagBadge } from "@/components/blog/tag-badge"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="max-w-6xl mx-auto flex gap-10">
      <div className="max-w-3xl flex-1 min-w-0">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{post.frontmatter.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <time dateTime={post.frontmatter.date}>{post.frontmatter.date}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>{post.frontmatter.category}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.frontmatter.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </header>
        <MDXContent source={post.content} />
      </div>
      <aside className="w-56 shrink-0 hidden xl:block">
        <TableOfContents content={post.content} />
      </aside>
    </div>
  )
}
