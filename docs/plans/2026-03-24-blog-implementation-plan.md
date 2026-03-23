# Blog Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 개인 기술 블로그 + 포트폴리오 웹사이트를 Next.js 16 프론트엔드와 Spring Boot 백엔드로 구현한다.

**Architecture:** 모노레포 구조(`frontend/` + `backend/`)로, MDX 기반 정적 콘텐츠는 Next.js가 담당하고, 댓글/인증 등 동적 기능은 Spring Boot REST API가 처리한다. Supabase PostgreSQL을 데이터베이스로 사용하며, Vercel + Railway + Supabase 무료 티어로 배포한다.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, next-themes, MDX (next-mdx-remote + rehype-pretty-code + shiki), Spring Boot 3, Java 21, Gradle Kotlin DSL, Spring Security OAuth2, Spring Data JPA, Supabase PostgreSQL

**Reference Docs:**
- Original spec: `docs/specs/2026-03-23-blog-design.md`
- Design decisions: `docs/plans/2026-03-24-blog-implementation-design.md`

---

## Phase 1: Project Setup

### Task 1.1: Frontend — Next.js 16 프로젝트 생성

**Files:**
- Create: `frontend/` (entire Next.js project)

**Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/kimminhyeok/Downloads/blog
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

선택 옵션:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Turbopack: Yes (Next.js 16 기본)

**Step 2: 동작 확인**

```bash
cd frontend && pnpm dev
```

Expected: `http://localhost:3000`에서 Next.js 기본 페이지 표시

**Step 3: 불필요한 기본 코드 정리**

- `src/app/page.tsx` — 기본 템플릿 내용 제거, 빈 홈페이지로 교체
- `src/app/globals.css` — Tailwind 디렉티브만 남기고 기본 스타일 제거

**Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js 16 frontend project"
```

---

### Task 1.2: Frontend — shadcn/ui 초기화

**Files:**
- Modify: `frontend/components.json` (생성됨)
- Modify: `frontend/src/lib/utils.ts` (생성됨)
- Modify: `frontend/tailwind.config.ts`

**Step 1: shadcn/ui 초기화**

```bash
cd frontend
pnpm dlx shadcn@latest init
```

선택 옵션:
- Style: Default
- Base color: Zinc (다크 기조에 적합)
- CSS variables: Yes

**Step 2: 기본 컴포넌트 설치**

```bash
pnpm dlx shadcn@latest add button card badge separator scroll-area sheet avatar
```

**Step 3: 동작 확인**

`src/app/page.tsx`에서 Button 임포트하여 렌더링 확인:

```tsx
import { Button } from "@/components/ui/button"

export default function Home() {
  return <Button>테스트</Button>
}
```

`pnpm dev`로 버튼이 렌더링되는지 확인

**Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize shadcn/ui with base components"
```

---

### Task 1.3: Frontend — 테마 설정 (다크모드 + 커스텀 색상)

**Files:**
- Create: `frontend/src/components/providers/theme-provider.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/globals.css`

**Step 1: next-themes 설치**

```bash
cd frontend
pnpm add next-themes
```

**Step 2: ThemeProvider 컴포넌트 생성**

```tsx
// frontend/src/components/providers/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 3: layout.tsx에 ThemeProvider 적용**

```tsx
// frontend/src/app/layout.tsx
import { ThemeProvider } from "@/components/providers/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 4: globals.css에 블루/퍼플 액센트 테마 변수 추가**

기존 shadcn/ui CSS 변수에서 `--primary` 값을 블루/퍼플 계열로 수정:

```css
/* :root (라이트 모드) */
--primary: 245 82% 55%;        /* 퍼플-블루 */
--primary-foreground: 0 0% 100%;

/* .dark */
--primary: 245 82% 65%;        /* 다크모드용 밝은 퍼플-블루 */
--primary-foreground: 0 0% 100%;
```

**Step 5: 동작 확인**

`pnpm dev`로 다크모드가 기본 적용되는지 확인

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add dark mode with blue/purple accent theme"
```

---

### Task 1.4: Backend — Spring Boot 프로젝트 생성

**Files:**
- Create: `backend/` (entire Spring Boot project)

**Step 1: Spring Initializr로 프로젝트 생성**

https://start.spring.io 에서 다운로드 또는 curl 사용:

```bash
curl https://start.spring.io/starter.zip \
  -d type=gradle-project-kotlin \
  -d language=java \
  -d javaVersion=21 \
  -d bootVersion=3.4.4 \
  -d groupId=com.blog \
  -d artifactId=backend \
  -d name=blog-backend \
  -d dependencies=web,data-jpa,postgresql,security,oauth2-client,validation \
  -o backend.zip

