# Blog Website Redesign Spec

## Overview

개인 기술 블로그 + 포트폴리오 웹사이트 전체 재설계. 기존 Spring Boot 백엔드를 NestJS로 교체하고, MDX 파일 기반 콘텐츠를 DB 기반으로 전환하며, 관리자 페이지를 추가한다.

## Requirements

### Purpose

- 개인 기술 블로그 (개발 학습 기록, 기술 포스팅)
- 포트폴리오 (프로젝트 소개)
- 관리자 페이지에서 글/프로젝트 작성 및 관리

### Target Audience

- 채용 담당자/기업
- 같은 분야 개발자
- 개발 입문자/학생
- 본인 (학습 기록)

### Core Features

- 마크다운 기반 블로그 (코드 하이라이팅, 목차, 읽기 시간)
- 포트폴리오/프로젝트 쇼케이스
- 카테고리/태그 분류 및 필터링
- 댓글 + 대댓글 (로그인 불필요, 닉네임+비밀번호)
- 관리자 페이지 (마크다운 에디터, 글/프로젝트/댓글 관리)
- 관리자 인증 (아이디/비밀번호 직접 구현, JWT)
- 다크/라이트 모드 전환
- 기본 SEO 메타데이터 (title, description, og:image — Next.js generateMetadata 활용)
- 키워드 검색 (제목 + 요약)

### Removed from Original Design

- OAuth 소셜 로그인 (GitHub, Google) — 제거

### Design Direction

- **스타일**: 라이트 기조, 미니멀
- **레이아웃**: 좌측 사이드바 (프로필/네비게이션/카테고리/테마 토글)
- **모바일**: 사이드바 → 햄버거 메뉴

### Developer Context

- 경험 수준: 입문자 (HTML/CSS/JS 기본)
- 학습 목표: React, Next.js, NestJS, TypeScript, Docker
- GitHub: min1336

---

## Architecture

```
┌─────────────────┐     REST API     ┌─────────────────┐           ┌──────────┐
│   Next.js 16.2  │ ──────────────→  │   NestJS 11     │ ────────→ │  MySQL 8 │
│   (Frontend)    │ ←────────────── │   (Backend)     │ ←──────── │          │
│                 │      JSON        │                 │  TypeORM  │          │
│ - 블로그 UI      │                  │ - 블로그 CRUD    │           │- posts   │
│ - 포트폴리오 UI  │                  │ - 포트폴리오 CRUD │           │- projects│
│ - 관리자 페이지   │                  │ - 댓글 CRUD      │           │- comments│
│ - 마크다운 렌더링 │                  │ - 관리자 인증     │           │- admins  │
└─────────────────┘                  └─────────────────┘           └──────────┘
     :3000                                :4000                       :3306

              └──────── Docker Compose ─────────────────────────────┘
```

### Role Separation

| Area | Owner | Description |
|------|-------|-------------|
| UI/Rendering | Next.js | 모든 페이지 UI, 마크다운→HTML 변환, 코드 하이라이팅 |
| API | NestJS | 블로그/포트폴리오/댓글 CRUD, 관리자 인증 |
| DB | MySQL | 모든 콘텐츠 저장 (글, 프로젝트, 댓글, 관리자 계정) |

### Communication

- 프론트엔드에서 `fetch`로 NestJS REST API 호출
- NestJS에서 CORS 설정으로 프론트엔드 origin 허용
- Docker Compose 내부 네트워크 통신

---

## Tech Stack

### Frontend

| Area | Technology | Version |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4.2 |
| UI Components | shadcn/ui (CLI v4) | latest |
| Theme | next-themes | latest |
| Icons | lucide-react | latest |
| Markdown Rendering | react-markdown | 10.1 |
| Code Highlighting | rehype-pretty-code + shiki | 0.14 / 4.0 |
| Markdown Editor | @uiw/react-md-editor | latest |
| Package Manager | pnpm | latest |

### Backend

| Area | Technology | Version |
|------|-----------|---------|
| Framework | NestJS | 11 |
| Language | TypeScript | 5 |
| ORM | TypeORM | 0.3.28 |
| Auth | passport-jwt (JWT) | latest |
| Validation | class-validator + class-transformer | latest |
| Password Hashing | bcrypt | latest |

### Infrastructure

| Area | Technology | Version |
|------|-----------|---------|
| Database | MySQL | 8 |
| Container | Docker Compose | latest |
| Frontend Port | 3000 | — |
| Backend Port | 4000 | — |
| DB Port | 3306 | — |

---

## Data Model

