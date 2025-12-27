# K-DEVCON Slack Bot

K-DEVCON 커뮤니티를 위한 Slack 봇입니다. 다양한 기능을 제공하여 커뮤니티 활동을 지원합니다.

## 주요 기능

### 1. ChatGPT 연동
- 봇을 멘션(`@봇이름`)하면 ChatGPT가 답변합니다
- 스레드에서 대화를 이어갈 수 있습니다
- 특정 채널에서만 동작하도록 설정 가능합니다
- 사용 모델: GPT-4o

### 2. 메시지 아카이브
- 특정 채널의 메시지를 Firebase에 자동으로 아카이브합니다
- 날짜별로 메시지를 저장하여 나중에 조회할 수 있습니다

### 3. 출석 체크 시스템
- **매일 08시 자동 출석 체크**: 매일 한국시간 08시에 출석 체크 메시지를 자동으로 발송합니다
- **출석 기록 조회**: 개인의 출석 기록을 확인할 수 있습니다
- **랭킹 시스템**: 출석 순위를 확인할 수 있습니다
- **월간 리포트**: 매월 1일 전월 출석 통계를 발송합니다
- Firebase를 사용하여 출석 데이터를 저장합니다

### 4. 홈 탭
- Slack 홈 탭에 GitHub 저장소 링크를 표시합니다
- 사용자가 봇의 정보를 쉽게 확인할 수 있습니다

### 5. RSS 피드 처리 (GeekNews)
- IT 기술 블로그의 RSS 피드를 확인하고 슬랙 채널에 포스팅합니다
- 매일 한국시간 08시에 자동으로 실행됩니다
- 24시간 이내 발행된 글만 처리합니다

## 설치 및 설정

### 필수 패키지 설치
```bash
npm install
# 또는
pnpm install
```

### 환경 변수 설정
`.env` 파일을 생성하고 아래의 항목을 기입하세요:

```
# Slack Bot Configuration
HOLANG_BOT_TOKEN=          # Slack Bot Token
HOLANG_APP_TOKEN=          # Slack App Token (Socket Mode용)
GEEK_NEWS_HOOK_URL=        # GeekNews 슬랙 웹훅 URL

# OpenAI Configuration (ChatGPT 기능용)
OPENAI_API_KEY=            # OpenAI API Key

# MySQL Database Configuration (RSS 피드 DB 저장 기능용)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Post 엔티티에 필요한 ID (게시판, 작성자 데이터의 ID 값)
DB_CHANNEL_ID=
DB_REGISTER_ID=
```

## 추가 기능 : K-DEVCON 커뮤니티에 포스팅

mysql의 `Post` 엔티티에 IT 블로그 게시글을 발행 직접 입력

### 테스트
```bash
npm test
# 또는
node test-rss-db.js
```

### 실행 방법

#### 1. 서버 실행 (자동 스케줄 실행)
서버를 실행하면 매일 한국시간 08시(UTC 23시)에 자동으로 RSS 피드를 확인하고 DB에 저장합니다.

```bash
npm start
# 또는
node index.js
```

#### 2. 수동 실행 (즉시 실행)
RSS 피드를 즉시 처리하고 싶을 때:

```bash
npm run rss:process
# 또는
node -e "import('./app/hook/geeknews/geeknews.js').then(m => m.processRSSFeed())"
```

### 동작 방식
- 매일 한국시간 08시(UTC 23시)에 자동 실행
- RSS 피드에서 24시간 이내 발행된 글을 확인
- 중복 체크 후 DB에 저장 (본문은 `<div>` 태그로 감싸서 저장)
- 기존 슬랙 포스팅 기능도 함께 동작