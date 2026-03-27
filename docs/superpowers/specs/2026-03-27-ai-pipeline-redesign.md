# AI DevOps Pipeline Redesign Spec

## Overview

기존 블로그 레포에 하드코딩된 13개 워크플로우를 **다중 레포 지원 AI 파이프라인**으로 재설계한다. 중앙 레포에 공통 로직을 두고, 각 프로젝트 레포에는 설정 파일만 두는 구조.

## 목표

- 이슈 하나 만들면 PR까지 AI가 자동으로 처리
- 사람의 개입 = **이슈 작성 + PR 승인**, 딱 2번
- 새 레포에 파이프라인 추가 시 **파일 3~4개만 생성**하면 동작
- 레포마다 팀 구성, 빌드 명령어, 배포 방식 등을 커스터마이징 가능

## 의존성 원칙

**외부 플러그인 의존 금지.** gstack, superpowers, oh-my-claudecode 등에서 아이디어만 착안하고
코드는 전부 자체 개발한다. 어떤 컴퓨터, 어떤 레포에서든 추가 설치 없이 동작해야 한다.

### 허용된 의존성 (이것만)

| 의존성 | 이유 |
|--------|------|
| `anthropics/claude-code-action@v1` | AI 실행 엔진 (GitHub Actions에서 자동 설치) |
| `actions/checkout@v4` | 레포 체크아웃 (GitHub 공식) |
| GitHub CLI (`gh`) | GitHub API 접근 (Runner에 기본 설치됨) |
| `git` | 버전 관리 (Runner에 기본 설치됨) |
| 프로젝트 빌드 도구 (`npm`, `pip` 등) | pipeline.yml에서 정의, Runner에 기본 설치됨 |

### 금지된 의존성

- gstack, superpowers, oh-my-claudecode 등 외부 Claude 플러그인
- 별도 설치가 필요한 MCP 서버 (필요 시 중앙 레포에 자체 구현)
- 특정 OS/환경에서만 동작하는 도구

### 아이디어 착안처

외부 프레임워크에서 가져온 **패턴만** (코드 아님):

| 출처 | 착안한 아이디어 |
|------|---------------|
| Superpowers | 2단계 서브에이전트 리뷰 (스펙 검증 → 품질 검증) |
| Superpowers | 검증 후 완료 원칙 (수정이 실제로 동작하는지 확인 후 완료) |
| Superpowers | 메타 스킬 (새 스킬을 만드는 스킬) |
| gstack | 관점별 순차 리뷰 (CEO → Eng → Design) |
| gstack | 안전장치 (위험 명령어 경고, 편집 범위 제한) |
| gstack | 브라우저 기반 QA (배포 후 자동 검증) |
| Oh-My-ClaudeCode | 작업 복잡도별 모델 라우팅 |
| Oh-My-ClaudeCode | verify → fix 루프 명시화 |

---

## 현재 문제점

1. **13개 워크플로우가 블로그 레포에 하드코딩** — 다른 레포에 쓸 수 없음
2. **채점 기준, 팀 구성, 배포 설정이 YAML 안에 박혀 있음** — 수정하려면 워크플로우 직접 편집
3. **수동 게이트 2개 (spec-ready, implementing)** — 불필요한 대기 시간
4. **v0.x 스타일의 복잡한 설정** — v1에서는 `prompt` + `claude_args`로 단순화 가능

---

## 파이프라인 프로토콜

### 4단계 흐름

```
사람: 이슈 생성 ──────────────────────────── 사람: PR 리뷰/머지
         │                                        ▲
         ▼     ← 이 구간 전부 AI 자동 →           │
   1. 구체화 → 2. 세분화 → 3. 실행 → 4. PR 생성
```

### 1단계: 구체화 (Enrich)

- 트리거: `issues: [opened]`
- 동작: 이슈 분석, 품질 점수 산출, 부족하면 질문 (최대 N회 핑퐁)
- 출력: 점수 + 분석 댓글 + 라벨 (`stage/enriched`)
- 점수 기준은 `pipeline.yml`에서 정의

