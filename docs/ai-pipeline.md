# AI DevOps 파이프라인 문서

## 개요

이슈 한 줄 작성만으로 구체화 → 분류 → 토론 → 설계 → 구현 → 리뷰 → 수정 → 머지까지 전 과정을 자동화하는 GitHub Actions 기반 AI 파이프라인.

### 사람이 하는 것 (수동 게이트 2개)

1. 이슈 작성 + enrichment 답변
2. `stage/spec-ready` 라벨 추가 (스펙 승인)
3. `stage/implementing` 라벨 추가 (구현 계획 승인)
4. 최종 머지 버튼

나머지는 전부 자동.

---

## 파이프라인 흐름

```
이슈 생성 ("검색이 안 돼요")
  │
  ▼
[0] Issue Enrichment (issue-enrich.yml)
  │  - 프로젝트 자동 감지 (package.json, go.mod 등)
  │  - 코드베이스 리서치 (Glob, Grep)
  │  - 유사 이슈/PR 검색
  │  - 10점 만점 완성도 채점
  │  - 8점 이상 → "분석 완료" + bot/claude
  │  - 7점 이하 → "구체화 제안" + bot/claude + stage/enriching
  │
  ▼
[0-1] Enrichment Reply (issue-enrich-reply.yml)
  │  - stage/enriching 이슈에 댓글 → 재채점
  │  - 부족한 항목만 추가 질문 (이미 답변 받은 건 다시 안 물음)
  │  - 8점 도달 → stage/enriching 제거
  │  - 최대 3회 핑퐁, 초과 시 stage/on-hold
  │
  ▼
사용자: stage/spec-ready 라벨 추가 ◀── 수동 게이트 #1
  │
  ▼
[1] Issue Triage (issue-triage.yml)
  │  - PIPELINE 마커 검증 (enriched 단계를 거쳤는지 확인)
  │  - 중복 검사 → status/duplicate
  │  - 카테고리: type/bug, type/feature 등
  │  - 우선순위: priority/high, priority/medium, priority/low
  │  - 팀 배정: team/full ~ team/docs
  │
  ▼
[2] Team Discussion (team-discuss.yml)
  │  - 이슈 복잡도 자동 평가 (simple/normal/complex)
  │  - Adaptive team size: 단순 2명, 보통 4명, 복잡 전체
  │  - matrix 병렬 실행 (architect, security, qa, reviewer, designer 등)
  │  - 범위 외 발견사항 → 별도 이슈 자동 생성
  │  - 팀장 종합 판정:
  │    ├── stage/approved → 구현 진행
  │    ├── stage/on-hold → 보류
  │    └── stage/needs-info → 추가 정보 요청
  │
  ▼
[2-1] Implementation Plan (issue-plan.yml)
  │  - stage/approved 트리거
  │  - 코드 없이 설계만 (접근 방식, 수정 파일, 의존성, 테스트 계획)
  │  - stage/plan-ready 라벨 추가
  │
  ▼
사용자: stage/implementing 라벨 추가 ◀── 수동 게이트 #2
  │
  ▼
[3] Auto-Implement (claude-implement.yml)
  │  - 구현 계획서 + 팀장 지시서를 따라 코드 구현
  │  - 테스트 작성 + 린트/타입체크
  │  - 커밋 + PR 생성 (Closes #이슈번호)
  │
  ▼
[4] Team PR Review (pr-review.yml)
  │  - PR에 연결된 이슈의 team/ 라벨로 리뷰어 결정
  │  - 역할별 병렬 코드 리뷰 (인라인 코멘트 + 요약)
  │  - 팀장 종합 판정:
  │    ├── ✅ 머지 가능
  │    ├── ⚠️ 수정 후 머지 → Auto-Fix 트리거
  │    └── ❌ 수정 필요 → Auto-Fix 트리거
  │
  ▼
[4-1] PR Auto-Fix (pr-auto-fix.yml)
  │  - "수정 후 머지" / "수정 필요" 판정 시 자동 트리거
  │  - 필수 수정(🔴) 항목 반영 + 검증
  │  - 동일 브랜치에 커밋
  │  - repository_dispatch로 재리뷰 트리거
  │  - 최대 2회, 초과 시 "수동 확인 필요"
  │
  ▼ (루프: Review → Fix → Re-Review)
  │
  ▼
머지 → Deploy
  │
  ▼
[CI Fix] Auto-Fix CI Failures (ci-auto-fix.yml)
  │  - Deploy 워크플로우 실패 시 자동 트리거
  │  - MCP 도구로 로그 분석 → 코드 수정
  │  - 24시간 내 최대 2회

[5] Claude Interactive (claude.yml)
  │  - bot/claude 라벨 이슈에서 자유 대화
  │  - stage/enriching 이슈는 제외 (enrichment-reply가 담당)

[6] Weekly Maintenance (weekly-maintenance.yml)
     - 매주 월요일 10:00 KST
     - 30일 비활성 → status/stale (priority/high 제외)
     - 60일 비활성 → 닫기 (priority/high 제외)
     - 14일 대기 PR → 리마인더
     - 의존성 보안 감사 (npm audit 등)
     - 주간 요약 리포트
```