### posts

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| title | VARCHAR(255) | 제목 |
| slug | VARCHAR(255), UNIQUE | URL용 식별자 |
| content | LONGTEXT | 마크다운 본문 |
| summary | VARCHAR(500) | 요약 |
| category | VARCHAR(100) | 카테고리 |
| tags | JSON | 태그 배열 |
| thumbnail | VARCHAR(500) | 썸네일 이미지 URL |
| view_count | INT, DEFAULT 0 | 조회수 |
| published | BOOLEAN | 공개 여부 |
| created_at | DATETIME | 작성일 |
| updated_at | DATETIME | 수정일 |

**Indexes:**
- `UNIQUE(slug)`
- `INDEX idx_posts_published_created (published, created_at DESC)`
- `INDEX idx_posts_category (category)`

### projects

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| title | VARCHAR(255) | 프로젝트명 |
| slug | VARCHAR(255), UNIQUE | URL용 식별자 |
| description | LONGTEXT | 마크다운 상세 설명 |
| summary | VARCHAR(500) | 한 줄 소개 |
| tech_stack | JSON | 사용 기술 배열 |
| github_url | VARCHAR(500) | GitHub 링크 |
| demo_url | VARCHAR(500) | 데모 링크 |
| thumbnail | VARCHAR(500) | 대표 이미지 |
| sort_order | INT, DEFAULT 0 | 표시 순서 (관리자 지정) |
| published | BOOLEAN | 공개 여부 |
| created_at | DATETIME | 작성일 |
| updated_at | DATETIME | 수정일 |

### comments

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| post_id | INT, NOT NULL, FK → posts(id) ON DELETE CASCADE | 어떤 글의 댓글인지 |
| parent_id | INT, NULL, FK → comments(id) | 대댓글이면 부모 댓글 ID |
| nickname | VARCHAR(50) | 작성자 닉네임 |
| password | VARCHAR(255) | 수정/삭제용 비밀번호 (bcrypt 해시) |
| content | TEXT | 댓글 내용 |
| deleted_at | DATETIME, NULL | soft delete용 |
| created_at | DATETIME | 작성일 |
| updated_at | DATETIME | 수정일 |

**Indexes:**
- `INDEX idx_comments_post_id (post_id)`
- `INDEX idx_comments_parent_id (parent_id)`

### admins

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | 고유 ID |
| username | VARCHAR(50), UNIQUE | 로그인 아이디 |
| password | VARCHAR(255) | 비밀번호 (bcrypt 해시) |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### Admin Seeding

최초 관리자 계정은 Docker 초기화 시 seed 스크립트로 생성한다. NestJS `onModuleInit`에서 admins 테이블이 비어있으면 환경변수(`ADMIN_USERNAME`, `ADMIN_PASSWORD`)로 기본 관리자를 자동 생성한다.

---

## API Design

All endpoints prefixed with `/api`. Response format: Simple Envelope pattern.

### Response Format

**Success (single):**
```json
{
  "success": true,
  "data": { ... },
  "message": "success"
}
```

**Success (list with pagination):**
```json
{
  "success": true,
  "message": "success",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "해당 글을 찾을 수 없습니다"
  },
  "statusCode": 404
}
```

### Blog Posts

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/posts | 글 목록 (카테고리/태그/검색 필터, 페이지네이션) | — |
| GET | /api/posts/:slug | 글 상세 (조회수 증가, prevPost/nextPost 포함) | — |
| POST | /api/posts | 글 작성 | Admin |
| PATCH | /api/posts/:slug | 글 수정 | Admin |
| DELETE | /api/posts/:slug | 글 삭제 | Admin |

### Portfolio Projects

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/projects | 프로젝트 목록 | — |
| GET | /api/projects/:slug | 프로젝트 상세 | — |
| POST | /api/projects | 프로젝트 작성 | Admin |
| PATCH | /api/projects/:slug | 프로젝트 수정 | Admin |
| DELETE | /api/projects/:slug | 프로젝트 삭제 | Admin |

### Comments

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/posts/:slug/comments | 댓글 목록 (대댓글 포함) | — |
| POST | /api/posts/:slug/comments | 댓글 작성 | — (닉네임+비밀번호) |
| PATCH | /api/comments/:id | 댓글 수정 (rate limited) | 비밀번호 확인 |
| DELETE | /api/comments/:id | 댓글 삭제 (soft delete, rate limited) | 비밀번호 또는 Admin |

Note: 댓글 수정/삭제 비밀번호 검증 엔드포인트는 `@nestjs/throttler`로 IP당 분당 5회 제한 적용.
Note: 댓글은 내부적으로 `post_id`(FK)로 연결. API에서는 slug로 post를 조회 후 post_id로 댓글 연결.