### 2단계: 세분화 (Decompose)

- 트리거: `stage/enriched` 라벨 + 점수 threshold 통과
- 동작: 유형/우선순위 분류, 팀 배정, 역할별 분석, 구현 계획 작성
- 출력: 라벨 (`type/*`, `priority/*`) + 구현 계획 댓글 + 라벨 (`stage/ready`)
- 팀 구성과 역할은 `pipeline.yml`에서 정의

### 3단계: 실행 (Implement)

- 트리거: `stage/ready` 라벨 (자동, 수동 게이트 없음)
- 동작: 구현 계획에 따라 코드 작성, 테스트 실행, 브랜치 생성
- 출력: PR 생성 (`Closes #이슈번호`)
- 빌드/테스트 명령어는 `pipeline.yml`에서 정의

### 4단계: PR 리뷰 + 머지 대기

- 트리거: `pull_request: [opened, synchronize]`
- 동작: 역할별 코드 리뷰, 점수 산출, 체크리스트 검증
- 출력: 리뷰 댓글 + 인라인 코멘트 + 종합 점수 + 판정
- 리뷰 역할과 가중치는 `pipeline.yml`에서 정의
- 사람이 PR을 리뷰하고 머지 결정

---

## 기술 스택

### 필수 5가지

| # | 방법 | 역할 |
|---|------|------|
| 1 | AGENTS.md | 모든 AI 도구가 읽는 프로젝트 공통 규칙 |
| 2 | CLAUDE.md | Claude Code 전용 규칙 (hooks, 권한, skills) |
| 3 | GitHub Reusable Workflows | 중앙 레포에서 파이프라인 로직 공유 |
| 4 | GitHub Composite Actions | 재사용 가능한 개별 단계 블록 |
| 5 | pipeline.yml | 레포별 파이프라인 설정 파일 |

### 선택 (필요 시 추가)

| # | 방법 | 역할 |
|---|------|------|
| 6 | MCP (.mcp.json) | 외부 도구 연결 (DB, API 등) |
| 7 | devcontainer.json | 개발 환경 표준화 |

### 핵심 액션

- `anthropics/claude-code-action@v1` — 모든 AI 작업의 기반
  - `prompt`: 작업 지시
  - `claude_args`: 모델, 턴 수, 도구 제한, MCP, 시스템 프롬프트
  - `settings`: 환경변수, 권한, hooks
  - `track_progress: true`: 진행 상황 체크박스 자동 추적

---

## 레포 구조

### 중앙 레포: `min1336/ai-workflows`