unzip backend.zip -d backend
rm backend.zip
```

**Step 2: application.yml 기본 설정**

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/blog}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    open-in-view: false

server:
  port: 8080
```

**Step 3: 빌드 확인**

```bash
cd backend
./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Spring Boot 3 backend project"
```

---

### Task 1.5: Backend — CORS 및 기본 설정

**Files:**
- Create: `backend/src/main/java/com/blog/config/WebConfig.java`
- Create: `backend/src/main/java/com/blog/config/SecurityConfig.java`

**Step 1: WebConfig — CORS 설정**

```java
// backend/src/main/java/com/blog/config/WebConfig.java
package com.blog.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

**Step 2: SecurityConfig — 임시 보안 설정 (개발용)**

```java
// backend/src/main/java/com/blog/config/SecurityConfig.java
package com.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/comments/*/write", "/api/comments/*/edit", "/api/comments/*/delete").authenticated()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
```

**Step 3: 서버 기동 확인**

```bash
cd backend
./gradlew bootRun
```

Expected: `Started BlogBackendApplication` 로그 출력 (DB 연결 없이는 실패할 수 있음 — 정상)

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add CORS and basic security configuration"
```

---

## Phase 2: Layout & Navigation

### Task 2.1: Sidebar 컴포넌트

**Files:**
- Create: `frontend/src/components/layout/sidebar.tsx`
- Create: `frontend/src/components/layout/mobile-header.tsx`
- Create: `frontend/src/components/common/theme-toggle.tsx`
- Modify: `frontend/src/app/layout.tsx`

**Step 1: ThemeToggle 컴포넌트 생성**

```tsx
// frontend/src/components/common/theme-toggle.tsx
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 변경</span>
    </Button>
  )
}
```

**Step 2: lucide-react 설치**

```bash
cd frontend
pnpm add lucide-react
```

**Step 3: Sidebar 컴포넌트 생성**

프로필(아바타 + 이름 + 한 줄 소개), 네비게이션 메뉴(Blog, Portfolio, About), 카테고리 목록, 테마 토글을 포함하는 좌측 사이드바. 데스크탑에서는 고정, 모바일에서는 숨김.

```tsx
// frontend/src/components/layout/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, FolderOpen, User } from "lucide-react"

const navigation = [
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { name: "About", href: "/about", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Profile */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatar.png" alt="프로필" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="font-semibold text-lg">김민혁</h2>
            <p className="text-sm text-muted-foreground">주니어 개발자</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
```

**Step 4: MobileHeader 컴포넌트 생성**

```tsx
// frontend/src/components/layout/mobile-header.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { cn } from "@/lib/utils"
import { Menu, BookOpen, FolderOpen, User } from "lucide-react"

const navigation = [
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { name: "About", href: "/about", icon: User },
]

