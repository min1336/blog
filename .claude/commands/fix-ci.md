CI가 실패했습니다. 수정하세요.

## 절차
1. `gh run list --limit 5` 로 최근 CI 실행 확인
2. 실패한 run의 로그 확인: `gh run view <run-id> --log-failed`
3. 에러 원인 분석
4. 코드 수정
5. 프로젝트 도구로 로컬 검증 (테스트, 린트, 타입체크)
6. 커밋: "fix: CI 실패 수정 - [원인]"