### Admin Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/login | 로그인 (JWT 발급, httpOnly cookie) | — |
| POST | /api/auth/logout | 로그아웃 (httpOnly cookie 삭제) | Admin |
| GET | /api/auth/me | 로그인 상태 확인 | Admin |

**JWT 전략:**
- Access Token을 httpOnly cookie에 저장 (XSS 방지)
- 만료 시간: 24시간
- 만료 시 재로그인 필요 (refresh token 미사용 — 관리자 1명이므로 단순하게)

### Categories & Tags

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/categories | 카테고리 목록 (posts 테이블에서 DISTINCT 집계, 글 수 포함) | — |
| GET | /api/tags | 태그 목록 (posts 테이블에서 집계) | — |

### Image Upload

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/upload | 이미지 업로드 (서버 로컬 저장) | Admin |

이미지는 NestJS 서버의 `uploads/` 디렉터리에 저장하고, `/uploads/filename.jpg` 경로로 서빙한다. Docker volume으로 영속화.

---

## Page Structure

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | 최신 글 3~5개 + 포트폴리오 2~3개 + 한 줄 소개 |
| `/blog` | Blog List | 글 목록, 카테고리/태그 필터, 페이지네이션 |
| `/blog/[slug]` | Blog Detail | 마크다운 렌더링, 목차, 읽기 시간, 댓글 |
| `/portfolio` | Portfolio List | 프로젝트 카드 그리드 |
| `/portfolio/[slug]` | Portfolio Detail | 프로젝트 상세, 기술 스택, 링크 |
| `/about` | About | 자기소개, 기술 스택, 연락처 |

### Admin Pages (login required)

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | Login | 아이디/비밀번호 |
| `/admin` | Dashboard | 글/프로젝트/댓글 수 요약 |
| `/admin/posts` | Post Management | 글 목록, 작성/수정/삭제 |
| `/admin/posts/new` | New Post | 마크다운 에디터 + 미리보기 |
| `/admin/posts/[slug]/edit` | Edit Post | 기존 글 편집 |
| `/admin/projects` | Project Management | 프로젝트 목록, 작성/수정/삭제 |
| `/admin/projects/new` | New Project | 마크다운 에디터 |
| `/admin/projects/[slug]/edit` | Edit Project | 기존 프로젝트 편집 |
| `/admin/comments` | Comment Management | 전체 댓글 조회, 삭제 |

### Layout

**Public Layout:**
```
┌──────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Sidebar  │  │       Main Content       │  │
│  │          │  │                          │  │
│  │ - 프로필  │  │                          │  │
│  │ - 네비    │  │                          │  │
│  │ - 카테고리│  │                          │  │
│  │ - 테마    │  │                          │  │
│  └──────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────┘
         모바일: 사이드바 → 햄버거 메뉴
```

**Admin Layout:** 별도 레이아웃 (상단 관리자 네비게이션)

---

## Comment System

### Features

- **Write**: 닉네임 + 비밀번호 입력으로 누구나 작성 가능
- **Replies**: 1 level deep max (대댓글의 대댓글은 같은 레벨에 표시)
- **Edit/Delete**: 작성 시 입력한 비밀번호로 확인
- **Admin Delete**: 관리자는 모든 댓글 삭제 가능
- **Soft delete**: "삭제된 댓글입니다" placeholder로 대댓글 트리 유지

---

## Project Structure