export function MobileHeader() {
  const pathname = usePathname()

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
      <Link href="/" className="font-bold text-lg">Blog</Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-1 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
```

**Step 5: Root layout에 Sidebar 적용**

```tsx
// frontend/src/app/layout.tsx
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { ThemeProvider } from "@/components/providers/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen">
            <Sidebar />
            <MobileHeader />
            <main className="md:ml-64 p-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 6: 동작 확인**

`pnpm dev` — 좌측 사이드바 표시, 모바일(< 768px)에서 햄버거 메뉴, 다크/라이트 전환

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add sidebar layout with navigation and dark mode toggle"
```

---

## Phase 3: MDX Blog System

### Task 3.1: MDX 파이프라인 설정

**Files:**
- Modify: `frontend/package.json` (dependencies 추가)
- Create: `frontend/src/lib/content.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/content/blog/hello-world.mdx` (테스트 포스트)

**Step 1: MDX 관련 패키지 설치**

```bash
cd frontend
pnpm add next-mdx-remote gray-matter rehype-pretty-code shiki reading-time rehype-slug rehype-autolink-headings
```

**Step 2: 타입 정의**

```typescript
// frontend/src/lib/types.ts
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
```

**Step 3: 콘텐츠 로딩 유틸리티**

```typescript
// frontend/src/lib/content.ts
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
```

**Step 4: 테스트 MDX 포스트 작성**

```mdx
---
title: "첫 번째 포스트"
date: "2026-03-24"
summary: "블로그를 시작합니다."
tags: ["blog", "intro"]
category: "일반"
published: true
---

# 안녕하세요!

첫 번째 블로그 포스트입니다.

## 코드 예시

```typescript
const greeting = "Hello, World!"
console.log(greeting)
```

이렇게 코드 하이라이팅이 됩니다.
```

**Step 5: 동작 확인**

Node REPL 또는 간단한 테스트로 `getAllPosts()`가 포스트를 반환하는지 확인

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add MDX content pipeline with gray-matter and reading-time"
```

---

### Task 3.2: Blog 목록 페이지

**Files:**
- Create: `frontend/src/app/blog/page.tsx`
- Create: `frontend/src/components/blog/post-card.tsx`
- Create: `frontend/src/components/blog/tag-badge.tsx`

**Step 1: TagBadge 컴포넌트**

```tsx
// frontend/src/components/blog/tag-badge.tsx
import { Badge } from "@/components/ui/badge"

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {tag}
    </Badge>
  )
}
```

**Step 2: PostCard 컴포넌트**

```tsx
// frontend/src/components/blog/post-card.tsx
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
            <time>{frontmatter.date}</time>
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
```

**Step 3: Blog 목록 페이지**

```tsx
// frontend/src/app/blog/page.tsx
import { getAllPosts } from "@/lib/content"
import { PostCard } from "@/components/blog/post-card"

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
```

**Step 4: 동작 확인**

`pnpm dev` → `http://localhost:3000/blog` → 테스트 포스트 카드 표시

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add blog list page with post cards"
```

---

### Task 3.3: Blog 상세 페이지 (MDX 렌더링 + 코드 하이라이팅)

**Files:**
- Create: `frontend/src/app/blog/[slug]/page.tsx`
- Create: `frontend/src/components/mdx/mdx-content.tsx`
- Create: `frontend/src/components/blog/table-of-contents.tsx`

**Step 1: MDX 렌더링 컴포넌트**

```tsx
// frontend/src/components/mdx/mdx-content.tsx
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const options = {
  mdxOptions: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "one-dark-pro", keepBackground: true }],
    ],
  },
}

export function MDXContent({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-code:before:hidden prose-code:after:hidden">
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={source} options={options} />
    </article>
  )
}
```

**Step 2: Table of Contents 컴포넌트**

```tsx
// frontend/src/components/blog/table-of-contents.tsx
interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const headings = content
    .split("\n")
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.match(/^#+/)![0].length
      const text = line.replace(/^#+\s/, "")
      const id = text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/(^-|-$)/g, "")
      return { id, text, level }
    })

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block sticky top-6">
      <h3 className="text-sm font-semibold mb-3">목차</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

**Step 3: Blog 상세 페이지**

```tsx
// frontend/src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts } from "@/lib/content"
import { MDXContent } from "@/components/mdx/mdx-content"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { TagBadge } from "@/components/blog/tag-badge"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="max-w-6xl mx-auto flex gap-10">
      <div className="max-w-3xl flex-1">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{post.frontmatter.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <time>{post.frontmatter.date}</time>
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
        {/* Phase 5에서 댓글 섹션 추가 */}
      </div>
      <aside className="w-56 shrink-0">
        <TableOfContents content={post.content} />
      </aside>
    </div>
  )
}
```

**Step 4: 동작 확인**

`pnpm dev` → `http://localhost:3000/blog/hello-world`
- MDX 렌더링 확인
- 코드 하이라이팅 확인
- 목차 표시 확인

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add blog detail page with MDX rendering and table of contents"
```

---

## Phase 4: Backend — DB & Entity 설정

### Task 4.1: Supabase 연결 + Entity 정의

**Files:**
- Create: `backend/src/main/java/com/blog/entity/User.java`
- Create: `backend/src/main/java/com/blog/entity/Comment.java`
- Modify: `backend/src/main/resources/application.yml`

**Step 1: Supabase 프로젝트 생성**

1. https://supabase.com 에서 새 프로젝트 생성
2. Settings → Database → Connection string (JDBC) 복사
3. `backend/src/main/resources/application-local.yml` 작성:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.xxx.supabase.co:5432/postgres
    username: postgres
    password: [supabase-password]
  jpa:
    hibernate:
      ddl-auto: update
```

