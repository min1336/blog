# Blog Website Design Spec

## Overview

개인 기술 블로그 + 포트폴리오 웹사이트. Next.js 프론트엔드와 Spring Boot 백엔드를 분리한 풀스택 구조.

## Requirements

### Purpose
- 개인 기술 블로그 (개발 학습 기록, 기술 포스팅)
- 포트폴리오 (프로젝트 소개)

### Target Audience
- 채용 담당자/기업
- 같은 분야 개발자
- 개발 입문자/학생
- 본인 (학습 기록)

### Core Features
- 마크다운(MDX) 기반 글쓰기
- 코드 하이라이팅 (syntax highlighting)
- 포트폴리오/프로젝트 쇼케이스 페이지
- 카테고리/태그 분류
- 다크모드/라이트모드
- 댓글 + 대댓글 (직접 구현, DB 사용)

### Design Direction
- **스타일**: Modern Dev (다크 기조, 블루/퍼플 그라데이션 포인트)
- **레이아웃**: Sidebar (좌측 사이드바에 프로필/카테고리/네비게이션)

### Developer Context
- 경험 수준: 입문자 (HTML/CSS/JS 기본)
- 학습 목표: React, Next.js, Spring Boot, TypeScript, 다양한 호스팅 경험

---

## Architecture

```
┌─────────────────┐     REST API     ┌─────────────────┐     SQL      ┌──────────┐
│   Next.js       │ ──────────────→  │  Spring Boot    │ ──────────→  │PostgreSQL│
│   (Frontend)    │ ←────────────── │  (Backend API)  │ ←────────── │(Supabase)│
│                 │      JSON        │                 │              │          │
│ - 정적 블로그    │                  │ - 댓글 CRUD     │              │- comments│
│ - MDX 렌더링    │                  │ - OAuth2 인증   │              │- users   │
│ - UI/UX        │                  │ - 사용자 관리    │              │          │
└─────────────────┘                  └─────────────────┘              └──────────┘
     Vercel                           Railway/Render                   Supabase
    (무료 배포)                        (무료 배포)                      (무료 DB)
```

### Role Separation

| Area | Owner | Description |
|------|-------|-------------|
| Static content | Next.js | MDX blog, portfolio, SSG |
| Dynamic features | Spring Boot | Comments, auth, user management |
| Database | Supabase PostgreSQL | Comments, user data |
| Authentication | Spring Security + OAuth2 | GitHub/Google social login |

---

## Tech Stack

### Frontend

| Area | Technology | Reason |
|------|-----------|--------|
| Framework | Next.js 15 (App Router) | Latest patterns, industry standard |
| Language | TypeScript | Type safety, good habit from start |
| Styling | Tailwind CSS | Utility-first, rapid UI development |
| Content | MDX (Markdown + JSX) | Embed React components in posts |
| Code highlighting | rehype-pretty-code + Shiki | VSCode-level highlighting |
| Theme | next-themes | Optimized dark/light toggle for Next.js |
| Package manager | pnpm | Fast and disk-efficient |

### Backend

| Area | Technology | Reason |
|------|-----------|--------|
| Framework | Spring Boot 3 | Industry standard, layered architecture experience |
| Language | Java 21 | Latest LTS |
| Auth | Spring Security + OAuth2 Client | Social login (GitHub, Google) |
| ORM | Spring Data JPA | Standard DB access |
| API Docs | SpringDoc OpenAPI (Swagger) | Auto-generated API documentation |

### Infrastructure

| Area | Technology | Reason |
|------|-----------|--------|
| Database | Supabase (PostgreSQL) | Free tier, managed, industry-standard DB |
| Frontend deploy | Vercel | Free, automatic builds from GitHub |
| Backend deploy | Railway | Free tier ($5/month credit) |

---

## Project Structure

