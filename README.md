<div align="center">

# 🌤️ 몇 도야? (myeotdoya)

**내 옷장에서 오늘의 날씨를, 오늘의 옷차림으로.**  
매일 아침 5분을 당신께 돌려드립니다.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet-D97706?logo=anthropic&logoColor=white)](https://anthropic.com/)

</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🌡️ **날씨 감지** | GPS 자동 감지 · 도시명 검색 · 수동 온도 입력 |
| 👗 **AI 옷장 분석** | 사진 한 장으로 카테고리·색상·스타일·소재 자동 분석 |
| 🤖 **AI 코디 추천** | 날씨 + 활동 + 퍼스널컬러 + 스타일 선호를 종합한 맞춤 코디 |
| 💬 **스타일리스트 코멘트** | 선택 이유를 4가지 관점으로 설명 |

---

## 🛠️ 기술 스택

- **Frontend** — Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend / DB** — Supabase (PostgreSQL + Storage + Auth)
- **AI** — Claude Sonnet (`claude-sonnet-4-6`) — 의류 분석 & 코디 추천
- **날씨** — OpenWeather API
- **인증** — Google OAuth (Supabase Auth)

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/young017/weather.git
cd weather
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력하세요.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENWEATHER_API_KEY=
ANTHROPIC_API_KEY=
```

### 3. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

---

## 📱 화면 구성

```
/ (홈)         날씨 확인 + 활동 선택 + 추천 요청
/onboarding    퍼스널컬러 · 성별 · 스타일 선호 설정
/wardrobe      내 옷장 갤러리
/wardrobe/add  옷 사진 업로드 + AI 자동 분석
/result        AI 코디 추천 결과 + 스타일리스트 코멘트
/settings      프로필 편집
```

---

<div align="center">

Made with ☀️ by [young017](https://github.com/young017)

</div>
