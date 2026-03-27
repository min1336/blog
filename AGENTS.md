# AGENTS.md

## Build & Test
- `cd backend && npm ci` — 백엔드 의존성 설치
- `cd backend && npm test` — 백엔드 테스트
- `cd backend && npx eslint .` — 린트
- `cd backend && npx tsc --noEmit` — 타입 체크
- `cd frontend && npm ci` — 프론트엔드 의존성 설치
- `cd frontend && npm run build` — 프론트엔드 빌드

## Code Style
- 한국어 주석
- Conventional commits (feat/fix/refactor/test/docs/style/chore)
- TypeScript strict mode
- 2칸 들여쓰기

## Project Structure
- `/backend/` — NestJS 11 API 서버 (TypeORM, MySQL)
- `/frontend/` — Next.js 프론트엔드 (Tailwind CSS, shadcn/ui)
- `/backend/src/posts/` — 블로그 포스트 CRUD
- `/backend/src/auth/` — JWT 인증
- `/backend/src/comments/` — 댓글
- `/backend/src/projects/` — 포트폴리오 프로젝트
- `/backend/src/upload/` — 이미지 업로드

## Boundaries
- NEVER modify .env or credentials
- NEVER commit node_modules/, dist/, uploads/
- NEVER hardcode API keys, tokens, or passwords