```
blog/
├── frontend/                # Next.js project
│   ├── app/
│   │   ├── layout.tsx       # Root layout (Sidebar included)
│   │   ├── page.tsx         # Homepage (latest posts)
│   │   ├── blog/
│   │   │   ├── page.tsx     # Blog list page
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Individual post page
│   │   ├── portfolio/
│   │   │   ├── page.tsx     # Portfolio list
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Project detail page
│   │   └── about/
│   │       └── page.tsx     # About page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx  # Sidebar (profile, categories, nav)
│   │   │   ├── Header.tsx   # Mobile header
│   │   │   └── Footer.tsx
│   │   ├── blog/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   └── TagBadge.tsx
│   │   ├── portfolio/
│   │   │   └── ProjectCard.tsx
│   │   ├── comments/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── LoginButton.tsx
│   │   ├── mdx/
│   │   │   └── index.tsx    # MDX custom components
│   │   └── common/
│   │       └── ThemeToggle.tsx
│   ├── content/
│   │   ├── blog/            # MDX blog posts
│   │   │   └── my-first-post.mdx
│   │   └── projects/        # Portfolio projects
│   │       └── project-a.mdx
│   ├── lib/
│   │   ├── content.ts       # MDX content loading
│   │   ├── api.ts           # Spring Boot API wrapper
│   │   └── types.ts         # Common types
│   ├── public/              # Static files (images)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
└── backend/                  # Spring Boot project
    └── src/main/java/com/blog/
        ├── BlogApplication.java
        ├── config/
        │   ├── SecurityConfig.java
        │   └── WebConfig.java
        ├── controller/
        │   ├── CommentController.java
        │   └── AuthController.java
        ├── service/
        │   └── CommentService.java
        ├── repository/
        │   └── CommentRepository.java
        ├── entity/
        │   ├── Comment.java
        │   └── User.java
        └── dto/
            ├── CommentRequest.java
            └── CommentResponse.java
```

---

## Page Specifications

### 1. Homepage (`/`)
- Latest blog posts (3-5 previews)
- Featured portfolio projects (2-3)
- One-line self introduction

### 2. Blog List (`/blog`)
- All posts list (title, summary, date, tags)
- Filter by category/tag
- Sorted by newest first

### 3. Blog Detail (`/blog/[slug]`)
- MDX rendering (markdown + code highlighting)
- Table of Contents
- Previous/Next post navigation
- Estimated reading time
- Comment section (login required to write)
  - Comment list with nested replies (indented)
  - Inline reply form

### 4. Portfolio List (`/portfolio`)
- Project card grid
- Tech stack tags
- GitHub/deploy links

### 5. Portfolio Detail (`/portfolio/[slug]`)
- Project description (MDX)
- Screenshots/demo images
- Tech used, role, duration

### 6. About (`/about`)
- Self introduction
- Tech stack list
- Contact/social links

### 7. Sidebar (all pages)
- Profile photo + name + one-line intro
- Navigation menu (Blog, Portfolio, About)
- Category list (with post count)
- Dark/Light mode toggle
- Hamburger menu on mobile

---

## Comment System

### Data Model

```sql
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug   TEXT NOT NULL,
    parent_id   UUID REFERENCES comments(id),
    author_id   UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

### Features
- **Write**: Login required (GitHub/Google OAuth)
- **Replies**: 1 level deep max (reply-to-reply shown at same level)
- **Edit/Delete**: Own comments only
- **Soft delete**: Shows "deleted comment" placeholder to preserve reply tree

---

## Deployment Strategy

| Service | Target | Free Tier |
|---------|--------|-----------|
| Vercel | Next.js (Frontend) | Unlimited static, 100GB/month bandwidth |
| Railway | Spring Boot (Backend) | $5/month credit (~500 hours) |
| Supabase | PostgreSQL (DB) | 500MB DB, 50K monthly requests |

### Deploy Flow

```
GitHub Push (main)
    ├── Vercel: Auto build/deploy (frontend/)
    └── Railway: Auto build/deploy (backend/)

Supabase: Separate management (schema via migration files)
```

### Environment Variables

```
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.railway.app

# Backend (application.yml)
SPRING_DATASOURCE_URL=postgresql://...
OAUTH_GITHUB_CLIENT_ID=...
OAUTH_GITHUB_CLIENT_SECRET=...
OAUTH_GOOGLE_CLIENT_ID=...
OAUTH_GOOGLE_CLIENT_SECRET=...
CORS_ALLOWED_ORIGINS=https://your-blog.vercel.app
```

---

## Design Decisions & Rationale

1. **Feature-based project structure** with single data access abstraction (`lib/content.ts`) — idiomatic Next.js, beginner-friendly, easy to extend later.
2. **Monorepo** (`frontend/` + `backend/` in one repo) — simpler management at blog scale.
3. **MDX file-based content** — Git-managed, no CMS needed initially, easy migration to CMS later.
4. **1-level reply depth** — prevents UI complexity explosion, matches industry standard (Reddit, GitHub).
5. **Soft delete for comments** — preserves reply tree integrity.
6. **Supabase for DB** — free managed PostgreSQL, built-in auth helpers, real-time capabilities for future use.

---

## Next Steps

1. Write implementation plan (writing-plans skill)
2. Set up frontend (Next.js + Tailwind + MDX)
3. Set up backend (Spring Boot + JPA)
4. Set up Supabase DB
5. Implement pages
6. Implement comment system
7. Deploy to Vercel + Railway