```
ai-workflows/
├── .github/
│   └── workflows/
│       ├── enrich.yml            ← 이슈 구체화 (workflow_call)
│       ├── decompose.yml         ← 이슈 세분화 (workflow_call)
│       ├── implement.yml         ← 자동 구현 (workflow_call)
│       ├── review.yml            ← PR 리뷰 (workflow_call)
│       ├── ci-fix.yml            ← CI 실패 수정 (workflow_call)
│       └── maintenance.yml       ← 주간 유지보수 (workflow_call)
│
├── actions/
│   ├── setup-claude/             ← Claude 환경 세팅 (composite)
│   │   └── action.yml
│   ├── load-skills/              ← 스킬 로드 (composite) — 스킬 레포를 checkout해서 .claude/skills/에 복사
│   │   └── action.yml
│   ├── parse-pipeline/           ← pipeline.yml 파싱 (composite)
│   │   └── action.yml
│   └── post-score/               ← 점수 댓글 게시 (composite)
│       └── action.yml
│
├── skills/                       ← Claude Code 스킬 (자체 개발, 외부 의존성 없음)
│   │
│   │  # ── 파이프라인 핵심 스킬 ──
│   ├── enrich-issue/             ← 이슈 구체화
│   │   ├── SKILL.md              ← 지시문 (채점 + 질문 생성)
│   │   ├── scoring.md            ← 유형별 채점 기준
│   │   └── examples/
│   │       └── good-issue.md     ← 좋은/나쁜 이슈 예시
│   │
│   ├── decompose-issue/          ← 이슈 세분화
│   │   ├── SKILL.md              ← 분류 + 팀 배정 + 구현 계획
│   │   └── team-roles.md         ← 역할 정의 (architect, security, qa 등)
│   │
│   ├── implement/                ← 자동 구현
│   │   ├── SKILL.md              ← 코드 구현 지시 + 안전장치 (착안: gstack /guard)
│   │   └── conventions.md        ← 코드 컨벤션
│   │
│   ├── review-pr/                ← PR 리뷰 — 2단계 서브에이전트 (착안: superpowers)
│   │   ├── SKILL.md              ← 리뷰 오케스트레이션
│   │   ├── phase1-spec.md        ← 1단계: 스펙/요구사항 준수 검증
│   │   ├── phase2-quality.md     ← 2단계: 코드 품질/보안/성능 검증
│   │   └── checklist.md          ← 체크리스트 + 점수 산출 기준
│   │
│   ├── verify/                   ← 검증 (착안: superpowers verification-before-completion)
│   │   └── SKILL.md              ← 수정이 실제로 동작하는지 확인 후 완료
│   │
│   ├── fix-ci/                   ← CI 실패 수정
│   │   └── SKILL.md              ← 로그 분석 → 수정 → 검증 루프
│   │
│   ├── fix-pr/                   ← PR 리뷰 피드백 수정 (착안: oh-my-claudecode verify→fix loop)
│   │   └── SKILL.md              ← 리뷰 지적사항 수정 → 재검증
│   │
│   ├── maintenance/              ← 주간 유지보수
│   │   └── SKILL.md              ← stale 정리 + 보안 감사 + 리포트
│   │
│   │  # ── 유틸리티 스킬 ──
│   └── writing-skills/           ← 메타 스킬 (착안: superpowers writing-skills)
│       └── SKILL.md              ← 새 스킬을 만드는 가이드
│
├── scripts/
│   ├── gh.sh                     ← GitHub CLI 래퍼
│   └── edit-issue-labels.sh      ← 라벨 관리 래퍼
│
├── AGENTS.md                     ← 이 레포 자체의 AI 규칙
├── CLAUDE.md
└── README.md
```

### 각 프로젝트 레포 (예: blog)

```
blog/
├── AGENTS.md                     ← AI 공통 규칙
├── CLAUDE.md                     ← Claude 전용 규칙
├── .github/
│   ├── pipeline.yml              ← 이 레포의 파이프라인 설정
│   └── workflows/
│       └── ai.yml                ← 중앙 워크플로우 호출 (얇은 파일)
├── frontend/
├── backend/
└── ...
# 스킬은 이 레포에 없음 — GitHub Actions에서 중앙 레포의 스킬을 자동 로드
```

---

## pipeline.yml 스키마