**Step 2: User Entity**

```java
// backend/src/main/java/com/blog/entity/User.java
package com.blog.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String oauthId;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String name;

    private String avatarUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters, setters, constructors
    protected User() {}

    public User(String oauthId, String provider, String name, String avatarUrl) {
        this.oauthId = oauthId;
        this.provider = provider;
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    // ... getters and setters
}
```

**Step 3: Comment Entity**

```java
// backend/src/main/java/com/blog/entity/Comment.java
package com.blog.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String postSlug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    private Instant deletedAt;

    protected Comment() {}

    public Comment(String postSlug, User author, String content, Comment parent) {
        this.postSlug = postSlug;
        this.author = author;
        this.content = content;
        this.parent = parent;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    // ... getters and setters
}
```

**Step 4: application.yml에 프로필 추가**

```yaml
# application.yml 수정
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
```

**Step 5: 빌드 확인**

```bash
cd backend
./gradlew build -x test
```

Expected: BUILD SUCCESSFUL

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add User and Comment JPA entities with Supabase config"
```

---

### Task 4.2: Repository + Service + Controller (댓글 API)

**Files:**
- Create: `backend/src/main/java/com/blog/repository/CommentRepository.java`
- Create: `backend/src/main/java/com/blog/repository/UserRepository.java`
- Create: `backend/src/main/java/com/blog/dto/CommentRequest.java`
- Create: `backend/src/main/java/com/blog/dto/CommentResponse.java`
- Create: `backend/src/main/java/com/blog/service/CommentService.java`
- Create: `backend/src/main/java/com/blog/controller/CommentController.java`

**Step 1: Repository 인터페이스**

```java
// CommentRepository.java
package com.blog.repository;

import com.blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostSlugAndParentIsNullOrderByCreatedAtDesc(String postSlug);
    List<Comment> findByParentIdOrderByCreatedAtAsc(UUID parentId);
}
```

```java
// UserRepository.java
package com.blog.repository;

import com.blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByOauthIdAndProvider(String oauthId, String provider);
}
```

**Step 2: DTO 정의**

```java
// CommentRequest.java
package com.blog.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CommentRequest(
    @NotBlank String content,
    UUID parentId
) {}
```

```java
// CommentResponse.java
package com.blog.dto;

import com.blog.entity.Comment;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    String content,
    String authorName,
    String authorAvatar,
    UUID authorId,
    Instant createdAt,
    boolean deleted,
    List<CommentResponse> replies
) {
    public static CommentResponse from(Comment comment, List<CommentResponse> replies) {
        return new CommentResponse(
            comment.getId(),
            comment.isDeleted() ? "삭제된 댓글입니다." : comment.getContent(),
            comment.getAuthor().getName(),
            comment.getAuthor().getAvatarUrl(),
            comment.getAuthor().getId(),
            comment.getCreatedAt(),
            comment.isDeleted(),
            replies
        );
    }
}
```

**Step 3: CommentService**

```java
// CommentService.java
package com.blog.service;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<CommentResponse> getComments(String postSlug) {
        List<Comment> topLevel = commentRepository.findByPostSlugAndParentIsNullOrderByCreatedAtDesc(postSlug);
        return topLevel.stream()
            .map(comment -> {
                List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
                List<CommentResponse> replyDtos = replies.stream()
                    .map(r -> CommentResponse.from(r, List.of()))
                    .toList();
                return CommentResponse.from(comment, replyDtos);
            })
            .toList();
    }

    @Transactional
    public CommentResponse createComment(String postSlug, CommentRequest request, User author) {
        Comment parent = null;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
        }
        Comment comment = new Comment(postSlug, author, request.content(), parent);
        commentRepository.save(comment);
        return CommentResponse.from(comment, List.of());
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new SecurityException("Not authorized to delete this comment");
        }
        comment.softDelete();
    }
}
```

**Step 4: CommentController**

```java
// CommentController.java
package com.blog.controller;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{postSlug}")
    public List<CommentResponse> getComments(@PathVariable String postSlug) {
        return commentService.getComments(postSlug);
    }

    // POST, DELETE 엔드포인트는 Phase 5 (Auth) 이후 완성
}
```

**Step 5: 빌드 확인**

```bash
cd backend
./gradlew build -x test
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add comment CRUD API (repository, service, controller)"
```

---

## Phase 5: Authentication (OAuth2)

### Task 5.1: Backend — OAuth2 설정 (GitHub + Google)

**Files:**
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/java/com/blog/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/blog/service/CustomOAuth2UserService.java`
- Create: `backend/src/main/java/com/blog/controller/AuthController.java`

