# 풀스택 블로그를 직접 만들면서 배운 것들: Next.js + NestJS 아키텍처 결정기

웹 개발을 공부하면서 "남의 코드를 따라 치는 것"과 "직접 설계하고 결정하는 것"은 완전히 다르다는 걸 느꼈다. 이 글은 개인 블로그를 처음부터 끝까지 직접 만들면서 내린 기술적 결정들과, 그 과정에서 배운 것들을 정리한 회고다.

## 왜 블로그를 직접 만들었나

Velog나 Tistory를 쓸 수도 있었다. 하지만 취업 포트폴리오로 "블로그 플랫폼을 사용했다"와 "블로그를 직접 만들었다"는 전달하는 메시지가 다르다고 생각했다.

직접 만들면 프론트엔드, 백엔드, 데이터베이스, 배포, CI/CD까지 풀스택 경험을 한 프로젝트에 담을 수 있다. 블로그 자체가 포트폴리오가 되는 셈이다.

## 기술 스택 선택: 왜 이 조합인가

### 프론트엔드: Next.js + React

React를 선택한 이유는 단순하다. 채용 시장에서 가장 많이 요구하는 프론트엔드 프레임워크이기 때문이다.

그런데 블로그는 SEO가 중요하다. 구글에서 검색될 수 있어야 의미가 있다. 순수 React(CSR)로 만들면 검색 엔진이 빈 HTML만 보게 된다. JavaScript가 실행되어야 내용이 보이기 때문이다.

```
CSR: 브라우저가 빈 HTML 받음 → JS 다운로드 → 실행 → 화면 렌더링
     (검색 엔진 봇은 JS를 제대로 실행하지 못하는 경우가 많다)

SSR: 서버에서 HTML 완성 → 브라우저가 완성된 HTML 받음
     (검색 엔진 봇이 바로 내용을 읽을 수 있다)
```

Next.js를 선택한 이유가 여기에 있다. SSR(서버 사이드 렌더링)을 지원하면서도 React 생태계를 그대로 쓸 수 있다. 파일 기반 라우팅도 직관적이어서, `app/blog/[slug]/page.tsx` 파일 하나 만들면 `/blog/어쩌구` URL이 자동으로 생긴다.

### 백엔드: NestJS

Express를 쓸 수도 있었지만 NestJS를 선택했다. 이유는 **구조**다.

Express는 자유도가 높다. 반대로 말하면, 프로젝트가 커지면 코드를 어디에 넣어야 할지 매번 고민해야 한다. NestJS는 Module-Controller-Service 패턴이 강제되어서, 코드가 어디에 있어야 하는지 정해져 있다.

```
NestJS 구조:
├── auth/          # 인증 관련 코드는 여기
│   ├── auth.controller.ts   (요청 받고)
│   ├── auth.service.ts      (로직 처리)
│   └── admin.entity.ts      (DB 구조)
├── posts/         # 블로그 글 관련 코드는 여기
├── comments/      # 댓글 관련 코드는 여기
└── projects/      # 포트폴리오 관련 코드는 여기
```

Spring Boot와 구조가 비슷해서, 나중에 Java 기반 프로젝트에도 적응하기 쉬울 거라는 판단도 있었다.

### 데이터베이스: MySQL + TypeORM

블로그 데이터는 관계가 명확하다. 글(Post) → 댓글(Comment), 글 → 태그, 글 → 카테고리. 이런 관계형 데이터에는 MySQL이 자연스럽다.

TypeORM을 선택한 이유는 TypeScript와의 궁합이다. 데코레이터로 엔티티를 정의하면 DB 테이블이 자동 생성된다:

```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
```

SQL을 직접 쓰지 않아도 되고, 타입 안전성까지 확보된다.

### 프론트/백엔드 분리: 왜?

"Next.js의 API Route로 백엔드를 대체할 수 있지 않나?"라는 질문을 받을 수 있다.

맞다. 간단한 블로그라면 Next.js만으로 충분하다. 하지만 나는 의도적으로 분리했다:

1. **학습 목적**: 프론트엔드와 백엔드를 분리해서 운영하는 경험은 실무에서 흔한 패턴이다
2. **독립 배포**: 프론트엔드만 수정했을 때 백엔드를 다시 배포할 필요가 없다
3. **기술 확장**: 나중에 모바일 앱을 만든다면 같은 API를 그대로 쓸 수 있다

