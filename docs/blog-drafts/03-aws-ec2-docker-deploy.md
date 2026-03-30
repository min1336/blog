# AWS EC2에 Docker로 NestJS 배포하기: 삽질의 기록

"로컬에서는 되는데 서버에서는 안 돼요." 배포를 처음 해본 사람이라면 누구나 겪는 상황이다. 이 글은 NestJS 백엔드를 AWS EC2에 Docker로 배포하면서 겪은 문제들과 해결 과정을 기록한 것이다.

## 목표

로컬에서 잘 동작하는 NestJS 백엔드를 인터넷에서 접근 가능한 상태로 만드는 것.

```
최종 구조:
GitHub → GitHub Actions → GHCR(이미지 저장소) → EC2(실행)
```

## EC2 인스턴스 선택

### t2.micro를 선택한 이유

AWS 프리 티어에서 무료로 사용할 수 있는 인스턴스다. 스펙은 이렇다:

| 항목 | 값 |
|------|-----|
| vCPU | 1 |
| 메모리 | 1GB |
| 스토리지 | EBS (기본 8GB) |
| 네트워크 | 저~중 |

개인 블로그 백엔드 정도는 충분한 스펙이다. 다만 **빌드는 불가능**하다. 이건 나중에 알게 됐다.

### AMI: Ubuntu vs Amazon Linux

AMI는 서버의 "복제 틀"이다. 운영체제가 미리 설치된 이미지라고 생각하면 된다.

Ubuntu와 Amazon Linux의 실질적 차이는 패키지 관리자뿐이다:
- Ubuntu: `apt install nginx`
- Amazon Linux: `dnf install nginx`

성능 차이는 없다. 나는 Ubuntu를 선택했다. 인터넷에 자료가 더 많기 때문이다.

## 첫 번째 삽질: 서버에서 빌드가 안 된다

처음 계획은 단순했다:

```
1. EC2에 Node.js 설치
2. git clone
3. pnpm install
4. pnpm build
5. pnpm start:prod
```

3단계까지는 문제없었다. `pnpm build`에서 멈췄다. TypeScript 컴파일이 메모리를 1GB 이상 사용하면서 프로세스가 OOM(Out of Memory)으로 죽었다.

### 시도 1: Swap 메모리

디스크의 일부를 RAM처럼 사용하는 방법이다:

```bash
sudo fallocate -l 2G /swapfile      # 2GB 파일 생성
sudo chmod 600 /swapfile             # 권한 설정
sudo mkswap /swapfile                # swap 영역으로 포맷
sudo swapon /swapfile                # 활성화
```

결과: 빌드가 되긴 했지만, 10분 이상 걸렸다. 디스크는 RAM보다 수십 배 느리기 때문이다. 코드를 수정할 때마다 10분씩 기다릴 수는 없었다.

### 시도 2: GitHub Actions에서 빌드 (최종 해결)

발상을 바꿨다. "서버에서 빌드하지 말고, 빌드된 결과물을 서버로 보내자."

```
변경 전: EC2에서 빌드 + 실행
변경 후: GitHub Actions에서 빌드 → Docker 이미지 생성 → GHCR에 업로드 → EC2에서 pull + 실행
```

GitHub Actions의 러너는 2코어 CPU + 7GB RAM을 제공한다. 빌드가 30초 만에 끝난다.

## Docker 배포 구조

### docker-compose.yml

```yaml
services:
  backend:
    image: ghcr.io/min1336/blog-backend:latest
    ports:
      - "4000:4000"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  mysql:
    image: mysql:8
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
```

핵심 포인트:
- `depends_on` + `condition: service_healthy`: MySQL이 완전히 준비된 후에 백엔드가 시작된다
- `healthcheck`: 컨테이너가 "실행 중"이 아니라 "정상 동작 중"인지 확인한다
- `volumes`: DB 데이터를 컨테이너 외부에 저장해서 컨테이너를 재시작해도 데이터가 유지된다

## 두 번째 삽질: Security Group과 SSH

EC2에 접속하려면 SSH를 사용한다:

```bash
ssh -i my-key.pem ubuntu@43.202.xxx.xxx
```

처음에 `Permission denied`가 떴다. 원인은 키 파일의 권한이었다:

```bash
chmod 400 my-key.pem   # 소유자만 읽기 가능
```

`400`의 의미:
- 4: 소유자(읽기)
- 0: 그룹(권한 없음)
- 0: 기타(권한 없음)

SSH는 키 파일의 권한이 너무 열려 있으면 보안상 접속을 거부한다.

### Security Group: 서버의 방화벽