```yaml
# .github/pipeline.yml — 레포별 AI 파이프라인 설정

# ── 프로젝트 정보 ──
project:
  name: blog
  language: typescript          # typescript | python | go | rust | java
  description: "NestJS + Next.js 개인 블로그"

# ── 빌드 명령어 ──
build:
  install: npm ci
  test: npm test
  lint: npm run lint
  type-check: npx tsc --noEmit
  build: npm run build           # 선택

# ── 파이프라인 단계 on/off ──
pipeline:
  enrich: true                   # 이슈 구체화
  decompose: true                # 이슈 세분화
  team-discuss: false            # 팀 토론 (1인 프로젝트면 false)
  auto-implement: true           # 자동 구현
  pr-review: true                # PR 리뷰
  ci-fix: true                   # CI 실패 자동 수정
  maintenance: true              # 주간 유지보수

# ── 리뷰 설정 ──
review:
  roles:                         # 활성화할 리뷰 역할
    - security
    - qa
    - reviewer
    # - architect                # 대규모 프로젝트에서 활성화
    # - designer                 # UI 프로젝트에서 활성화
    # - po                       # 팀 프로젝트에서 활성화

# ── 팀 구성 (team-discuss: true 일 때만) ──
team:
  default-size: 3                # 기본 팀 크기
  complexity-keywords:           # 복잡도 판단 키워드
    high: [auth, payment, migration, security, architecture]
    low: [typo, color, text, comment, readme]

# ── 라벨 ──
labels:
  stages:
    - enriched
    - ready
    - implementing
    - in-review
    - approved
  types:
    - bug
    - feature
    - enhancement
    - docs
  priorities:
    - critical
    - high
    - medium
    - low
  auto-rules:
    - match: "보안|security|XSS|injection|CSRF"
      add: ["priority/critical", "type/bug"]
    - match: "오타|typo|색상|color|텍스트"
      add: ["priority/low"]

# ── 체크리스트 ──
checklists:
  issue:
    - "문제/기능 설명이 명확한가"
    - "재현 방법 또는 기대 동작이 있는가"
    - "영향 범위가 특정됐는가"
  implementation:
    - "코드 구현 완료"
    - "테스트 작성 및 통과"
    - "린트/타입 체크 통과"
    - "기존 테스트 깨지지 않음"
  review:
    - "코드 컨벤션 준수"
    - "보안 취약점 없음"
    - "테스트 커버리지 충분"
    - "성능 이슈 없음"
    - "문서 변경사항 반영"

# ── 점수제 ──
scoring:
  issue:
    threshold: 8                 # 8점 이상 통과 (10점 만점)
    max-enrichment: 3            # 최대 핑퐁 횟수
    criteria:
      # 유형별 채점 기준은 프롬프트에서 정의
      # 여기서는 threshold와 제한만 설정

  review:
    threshold: 70                # 70% 이상이면 머지 가능
    weights:
      security: 25               # 보안 (25점)
      tests: 25                  # 테스트 (25점)
      code-quality: 20           # 코드 품질 (20점)
      performance: 15            # 성능 (15점)
      documentation: 15          # 문서 (15점)
    verdicts:
      - range: [90, 100]
        action: auto-approve     # 자동 승인
        label: "review/excellent"
      - range: [70, 89]
        action: approve          # 승인 권장
        label: "review/good"
      - range: [50, 69]
        action: request-changes  # 수정 요청
        label: "review/needs-work"
      - range: [0, 49]
        action: block            # 블록
        label: "review/major-issues"

# ── 안전장치 ──
safety:
  max-ci-fix-attempts: 2         # CI 수정 최대 시도
  max-pr-fix-attempts: 2         # PR 수정 최대 시도
  protected-labels:              # 자동 닫기 면제
    - priority/critical
    - priority/high
  stale-days: 30                 # 비활동 이슈 경고 (일)
  close-days: 60                 # 비활동 이슈 자동 닫기 (일)

# ── 배포 (선택) ──
deploy:
  target: ec2                    # ec2 | vercel | ecs | none
  health-check: /api/health
  # target별 추가 설정은 각 레포의 deploy 워크플로우에서 관리
```

---

## Reusable Workflow 설계

### enrich.yml (이슈 구체화)

```yaml
# 중앙 레포: .github/workflows/enrich.yml
name: Issue Enrich
on:
  workflow_call:
    inputs:
      language:
        type: string
        required: true
      threshold:
        type: number
        default: 8
      max-enrichment:
        type: number
        default: 3
    secrets:
      CLAUDE_OAUTH_TOKEN:
        required: true

jobs:
  enrich:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: min1336/ai-workflows/actions/parse-pipeline@v1

      # 중앙 레포의 스킬을 .claude/skills/에 복사
      - uses: min1336/ai-workflows/actions/load-skills@v1

      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_OAUTH_TOKEN }}
          track_progress: true
          prompt: |
            /enrich-issue ${{ github.event.issue.number }}
          claude_args: |
            --max-turns 15
            --allowedTools "Read,Bash(gh issue:*),Bash(gh search:*),Bash(./scripts/edit-issue-labels.sh:*)"
```