물론 트레이드오프도 있다. CORS 설정이 필요하고, 프론트에서 백엔드를 호출하는 코드가 추가되며, 배포 대상이 2개로 늘어난다.

## 배포: Vercel + AWS EC2

프론트엔드는 Vercel에 배포했다. Next.js를 만든 회사의 플랫폼이라 최적화가 잘 되어 있고, `git push`만 하면 자동 배포된다.

백엔드는 AWS EC2(t2.micro)에 Docker로 배포했다. 여기서 첫 번째 삽질이 시작됐다.

### 삽질: t2.micro에서 Docker 빌드가 안 된다

t2.micro의 메모리는 1GB다. NestJS를 TypeScript로 빌드하려면 그 이상이 필요하다. 서버에서 `pnpm build`를 실행하면 메모리 부족으로 프로세스가 죽었다.

**해결:** GitHub Actions에서 빌드하고, 완성된 Docker 이미지를 GHCR(GitHub Container Registry)에 올린 뒤, EC2에서는 이미지를 받아서 실행만 하는 방식으로 변경했다.

```
변경 전: EC2에서 코드 pull → 빌드 → 실행 (메모리 부족으로 실패)
변경 후: GitHub Actions에서 빌드 → GHCR에 이미지 push → EC2에서 pull → 실행
```

이 경험에서 배운 것: 빌드 환경과 실행 환경은 분리하는 게 정석이다. CI/CD 파이프라인이 단순히 "편리함"이 아니라 "필요"인 경우가 있다.

### Dockerfile: 멀티스테이지 빌드

Docker 이미지 크기를 줄이기 위해 멀티스테이지 빌드를 적용했다:

```dockerfile
# 1단계: 빌드 (dev dependencies 포함)
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 2단계: 실행 (빌드 결과물만 복사)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/main"]
```

1단계에서 TypeScript를 JavaScript로 빌드하고, 2단계에서는 빌드 결과물(`dist/`)만 가져간다. 소스 코드, TypeScript 컴파일러 등 불필요한 파일이 최종 이미지에 포함되지 않는다.

## CI/CD: GitHub Actions

`git push`를 하면 자동으로 빌드 → 테스트 → 배포가 이루어지는 파이프라인을 구축했다.

```
git push → GitHub Actions 트리거
  → Docker 이미지 빌드
  → GHCR에 push
  → EC2에 SSH 접속
  → docker compose pull && up
  → 헬스체크 확인
```

여기서 보안을 위해 임시 접근(ephemeral access) 패턴을 적용했다. 배포하는 동안에만 EC2의 SSH 포트(22)를 열고, 배포가 끝나면 다시 닫는다. GitHub Actions의 러너 IP를 동적으로 Security Group에 추가/제거하는 방식이다.

## 돌아보며

이 프로젝트를 통해 가장 크게 배운 것은 **"왜?"를 스스로에게 묻는 습관**이다. "남들이 쓰니까"가 아니라 "내 상황에서 이게 맞는 이유"를 찾으려고 하면, 기술에 대한 이해가 훨씬 깊어진다.

만약 다시 처음부터 만든다면:
- TypeORM 대신 Prisma도 고려해볼 것 같다 (타입 추론이 더 강력하다)
- 처음부터 migration을 도입할 것이다 (synchronize에 의존하면 프로덕션에서 위험하다)
- 테스트 코드를 더 많이 작성할 것이다 (현재는 핵심 로직 위주로만 작성)

## 기술 스택 요약

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| Frontend | Next.js 16, React 19 | SSR + SEO + React 생태계 |
| Backend | NestJS 11 | 명확한 구조, TypeScript 네이티브 |
| DB | MySQL 8 + TypeORM | 관계형 데이터 + TS 데코레이터 |
| Infra | Vercel + AWS EC2 | 프론트 자동배포 + 백엔드 Docker |
| CI/CD | GitHub Actions | 빌드/테스트/배포 자동화 |

> 이 블로그의 전체 소스 코드는 [GitHub](https://github.com/min1336/blog)에서 확인할 수 있다.
