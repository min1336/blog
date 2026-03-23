export interface PostFrontmatter {
  title: string
  date: string
  summary: string
  tags: string[]
  category: string
  published: boolean
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
  readingTime: string
}

export interface Project {
  slug: string
  title: string
  summary: string
  tags: string[]
  github?: string
  demo?: string
  image?: string
  content: string
}