### 각 레포의 호출 파일

```yaml
# 프로젝트 레포: .github/workflows/ai.yml
name: AI Pipeline
on:
  issues:
    types: [opened]
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize, ready_for_review]
  schedule:
    - cron: "0 1 * * 1"

jobs:
  # ── 이슈 구체화 ──
  enrich:
    if: github.event_name == 'issues'
    uses: min1336/ai-workflows/.github/workflows/enrich.yml@v1
    with:
      language: typescript
      threshold: 8
    secrets: inherit

  # ── PR 리뷰 ──
  review:
    if: github.event_name == 'pull_request'
    uses: min1336/ai-workflows/.github/workflows/review.yml@v1
    with:
      roles: "security,qa,reviewer"
      threshold: 70
    secrets: inherit

  # ── 주간 유지보수 ──
  maintenance:
    if: github.event_name == 'schedule'
    uses: min1336/ai-workflows/.github/workflows/maintenance.yml@v1
    with:
      language: typescript
      stale-days: 30
    secrets: inherit
```

---

## 마이그레이션 계획

### 현재 → 신규 매핑

| 현재 워크플로우 | 신규 위치 | 변경 사항 |
|---------------|----------|----------|
| `issue-enrich.yml` | 중앙 `enrich.yml` | 채점 로직을 프롬프트로 이동, threshold 파라미터화 |
| `issue-enrich-reply.yml` | 중앙 `enrich.yml`에 통합 | Interactive 모드 활용 |
| `issue-triage.yml` | 중앙 `decompose.yml`에 통합 | 라벨 규칙을 pipeline.yml에서 로드 |
| `team-discuss.yml` | 중앙 `decompose.yml`에 통합 | 팀 구성을 pipeline.yml에서 로드, on/off 가능 |
| `issue-plan.yml` | 중앙 `decompose.yml`에 통합 | 세분화 단계의 마지막 step |
| `claude-implement.yml` | 중앙 `implement.yml` | 빌드 명령어를 pipeline.yml에서 로드 |
| `pr-review.yml` | 중앙 `review.yml` | 역할/가중치를 pipeline.yml에서 로드 |
| `pr-auto-fix.yml` | 중앙 `review.yml`에 통합 | 수정 후 재리뷰 루프 |
| `ci-auto-fix.yml` | 중앙 `ci-fix.yml` | max-attempts를 pipeline.yml에서 로드 |
| `weekly-maintenance.yml` | 중앙 `maintenance.yml` | stale/close 일수를 pipeline.yml에서 로드 |
| `claude.yml` | Interactive 모드로 대체 | @claude 멘션 자동 처리 |
| `deploy.yml` | 레포에 유지 (배포는 레포마다 다름) | 변경 없음 |

### 단계별 마이그레이션

1. **Phase 1**: 중앙 레포 생성 + Composite Actions 구현
2. **Phase 2**: enrich + decompose 워크플로우 마이그레이션
3. **Phase 3**: implement + review 워크플로우 마이그레이션
4. **Phase 4**: ci-fix + maintenance 워크플로우 마이그레이션
5. **Phase 5**: 블로그 레포에서 기존 워크플로우 제거, ai.yml로 교체
6. **Phase 6**: 다른 레포에 파이프라인 적용 테스트

---

## 새 레포에 파이프라인 추가하는 방법

1. `AGENTS.md` 작성 — 프로젝트 규칙
2. `.github/pipeline.yml` 작성 — 파이프라인 설정
3. `.github/workflows/ai.yml` 작성 — 중앙 워크플로우 호출
4. GitHub Secrets에 `CLAUDE_OAUTH_TOKEN` 추가
5. 끝

---

## 스킬 전략

### 핵심 개념: 로직의 분리