**Step 1: OAuth2 application.yml 설정**

```yaml
# application.yml에 추가
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${OAUTH_GITHUB_CLIENT_ID}
            client-secret: ${OAUTH_GITHUB_CLIENT_SECRET}
            scope: read:user,user:email
          google:
            client-id: ${OAUTH_GOOGLE_CLIENT_ID}
            client-secret: ${OAUTH_GOOGLE_CLIENT_SECRET}
            scope: openid,profile,email
```

**Step 2: CustomOAuth2UserService — 로그인 시 User 자동 생성/갱신**

```java
// CustomOAuth2UserService.java
package com.blog.service;

import com.blog.entity.User;
import com.blog.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User oAuth2User = super.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();
        String oauthId = oAuth2User.getName();
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("avatar_url");

        if (avatar == null) {
            avatar = oAuth2User.getAttribute("picture");
        }

        String finalName = name != null ? name : "User";
        String finalAvatar = avatar;

        userRepository.findByOauthIdAndProvider(oauthId, provider)
            .orElseGet(() -> userRepository.save(new User(oauthId, provider, finalName, finalAvatar)));

        return oAuth2User;
    }
}
```

**Step 3: SecurityConfig 업데이트 (OAuth2 + 세션 기반)**

```java
// SecurityConfig.java 수정
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated()
            .anyRequest().permitAll()
        )
        .oauth2Login(oauth2 -> oauth2
            .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
            .defaultSuccessUrl("http://localhost:3000", true)
        )
        .logout(logout -> logout
            .logoutSuccessUrl("http://localhost:3000")
        );
    return http.build();
}
```

**Step 4: AuthController — 현재 사용자 정보 API**

```java
// AuthController.java
package com.blog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "name", principal.getAttribute("name"),
            "avatar", principal.getAttribute("avatar_url")
        ));
    }
}
```

**Step 5: 빌드 확인**

```bash
./gradlew build -x test
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add OAuth2 authentication with GitHub and Google"
```

---

### Task 5.2: Frontend — 로그인 UI + API 연동

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/components/comments/login-button.tsx`

**Step 1: API 클라이언트**

```typescript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function getCurrentUser() {
  return fetchAPI<{ authenticated: boolean; name?: string; avatar?: string }>("/api/auth/me")
}

export async function getComments(postSlug: string) {
  return fetchAPI<CommentResponse[]>(`/api/comments/${postSlug}`)
}

export async function createComment(postSlug: string, content: string, parentId?: string) {
  return fetchAPI(`/api/comments/${postSlug}`, {
    method: "POST",
    body: JSON.stringify({ content, parentId }),
  })
}

interface CommentResponse {
  id: string
  content: string
  authorName: string
  authorAvatar: string
  authorId: string
  createdAt: string
  deleted: boolean
  replies: CommentResponse[]
}
```

**Step 2: LoginButton 컴포넌트**

```tsx
// frontend/src/components/comments/login-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function LoginButton() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <a href={`${API_URL}/oauth2/authorization/github`}>
          <Github className="h-4 w-4 mr-2" />
          GitHub로 로그인
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href={`${API_URL}/oauth2/authorization/google`}>
          Google로 로그인
        </a>
      </Button>
    </div>
  )
}
```

**Step 3: .env.local 생성**

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Step 4: .gitignore에 .env.local 확인**

`.env*.local`이 `.gitignore`에 있는지 확인

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add API client and login button components"
```

---

## Phase 6: Comment System (Frontend)

### Task 6.1: 댓글 UI 컴포넌트

