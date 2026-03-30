# Blog & Portfolio

풀스택으로 직접 설계/구현/배포한 기술 블로그 & 포트폴리오

> **Demo**: [blog-ebon-eta-50.vercel.app](https://blog-ebon-eta-50.vercel.app)

<!-- 스크린샷 추가 시:
![홈 화면](docs/screenshots/home.png)
-->

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **Backend** | NestJS 11, TypeORM 0.3, MySQL 8, JWT 인증, class-validator |
| **Infra** | Vercel (프론트), AWS EC2 (백엔드), Docker, GitHub Actions |
| **CI/CD** | 13개 자동화 워크플로우 (AI 기반 이슈 분류/리뷰/배포) |

## 아키텍처

```
[사용자] → [Vercel CDN] → [Next.js SSR]
                              ↓
                         [NestJS API] ← [GitHub Actions CI/CD]
                              ↓              ↓
                          [MySQL 8]    [GHCR → EC2 배포]
```

## 주요 기능

- **블로그** — Markdown 작성, 코드 하이라이팅(Shiki), 카테고리/태그 필터, 검색
- **포트폴리오** — 프로젝트 쇼케이스, 기술 스택 태그, GitHub/데모 링크
- **댓글** — 대댓글 지원, 비밀번호 기반 익명 댓글
- **관리자** — JWT 인증, 글/프로젝트/댓글 CRUD 대시보드
- **다크모드** — 시스템 설정 연동, 수동 토글
- **이미지 업로드** — Multer 기반 파일 업로드

## AI DevOps 파이프라인

GitHub Issues에서 배포까지 자동화된 파이프라인:

```
이슈 생성 → 자동 분류 → 스펙 구체화 → 팀 토론 → 구현 계획
    → 자동 구현 → PR 리뷰 (역할별 병렬) → 피드백 자동 수정 → 배포
```

| 워크플로우 | 역할 |
|-----------|------|
| `issue-triage.yml` | 이슈 자동 분류 및 라벨링 |
| `issue-enrich.yml` | 이슈 스펙 구체화 |
| `team-discuss.yml` | 역할별 팀 토론 (아키텍트, 보안, QA, 디자이너) |
| `claude-implement.yml` | AI 자동 구현 |
| `pr-review.yml` | 병렬 코드 리뷰 |
| `pr-auto-fix.yml` | 리뷰 피드백 자동 수정 + 재리뷰 |
| `deploy.yml` | GHCR 빌드 → EC2 배포 + 헬스체크 |
| `ci-auto-fix.yml` | CI 실패 시 자동 수정 |
| `weekly-maintenance.yml` | 주간 자동 유지보수 |

## 로컬 실행

### 사전 준비

- Node.js 20+
- pnpm
- Docker & Docker Compose

### 실행

```bash
# 1. 저장소 클론
git clone https://github.com/min1336/blog.git
cd blog

# 2. MySQL 실행
docker compose up mysql -d

# 3. 백엔드 실행
cd backend
pnpm install
pnpm start:dev    # http://localhost:4000

# 4. 프론트엔드 실행 (새 터미널)
cd frontend
pnpm install
pnpm dev          # http://localhost:3000
```

### 환경변수

백엔드 (`backend/.env`):

```
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=blog
DB_PASSWORD=blogpass123
DB_DATABASE=blog
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

프론트엔드 (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 프로젝트 구조

```
blog/
├── frontend/          # Next.js 16 (App Router)
│   └── src/
│       ├── app/       # 페이지 라우팅
│       ├── components/# UI 컴포넌트
│       └── lib/       # API 클라이언트, 타입, 유틸
│
├── backend/           # NestJS 11
│   └── src/
│       ├── auth/      # JWT 인증, 관리자 엔티티
│       ├── posts/     # 블로그 글 CRUD
│       ├── comments/  # 댓글 (대댓글 포함)
│       ├── projects/  # 포트폴리오 CRUD
│       ├── upload/    # 이미지 업로드
│       └── common/    # 데코레이터, 필터, 인터셉터
│
├── .github/workflows/ # CI/CD + AI 파이프라인 (13개)
├── docker-compose.yml # 로컬 개발 환경
└── docs/              # 설계 문서, 스펙
```
