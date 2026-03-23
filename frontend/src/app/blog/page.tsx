import { getAllPosts } from "@/lib/content"
import { PostCard } from "@/components/blog/post-card"

export const metadata = { title: "Blog", description: "기술 블로그 포스트 목록" }

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
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
    </div>
  )
}
