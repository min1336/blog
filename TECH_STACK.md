# Tech Stack

## Frontend

| 기술 | 역할 | 버전 |
|---|---|---|
| **Next.js** | React 기반 웹 프레임워크 (SSR, 라우팅, 빌드) | 16.2.1 |
| **React** | UI 컴포넌트 라이브러리 | 19.2.4 |
| **TypeScript** | 타입이 있는 JavaScript | 5 |
| **Tailwind CSS** | 유틸리티 기반 CSS 프레임워크 | 4 |
| **shadcn/ui** | Tailwind 기반 UI 컴포넌트 모음 | 4.1.0 |
| **react-markdown** | 마크다운 → HTML 렌더링 | 10.1.0 |
| **shiki** | 코드 구문 강조(syntax highlighting) | 4.0.2 |
| **next-themes** | 다크모드/라이트모드 전환 | 0.4.6 |
| **lucide-react** | 아이콘 라이브러리 | 1.0.1 |

## Backend

| 기술 | 역할 | 버전 |
|---|---|---|
| **NestJS** | Node.js 백엔드 프레임워크 (모듈/DI 구조) | 11 |
| **TypeScript** | 타입이 있는 JavaScript | 5 |
| **TypeORM** | DB를 코드로 다루는 ORM | 0.3.28 |
| **MySQL** | 관계형 데이터베이스 | 8 |
| **Passport + JWT** | 인증 (로그인/토큰 관리) | - |
| **class-validator** | DTO 입력값 검증 (데코레이터 기반) | 0.15.1 |
| **bcrypt** | 비밀번호 암호화 | 6.0.0 |
| **multer** | 파일 업로드 처리 | 2.1.1 |

## Infra / Tools

| 기술 | 역할 |
|---|---|
| **Docker Compose** | 로컬 환경에서 전체 서비스 한번에 실행 |
| **pnpm** | 패키지 관리자 (npm보다 빠르고 디스크 절약) |
| **ESLint + Prettier** | 코드 스타일 통일 |
| **Jest** | 백엔드 테스트 프레임워크 |

## Architecture

```
사용자 브라우저
    │
    ├── 정적 파일 (HTML/JS/CSS) ← Next.js가 빌드
    │
    └── API 요청 ──→ NestJS (localhost:4000)
                        │
                        └──→ MySQL (localhost:3307)
```