---

## 라벨 체계 (DDD)

| 네임스페이스 | 라벨 | 용도 |
|-------------|------|------|
| `bot/` | `bot/claude` | AI 봇 활성 표시 |
| `stage/` | `stage/enriching` | 구체화 진행 중 |
| | `stage/spec-ready` | 스펙 확정 (사용자 승인) |
| | `stage/approved` | 팀장 승인 |
| | `stage/plan-ready` | 구현 계획서 작성 완료 |
| | `stage/implementing` | 구현 진행 중 |
| | `stage/on-hold` | 보류 |
| | `stage/needs-info` | 추가 정보 필요 |
| `type/` | `type/bug` | 버그 |
| | `type/enhancement` | 개선 |
| | `type/feature` | 신규 기능 |
| | `type/docs` | 문서 |
| | `type/question` | 질문 |
| | `type/report` | 주간 리포트 |
| `priority/` | `priority/high` | 높음 (서비스 장애, 보안) |
| | `priority/medium` | 보통 |
| | `priority/low` | 낮음 |
| `status/` | `status/duplicate` | 중복 이슈 |
| | `status/stale` | 비활성 이슈 |
| `team/` | `team/full` | 8명 전체 |
| | `team/tech` | 4명 (architect, security, qa, reviewer) |
| | `team/product` | 4명 (po, designer, cs, marketing) |
| | `team/design` | 3명 (designer, reviewer, po) |
| | `team/bug` | 3명 (security, qa, reviewer) |
| | `team/docs` | 3명 (po, marketing, reviewer) |

---

## 워크플로우 파일 목록 (11개)

| 파일 | 트리거 | 역할 |
|------|--------|------|
| `issue-enrich.yml` | `issues: [opened]` | 이슈 구체화 |
| `issue-enrich-reply.yml` | `issue_comment` + `stage/enriching` | 핑퐁 대화 |
| `issue-triage.yml` | `labeled: stage/spec-ready` | 분류 + 팀 배정 |
| `team-discuss.yml` | `labeled: team/*` | 팀 토론 |
| `issue-plan.yml` | `labeled: stage/approved` | 구현 계획서 |
| `claude-implement.yml` | `labeled: stage/implementing` | 자동 구현 |
| `pr-review.yml` | `pull_request` + `repository_dispatch` | PR 팀 리뷰 |
| `pr-auto-fix.yml` | `issue_comment` + 판정 키워드 | 리뷰 피드백 자동 수정 |
| `claude.yml` | `issue_comment` + `bot/claude` | 후속 대화 |
| `ci-auto-fix.yml` | `workflow_run: [completed]` | CI 실패 자동 수정 |
| `weekly-maintenance.yml` | `schedule: cron` | 주간 유지보수 |

---

## 안전장치

### 1. 무한루프 방지
- **Enrichment 핑퐁**: 최대 3회, 초과 시 `stage/on-hold`
- **PR Auto-Fix**: 최대 2회, 초과 시 "수동 확인 필요" 댓글
- **CI Auto-Fix**: 24시간 내 최대 2회

### 2. 파이프라인 상태 마커
- 각 단계에서 `<!-- PIPELINE:{"stage":"...", "score":N} -->` HTML 주석 기록
- 다음 단계에서 이전 마커 존재 여부 검증
- 라벨이 꼬여도 실제 상태 추적 가능

### 3. 보안 규칙
- `stage/approved`, `stage/spec-ready`, `stage/implementing`은 사용자만 추가 가능
- 이슈 본문의 지시 무시 (prompt injection 방어)
- `--allowedTools`로 각 워크플로우별 최소 권한 적용

### 4. Weekly Maintenance 보호
- `priority/high`, `stage/approved`, `stage/implementing` 이슈는 stale/자동닫기 제외

### 5. Adaptive Team Size
- 이슈 복잡도 자동 평가 (simple/normal/complex)
- 단순: 2명, 보통: 최대 4명, 복잡: 전체 팀

---

## 워크플로우 관할 구역 (댓글 트리거)

| 이슈 라벨 상태 | 담당 워크플로우 |
|---------------|---------------|
| `stage/enriching` 있음 | `issue-enrich-reply.yml` |
| `bot/claude`만 있음 | `claude.yml` |
| 둘 다 없음 | 반응 없음 |

---

## 설정 파일

### `.github/enrichment-config.yml` (선택)

