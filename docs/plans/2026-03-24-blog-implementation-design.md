# Blog Implementation Design

## Confirmed Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| Content | MDX (rehype-pretty-code + Shiki) |
| Theme | next-themes (dark base, blue/purple accent) |
| Backend | Spring Boot 3 + Java 21 + Gradle (Kotlin DSL) |
| Auth | Spring Security + OAuth2 (GitHub, Google) |
| ORM | Spring Data JPA |
| DB | Supabase (PostgreSQL) |
| Deploy | Vercel (FE) + Railway (BE) + Supabase (DB) |
| Package Manager | pnpm (frontend) |

## Implementation Strategy

- Frontend + Backend simultaneous development (feature-by-feature)
- Monorepo structure: `frontend/` + `backend/` in one repo

## Design Decisions (Updated from Original Spec)

1. **Next.js 16** (upgraded from 15) — latest patterns, Turbopack default, proxy.ts
2. **Gradle Kotlin DSL** — Spring Initializr default, type-safe build config, industry trend
3. **shadcn/ui** — source-owned components, Radix UI + Tailwind, built-in a11y and dark mode

## Unchanged from Original Spec

- Page structure (Homepage, Blog, Portfolio, About, Sidebar)
- Comment system (1-level reply, soft delete, UUID-based)
- Deployment strategy (Vercel + Railway + Supabase free tiers)
- MDX file-based content management
- OAuth2 social login (GitHub, Google)

## Reference

- Original spec: `docs/specs/2026-03-23-blog-design.md`
