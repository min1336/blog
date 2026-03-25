이슈 $ARGUMENTS 을 구현하세요.

## 절차
1. `gh issue view $ARGUMENTS -R $(gh repo view --json nameWithOwner -q .nameWithOwner) --comments` 로 이슈와 댓글을 모두 읽기
2. "👔 팀장 최종 판정" 댓글이 있으면 그 지시서를 따르기
3. 프로젝트 환경 파악 (언어, 프레임워크, 도구)
4. 코드 구현
5. 테스트 작성 + 실행
6. 린트/포맷/타입체크 (있는 경우)
7. 커밋 (conventional commits, 한국어)
8. `gh pr create` 로 PR 생성 (본문에 `Closes #이슈번호` 포함)
9. 이슈에 완료 댓글 작성