```
blog/
├── frontend/                  # Next.js 16.2
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (Sidebar)
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # Blog list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Blog detail
│   │   │   ├── portfolio/
│   │   │   │   ├── page.tsx          # Portfolio list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Portfolio detail
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # About
│   │   │   └── admin/
│   │   │       ├── login/
│   │   │       │   └── page.tsx      # Admin login
│   │   │       ├── layout.tsx        # Admin layout
│   │   │       ├── page.tsx          # Dashboard
│   │   │       ├── posts/
│   │   │       │   ├── page.tsx      # Post management
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # New post
│   │   │       │   └── [slug]/
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx  # Edit post
│   │   │       ├── projects/
│   │   │       │   ├── page.tsx      # Project management
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # New project
│   │   │       │   └── [slug]/
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx  # Edit project
│   │   │       └── comments/
│   │   │           └── page.tsx      # Comment management
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── mobile-header.tsx
│   │   │   ├── blog/
│   │   │   │   ├── post-card.tsx
│   │   │   │   ├── tag-badge.tsx
│   │   │   │   └── table-of-contents.tsx
│   │   │   ├── portfolio/
│   │   │   │   └── project-card.tsx
│   │   │   ├── comments/
│   │   │   │   ├── comment-section.tsx
│   │   │   │   ├── comment-item.tsx
│   │   │   │   └── comment-form.tsx
│   │   │   ├── admin/
│   │   │   │   ├── markdown-editor.tsx
│   │   │   │   └── admin-nav.tsx
│   │   │   ├── common/
│   │   │   │   └── theme-toggle.tsx
│   │   │   └── ui/                   # shadcn/ui components
│   │   └── lib/
│   │       ├── api.ts                # API client (fetch wrapper)
│   │       ├── types.ts              # Shared types
│   │       └── utils.ts              # Utility functions
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── backend/                   # NestJS 11
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/
│   │   │   ├── interceptors/
│   │   │   │   └── response.interceptor.ts
│   │   │   ├── filters/
│   │   │   │   └── global-exception.filter.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── dto/
│   │   │       └── pagination.dto.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   ├── posts/
│   │   │   ├── posts.module.ts
│   │   │   ├── posts.controller.ts
│   │   │   ├── posts.service.ts
│   │   │   ├── post.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-post.dto.ts
│   │   │       └── update-post.dto.ts
│   │   ├── projects/
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── project.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-project.dto.ts
│   │   │       └── update-project.dto.ts
│   │   ├── comments/
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── comment.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-comment.dto.ts
│   │   │       └── update-comment.dto.ts
│   │   └── admin/
│   │       └── admin.entity.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # Next.js + NestJS + MySQL
├── .gitignore
└── docs/
```

---

## Deployment

### Docker Compose (Local Development + Production)

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
      - API_URL=http://backend:4000

  backend:
    build: ./backend
    ports: ["4000:4000"]
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=blog
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=blog
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - CORS_ORIGIN=http://localhost:3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  mysql:
    image: mysql:8
    ports: ["3306:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=blog
      - MYSQL_USER=blog
      - MYSQL_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
  uploads_data:
```

### Environment Variables

```
# .env (Docker Compose)
DB_PASSWORD=your_db_password
MYSQL_ROOT_PASSWORD=your_root_password
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

Note: `NEXT_PUBLIC_API_URL`은 브라우저에서 접근하는 주소(localhost:4000), `API_URL`은 서버 사이드에서 Docker 내부 네트워크로 접근하는 주소(backend:4000).

---

## Design Decisions & Rationale

1. **NestJS over Spring Boot** — 프론트/백엔드 모두 TypeScript로 통일. 학습할 언어가 하나로 줄어들고, 타입 정의 공유 가능.
2. **MySQL over PostgreSQL** — 사용자 요청. 국내 실무에서도 많이 사용되는 DB.
3. **DB 기반 콘텐츠 over MDX 파일** — 관리자 페이지에서 웹 UI로 글 작성/수정 가능. 별도 코드 에디터 불필요.
4. **Simple Envelope API 응답** — 일관된 응답 구조로 프론트엔드 파싱 로직 단순화. NestJS Interceptor로 자동 적용.
5. **닉네임+비밀번호 댓글** — OAuth 없이 간단한 댓글 시스템. 비밀번호로 수정/삭제 권한 관리.
6. **JWT 관리자 인증** — 세션 기반보다 구현이 단순하고, NestJS passport와 잘 통합됨.
7. **Docker Compose** — 하나의 명령으로 전체 스택 실행. 로컬 개발과 배포 환경 일치.
8. **완전 분리형 아키텍처** — 프론트/백엔드 역할을 명확히 구분. REST API, CORS 등 실무 개념 학습에 유리.
9. **라이트 기조 미니멀 디자인** — 콘텐츠 가독성 중심. 다크모드는 토글로 지원.
10. **1-level reply depth** — UI 복잡성 방지. Reddit, GitHub와 동일한 방식.

---

## Changes from Original Design

| Area | Original | Redesigned |
|------|----------|------------|
| Backend | Spring Boot 3 (Java 21) | NestJS 11 (TypeScript) |
| DB | Supabase PostgreSQL | MySQL 8 |
| Content Management | MDX file-based | DB-based + Admin page with markdown editor |
| Comment Auth | OAuth (GitHub, Google) | No auth (nickname + password) |
| Admin | None | Full admin dashboard with JWT auth |
| Design | Dark base, blue/purple accent | Light base, minimal |
| Deploy | Vercel + Railway + Supabase | Docker Compose (single server) |
| SEO | Custom implementation | Basic (Next.js generateMetadata) |
| API Response | Not defined | Simple Envelope pattern |

---

## Next Steps

1. Write implementation plan (writing-plans skill)
2. Set up Docker Compose (MySQL + dev environment)
3. Set up NestJS backend (entities, modules, API)
4. Set up Next.js frontend (pages, components)
5. Implement admin pages
6. Implement comment system
7. Deploy to server
