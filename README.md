<div align="center">

# 🌤️ 몇 도야? (myeotdoya)

**내 옷장에서 오늘의 날씨를, 오늘의 옷차림으로.**  
** 매일 아침 5분을 당신께 돌려드립니다.**  

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet-D97706?logo=anthropic&logoColor=white)](https://anthropic.com/)
[![OpenWeather](https://img.shields.io/badge/OpenWeather-API-EB6E4B?logo=openweathermap&logoColor=white)](https://openweathermap.org/)

</div>

<br/>

## 📖 소개

**몇 도야?** 는 내 옷장 사진을 AI가 분석하고, 오늘의 날씨·외출 목적·퍼스널 컬러에 맞는 코디를 추천해주는 웹앱입니다.

"오늘 뭐 입지?"를 고민하는 5분을 돌려드립니다.

<br/>

## ✨ 주요 기능

<table>
  <tr>
    <td>🌡️ <b>스마트 날씨 감지</b></td>
    <td>GPS 자동 감지 · 도시명 검색 · 수동 온도 입력 중 선택</td>
  </tr>
  <tr>
    <td>👗 <b>AI 옷장 분석</b></td>
    <td>사진 한 장 업로드 → Claude AI가 카테고리·색상·스타일·소재·계절 자동 분석</td>
  </tr>
  <tr>
    <td>🤖 <b>맞춤 코디 추천</b></td>
    <td>날씨 × 활동 × 퍼스널컬러 × 스타일 선호를 종합해 내 옷장에서 코디 선택</td>
  </tr>
  <tr>
    <td>💬 <b>스타일리스트 코멘트</b></td>
    <td>날씨 / 활동 / 퍼스널컬러 / 스타일 선호 — 4가지 관점으로 선택 이유 설명</td>
  </tr>
</table>

<br/>

## 🛠️ 기술 스택

| 분야 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Storage + Auth) |
| AI | Claude Sonnet `claude-sonnet-4-6` |
| 날씨 | OpenWeather API v2.5 |
| 인증 | Google OAuth via Supabase Auth |
| 폰트 | Pretendard Variable |

<br/>

## 🚀 시작하기

### 1. 저장소 클론 및 패키지 설치

```bash
git clone https://github.com/young017/weather.git
cd weather
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채워주세요.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenWeather
OPENWEATHER_API_KEY=

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. 개발 서버 실행

```bash
npm run dev   # http://localhost:3000
```

<br/>

## 🗺️ 서비스 흐름

```
첫 방문
  → Google 로그인
  → 온보딩 (퍼스널컬러 · 성별 · 선호 스타일 설정)

매일 사용
  → 날씨 확인 (GPS / 도시명 / 수동 입력)
  → 오늘의 활동 선택
      일상  |  출근  |  포멀  |  운동  |  데이트  |  나이트아웃
  → AI 코디 추천 결과 확인
  → 스타일리스트 코멘트 & 스타일링 팁
```

<br/>

## 🤖 추천 알고리즘

단순 필터링이 아닌 5단계 파이프라인으로 코디를 선택합니다.

```
내 옷장 전체
    │
    ▼
① 날씨 필터      체감 온도 기반 계절 태그 (봄/여름/가을/겨울/사계절)
    │
    ▼
② 활동 필터      활동별 허용 스타일만 통과 (없으면 날씨 필터 결과로 fallback)
    │
    ▼
③ 스타일 정렬    활동의 대표 스타일 아이템을 상위로
    │
    ▼
④ 퍼스널컬러 정렬  내 퍼스널컬러 추천 색상과 매칭되는 아이템을 상위로
    │
    ▼
⑤ Claude AI      상위 20개 중 최적 조합 선택 + 코멘트 생성
```

> 포멀·오피스 활동은 여름(23°C↑)에도 슬랙스 등 봄·가을 아이템을 허용하는 예외 처리가 포함되어 있습니다.

<br/>

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 홈 (날씨 + 활동 선택)
│   ├── onboarding/               # 첫 방문 프로필 설정
│   ├── wardrobe/                 # 옷장 갤러리 · 추가 · 수정
│   ├── result/                   # 코디 추천 결과
│   ├── settings/                 # 프로필 편집
│   └── api/
│       ├── weather/              # OpenWeather 프록시
│       ├── wardrobe/             # 옷장 CRUD + AI 분석
│       └── recommend/            # 추천 엔진
├── components/
│   └── TopNav.tsx
├── lib/
│   ├── constants.ts              # 스타일·활동·퍼스널컬러 상수 중앙 관리
│   └── supabase/
└── types/
    └── index.ts
```

<br/>

---

<div align="center">

Made with ☀️ by [young017](https://github.com/young017)

</div>