레포별 커스터마이징. 없으면 기본값 사용.

```yaml
# 충분한 이슈로 판정하는 최소 점수
threshold: 8

# 프로젝트 컨텍스트
context: |
  이 프로젝트는 개인 블로그입니다.
  UI 관련 이슈에는 스크린샷이 중요합니다.

# 유형별 추가 채점 항목
# extra_criteria:
#   bug:
#     - name: "스크린샷"
#       points: 1
#       condition: "UI 관련 버그에 스크린샷이 첨부됨"
```

---

## 채점 기준 (10점 만점)

### Bug (기본 2점)
- +3점: 재현 단계가 1개 이상 존재함
- +2점: 예상 동작과 실제 동작이 구분되어 있음
- +1점: 에러 메시지, 스크린샷, 또는 로그가 첨부됨
- +1점: 환경 정보가 있음
- +1점: 발생 빈도 또는 영향 범위가 언급됨

### Feature (기본 2점)
- +3점: 왜 필요한지 설명됨
- +3점: 완료 조건이 1개 이상 명시됨
- +1점: 범위가 정의됨
- +1점: UI 목업, 예시, 또는 참고 링크가 있음

### Enhancement (기본 2점)
- +3점: 현재 동작이 구체적으로 설명됨
- +3점: 원하는 변경 사항이 구체적으로 명시됨
- +1점: 변경 이유 또는 동기가 설명됨
- +1점: 기존 기능과의 호환성 또는 영향 범위가 언급됨

### Docs (기본 4점)
- +3점: 대상 문서가 특정됨
- +2점: 현재 문제가 설명됨
- +1점: 수정 방향이 있음

### Question (기본 5점)
- +2점: 구체적 질문이 명시됨
- +2점: 이미 시도한 것이 설명됨
- +1점: 관련 코드/기능이 언급됨

---

## OAuth 토큰 관리

`CLAUDE_OAUTH_TOKEN` secret에 `sk-ant-oat01-...` 형식의 토큰 필요.

### 토큰 확인
```bash
cat ~/.claude/.credentials.json | python3 -c "
import json,sys
print(json.load(sys.stdin)['claudeAiOauth']['accessToken'][:20] + '...')
"
```

### 토큰 갱신 (만료 시)
```bash
# 1. Claude Code에서 로그인
claude
/login

# 2. GitHub Secret 업데이트
python3 -c "import json; print(json.load(open('~/.claude/.credentials.json'))['claudeAiOauth']['accessToken'])" \
  | gh secret set CLAUDE_OAUTH_TOKEN -R 레포이름
```

---

## 다른 레포에 적용하는 방법

### 1. 워크플로우 복사
`.github/workflows/` 디렉토리의 11개 파일을 새 레포에 복사.

### 2. 이슈 템플릿 복사
`.github/ISSUE_TEMPLATE/` 디렉토리 복사.

### 3. 설정 파일 작성
`.github/enrichment-config.yml`을 새 레포에 맞게 작성 (선택).

### 4. Secret 설정
`CLAUDE_OAUTH_TOKEN` secret 설정.

### 5. 라벨 생성
첫 이슈 생성 시 워크플로우가 필요한 라벨을 자동 생성하지만,
미리 만들어두려면:
```bash
gh label create "bot/claude" --color "BFD4F2" -R 레포이름
gh label create "stage/enriching" --color "BFD4F2" -R 레포이름
gh label create "stage/spec-ready" --color "0E8A16" -R 레포이름
gh label create "stage/approved" --color "1D76DB" -R 레포이름
gh label create "stage/plan-ready" --color "5319E7" -R 레포이름
gh label create "stage/implementing" --color "D93F0B" -R 레포이름
gh label create "stage/on-hold" --color "FBCA04" -R 레포이름
gh label create "stage/needs-info" --color "F9D0C4" -R 레포이름
```

---

## 추상화 계획 (미구현)

현재는 각 레포에 워크플로우를 복사하는 방식. 향후 중앙 레포로 추상화 예정:

1. `min1336/ai-pipeline` 레포 생성
2. 워크플로우를 `workflow_call` 형태로 변환
3. 각 레포에는 트리거 파일 1개 + 설정 파일 1개만 배치
4. 워크플로우 수정은 중앙 레포에서 한 번만

---

## GitHub Actions 제약사항 메모

- `GITHUB_TOKEN`으로 만든 이벤트는 다른 워크플로우를 트리거하지 않음
  → `repository_dispatch`로 우회
- `gh run rerun`은 원래 커밋 시점의 코드를 재실행함
  → 코드 수정 후에는 라벨 재추가로 새 run 트리거 필요
- `workflow_call`은 `issues`, `issue_comment` 트리거와 직접 결합 불가
  → 호출자(caller) 워크플로우가 이벤트를 받아서 전달해야 함