```
Reusable Workflows (.github/workflows/)
  → "언제, 어떤 조건에서" 실행 (트리거, 권한, 시크릿)
  → YAML로 정의

Skills (skills/)
  → "무엇을, 어떻게" 실행 (AI에게 주는 지시)
  → Markdown + 프론트매터로 정의
```

### 실행 흐름

```
GitHub Actions 트리거 (이슈 생성 등)
  ↓
Reusable Workflow 호출 (enrich.yml)
  ↓
load-skills composite action
  → 중앙 레포의 skills/ 디렉토리를 checkout
  → 프로젝트 레포의 .claude/skills/에 복사
  ↓
claude-code-action@v1 실행
  → Claude Code CLI를 자동 설치 (GitHub Actions Runner에)
  → .claude/skills/ 자동 탐색 → 스킬 로드
  → prompt에서 스킬 호출 (예: /enrich-issue 42)
  → 스킬의 SKILL.md 지시에 따라 작업 수행
  → 결과를 GitHub에 게시 (댓글, 라벨, 코드 수정 등)
```

### 스킬 공유 메커니즘 (load-skills composite action)

```yaml
# actions/load-skills/action.yml
name: Load AI Pipeline Skills
description: 중앙 레포의 스킬을 프로젝트 레포에 로드

runs:
  using: composite
  steps:
    - uses: actions/checkout@v4
      with:
        repository: min1336/ai-workflows
        path: .ai-workflows
        sparse-checkout: |
          skills
          scripts

    - shell: bash
      run: |
        mkdir -p .claude/skills
        cp -r .ai-workflows/skills/* .claude/skills/
        cp -r .ai-workflows/scripts/ ./scripts/
        rm -rf .ai-workflows
```

### 스킬 SKILL.md 예시 (enrich-issue)

```yaml
# skills/enrich-issue/SKILL.md
---
name: enrich-issue
description: 새 이슈를 분석하고 품질 점수를 산출합니다. 이슈가 열렸을 때 자동으로 사용합니다.
argument-hint: "[issue-number]"
allowed-tools: Read, Bash(gh issue:*), Bash(gh search:*), Bash(./scripts/edit-issue-labels.sh:*)
---

# 이슈 구체화

## 컨텍스트
- 레포: !`git remote get-url origin`
- pipeline.yml: !`cat .github/pipeline.yml 2>/dev/null || echo "없음"`

## 작업 절차

1. 이슈 #$ARGUMENTS 읽기
2. 프로젝트 코드베이스 분석 (관련 파일 탐색)
3. 이슈 품질 점수 산출 (채점 기준은 scoring.md 참조)
4. 점수가 threshold 이상이면:
   - stage/enriched 라벨 추가
   - 분석 결과 댓글 게시
5. 점수가 threshold 미만이면:
   - 부족한 정보 질문 댓글 게시
   - stage/enriching 라벨 추가

## 채점 기준
자세한 기준은 [scoring.md](scoring.md) 참조

## 출력 형식
댓글에 다음 포함:
- 점수: N/10
- 분석 요약
- (미달 시) 구체적 질문 목록
```

### 로컬에서도 동일하게 사용 가능

```bash
# Claude Code CLI에서 직접 호출 (로컬)
claude
> /enrich-issue 42

# 또는 GitHub Actions에서 자동 호출 (CI)
# → claude-code-action@v1이 동일한 스킬을 실행
```

---

## 참고 자료

- [AGENTS.md 공식 사이트](https://agents.md/)
- [GitHub Reusable Workflows 문서](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [claude-code-action@v1 솔루션 가이드](https://github.com/anthropics/claude-code-action/blob/main/docs/solutions.md)
- [claude-code-action@v1 설정 가이드](https://github.com/anthropics/claude-code-action/blob/main/docs/configuration.md)
- [GitHub Composite Actions vs Reusable Workflows](https://dev.to/n3wt0n/composite-actions-vs-reusable-workflows-what-is-the-difference-github-actions-11kd)