EC2에는 Security Group이라는 방화벽이 있다. 기본적으로 모든 인바운드 트래픽이 차단되어 있다.

필요한 포트만 열어야 한다:

| 포트 | 용도 | 대상 |
|------|------|------|
| 22 | SSH 접속 | 내 IP만 |
| 4000 | NestJS API | 모든 IP (0.0.0.0/0) |

**중요:** SSH 포트(22)를 `0.0.0.0/0`으로 열면 전 세계 누구나 접속을 시도할 수 있다. 반드시 특정 IP로 제한해야 한다.

## 세 번째 삽질: CORS

프론트엔드(Vercel)에서 백엔드(EC2) API를 호출하니 이런 에러가 떴다:

```
Access to fetch at 'http://43.202.xxx.xxx:4000/api/posts'
from origin 'https://blog-ebon-eta-50.vercel.app'
has been blocked by CORS policy
```

브라우저는 보안을 위해 **다른 도메인**으로의 API 요청을 기본적으로 차단한다. 이것이 CORS(Cross-Origin Resource Sharing)다.

해결: NestJS에서 프론트엔드 도메인을 허용해야 한다:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN,  // 'https://blog-ebon-eta-50.vercel.app'
  credentials: true,
});
```

환경변수로 관리하는 이유: 개발 환경에서는 `localhost:3000`, 프로덕션에서는 Vercel URL을 사용해야 하기 때문이다.

## 네 번째 삽질: HTTPS와 Mixed Content

프론트엔드는 Vercel이 자동으로 HTTPS를 적용한다. 하지만 백엔드(EC2)는 HTTP다.

```
프론트엔드: https://blog-ebon-eta-50.vercel.app (HTTPS)
백엔드:     http://43.202.xxx.xxx:4000 (HTTP)
```

HTTPS 페이지에서 HTTP API를 호출하면 브라우저가 차단한다. 이것이 **Mixed Content** 문제다.

이 문제를 완전히 해결하려면 백엔드에도 HTTPS가 필요하고, HTTPS를 적용하려면 도메인이 필요하다 (IP 주소에는 SSL 인증서 발급이 안 된다).

현재는 도메인 구매 전이라, Next.js의 서버 사이드에서 API를 호출하는 방식으로 우회하고 있다. 서버 간 통신은 브라우저를 거치지 않으므로 Mixed Content 제한을 받지 않는다.

## CI/CD: GitHub Actions 배포 워크플로우

수동으로 SSH 접속해서 배포하는 것은 번거롭고 실수하기 쉽다. GitHub Actions로 자동화했다:

```
git push to main
  → Docker 이미지 빌드
  → GHCR에 push
  → EC2 Security Group에 GitHub Actions IP 추가
  → SSH로 EC2 접속
  → docker compose pull && up -d
  → 헬스체크 (/api/health 응답 확인)
  → Security Group에서 GitHub Actions IP 제거
```

임시 접근(ephemeral access) 패턴의 핵심:

```yaml
# 배포 시작: SSH 포트 열기
- name: Open SSH
  run: aws ec2 authorize-security-group-ingress ...

# 배포 실행
- name: Deploy
  run: ssh ... "docker compose pull && docker compose up -d"

# 배포 완료: SSH 포트 닫기 (실패해도 반드시 실행)
- name: Close SSH
  if: always()
  run: aws ec2 revoke-security-group-ingress ...
```

`if: always()`가 중요하다. 배포가 실패하더라도 SSH 포트는 반드시 닫아야 한다. 이걸 빠뜨리면 포트가 열린 채로 남는다.

## 배운 점 정리

| 문제 | 원인 | 해결 |
|------|------|------|
| 빌드 실패 | t2.micro 메모리 부족 | GitHub Actions에서 빌드 |
| SSH 접속 거부 | 키 파일 권한 문제 | chmod 400 |
| CORS 에러 | 다른 도메인 간 요청 차단 | NestJS CORS 설정 |
| Mixed Content | HTTPS→HTTP 호출 차단 | 서버 사이드 API 호출로 우회 |
| 보안 | SSH 포트 상시 개방 | 임시 접근 패턴 |

처음 배포할 때는 "왜 이렇게 복잡하지?"라고 느꼈다. 하지만 각 단계가 존재하는 이유를 이해하고 나면, 복잡한 것이 아니라 **각각이 문제를 해결하는 레이어**라는 것을 알게 된다.

> 전체 소스 코드: [GitHub](https://github.com/min1336/blog)
> 배포 워크플로우: [deploy.yml](https://github.com/min1336/blog/blob/main/.github/workflows/deploy.yml)
