import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { Post, PostFrontmatter } from "./types"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))

  const posts = files
    .map((filename) => {
      const slug = filename.replace(".mdx", "")
      const filePath = path.join(BLOG_DIR, filename)
      const fileContent = fs.readFileSync(filePath, "utf-8")
      const { data, content } = matter(fileContent)
      const frontmatter = data as PostFrontmatter

      if (!frontmatter.published) return null

      return {
        slug,
        frontmatter,
        content,
        readingTime: readingTime(content).text,
      }
    })
    .filter(Boolean) as Post[]

  return posts.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  )
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
    readingTime: readingTime(content).text,
  }
}

export function getAllCategories(): { name: string; count: number }[] {
  const posts = getAllPosts()
  const categoryMap = new Map<string, number>()

  posts.forEach((post) => {
    const cat = post.frontmatter.category
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