**Files:**
- Create: `frontend/src/components/comments/comment-list.tsx`
- Create: `frontend/src/components/comments/comment-item.tsx`
- Create: `frontend/src/components/comments/comment-form.tsx`
- Create: `frontend/src/components/comments/comment-section.tsx`
- Modify: `frontend/src/app/blog/[slug]/page.tsx` (댓글 섹션 추가)

**Step 1: CommentForm 컴포넌트**

```tsx
// frontend/src/components/comments/comment-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createComment } from "@/lib/api"

interface CommentFormProps {
  postSlug: string
  parentId?: string
  onSubmit?: () => void
  onCancel?: () => void
}

export function CommentForm({ postSlug, parentId, onSubmit, onCancel }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await createComment(postSlug, content, parentId)
      setContent("")
      onSubmit?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 작성하세요..."
        className="min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: CommentItem 컴포넌트**

```tsx
// frontend/src/components/comments/comment-item.tsx
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommentForm } from "./comment-form"

interface Comment {
  id: string
  content: string
  authorName: string
  authorAvatar: string
  createdAt: string
  deleted: boolean
  replies: Comment[]
}

interface CommentItemProps {
  comment: Comment
  postSlug: string
  isReply?: boolean
  onRefresh: () => void
}

export function CommentItem({ comment, postSlug, isReply, onRefresh }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className={isReply ? "ml-8 border-l-2 border-border pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.authorName}</span>
            <span className="text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <p className={`mt-1 text-sm ${comment.deleted ? "text-muted-foreground italic" : ""}`}>
            {comment.content}
          </p>
          {!isReply && !comment.deleted && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs mt-1 h-6 px-2"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              답글
            </Button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-11 mt-2">
          <CommentForm
            postSlug={postSlug}
            parentId={comment.id}
            onSubmit={() => { setShowReplyForm(false); onRefresh() }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postSlug={postSlug}
          isReply
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
```

**Step 3: CommentSection (통합 컴포넌트)**

```tsx
// frontend/src/components/comments/comment-section.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { getComments, getCurrentUser } from "@/lib/api"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import { LoginButton } from "./login-button"
import { Separator } from "@/components/ui/separator"

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [user, setUser] = useState<{ authenticated: boolean; name?: string } | null>(null)

  const loadComments = useCallback(async () => {
    try {
      const data = await getComments(postSlug)
      setComments(data)
    } catch {
      // API 미연결 시 빈 배열
    }
  }, [postSlug])

  useEffect(() => {
    loadComments()
    getCurrentUser().then(setUser).catch(() => setUser({ authenticated: false }))
  }, [loadComments])

  return (
    <section className="mt-12">
      <Separator className="mb-8" />
      <h2 className="text-xl font-bold mb-6">댓글 {comments.length > 0 && `(${comments.length})`}</h2>

      {user?.authenticated ? (
        <CommentForm postSlug={postSlug} onSubmit={loadComments} />
      ) : (
        <div className="rounded-md border p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
          <LoginButton />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postSlug={postSlug}
            onRefresh={loadComments}
          />
        ))}
      </div>
    </section>
  )
}
```

**Step 4: Blog 상세 페이지에 CommentSection 추가**

`frontend/src/app/blog/[slug]/page.tsx`의 MDXContent 아래에:

```tsx
<CommentSection postSlug={slug} />
```

**Step 5: 동작 확인**

`pnpm dev` → 블로그 글 하단에 댓글 섹션 표시 (API 미연결이면 빈 목록)

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add comment section with reply support"
```

---

## Phase 7: Portfolio & Static Pages

### Task 7.1: Portfolio 시스템

**Files:**
- Create: `frontend/content/projects/` (디렉토리)
- Create: `frontend/content/projects/sample-project.mdx`
- Modify: `frontend/src/lib/content.ts` (프로젝트 로딩 함수 추가)
- Create: `frontend/src/app/portfolio/page.tsx`
- Create: `frontend/src/app/portfolio/[slug]/page.tsx`
- Create: `frontend/src/components/portfolio/project-card.tsx`

**Step 1: content.ts에 프로젝트 로딩 추가**

`getAllPosts()`와 유사한 패턴으로 `getAllProjects()`, `getProjectBySlug()` 함수 추가.
`content/projects/` 디렉토리에서 MDX 파일을 읽어 Project 타입으로 반환.

**Step 2: ProjectCard 컴포넌트**

기술 스택 태그, GitHub/데모 링크 버튼, 프로젝트 이미지를 포함하는 카드.

**Step 3: Portfolio 목록 페이지**

프로젝트 카드를 그리드(2열)로 표시.

**Step 4: Portfolio 상세 페이지**

MDX 렌더링 + 프로젝트 메타 정보 (기술 스택, 역할, 기간, 링크).

**Step 5: 테스트 프로젝트 MDX 작성**

```mdx
---
title: "Sample Project"
summary: "프로젝트 설명입니다."
tags: ["React", "TypeScript"]
github: "https://github.com/user/repo"
demo: "https://demo.vercel.app"
image: "/projects/sample.png"
---

# Sample Project

프로젝트에 대한 상세 설명...
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add portfolio list and detail pages"
```

---

### Task 7.2: Homepage + About 페이지

**Files:**
- Modify: `frontend/src/app/page.tsx` (Homepage)
- Create: `frontend/src/app/about/page.tsx`

**Step 1: Homepage**

- 한 줄 자기소개
- 최신 블로그 포스트 3개 (PostCard 재사용)
- Featured 프로젝트 2-3개 (ProjectCard 재사용)
- "더 보기" 링크

**Step 2: About 페이지**

- 자기소개
- 기술 스택 목록 (배지 형태)
- 연락처/소셜 링크 (GitHub, Email 등)

**Step 3: 동작 확인**

모든 페이지 네비게이션 동작 확인

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add homepage and about page"
```

---

## Phase 8: Deployment

### Task 8.1: Frontend — Vercel 배포

**Files:**
- Modify: `frontend/next.config.ts` (필요시)

**Step 1: Vercel에 프로젝트 연결**

1. GitHub에 리포지토리 push
2. Vercel Dashboard → New Project → GitHub 연결
3. Root Directory: `frontend`
4. Framework Preset: Next.js (자동 감지)

**Step 2: 환경 변수 설정**

Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL` = Railway 배포 URL

**Step 3: 배포 확인**

Vercel에서 빌드 성공, 프리뷰 URL로 사이트 접근 확인

**Step 4: Commit**

```bash
git commit -m "chore: configure Vercel deployment settings"
```

---

### Task 8.2: Backend — Railway 배포

**Step 1: Railway 프로젝트 생성**

1. Railway Dashboard → New Project → GitHub 연결
2. Root Directory: `backend`
3. Builder: Nixpacks (자동 감지)

**Step 2: 환경 변수 설정**

Railway Dashboard → Variables:
- `DATABASE_URL` = Supabase JDBC URL
- `DATABASE_USERNAME` = postgres
- `DATABASE_PASSWORD` = Supabase 비밀번호
- `OAUTH_GITHUB_CLIENT_ID` / `SECRET`
- `OAUTH_GOOGLE_CLIENT_ID` / `SECRET`
- `CORS_ALLOWED_ORIGINS` = Vercel 배포 URL

**Step 3: 배포 확인**

Railway 빌드 로그 확인, `/api/auth/me` 엔드포인트 응답 확인

---

### Task 8.3: Supabase DB 스키마 설정

**Step 1: Supabase SQL Editor에서 테이블 생성**

스펙 문서의 SQL 스키마 실행:
- `users` 테이블
- `comments` 테이블 + 인덱스

또는 Spring Boot의 `ddl-auto: update`로 첫 기동 시 자동 생성 후, 이후 `ddl-auto: validate`로 전환

**Step 2: 연동 확인**

Spring Boot에서 Supabase 연결 확인 → 댓글 생성/조회 테스트

---

## Phase Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1.1 ~ 1.5 | 프로젝트 셋업 (FE + BE) |
| 2 | 2.1 | 레이아웃 (사이드바 + 모바일 헤더) |
| 3 | 3.1 ~ 3.3 | MDX 블로그 시스템 |
| 4 | 4.1 ~ 4.2 | Backend DB + 댓글 API |
| 5 | 5.1 ~ 5.2 | OAuth2 인증 |
| 6 | 6.1 | 댓글 UI 컴포넌트 |
| 7 | 7.1 ~ 7.2 | 포트폴리오 + 정적 페이지 |
| 8 | 8.1 ~ 8.3 | 배포 (Vercel + Railway + Supabase) |

**총 예상 Task 수**: 16개
**총 예상 Commit 수**: 16+개
