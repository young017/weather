# 몇 도야? (myeotdoya)

내 옷장에서 오늘의 날씨를, 오늘의 옷차림으로.  
매일 아침 5분을 당신께 돌려드립니다.

> 날씨 기반 AI 옷차림 추천 웹
> 작성일: 2026-06-10

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [환경 변수](#4-환경-변수)
5. [타입 시스템](#5-타입-시스템)
6. [데이터베이스 스키마 (Supabase)](#6-데이터베이스-스키마-supabase)
7. [상수 & 설정 (constants.ts)](#7-상수--설정-constantsts)
8. [인증 흐름](#8-인증-흐름)
9. [페이지별 상세 설명](#9-페이지별-상세-설명)
   - [홈 페이지 (/)](#91-홈-페이지-)
   - [온보딩 (/onboarding)](#92-온보딩-onboarding)
   - [설정 (/settings)](#93-설정-settings)
   - [옷장 갤러리 (/wardrobe)](#94-옷장-갤러리-wardrobe)
   - [옷 추가 (/wardrobe/add)](#95-옷-추가-wardrobeadd)
   - [옷 수정 (/wardrobe/edit/[id])](#96-옷-수정-wardrobeeditid)
   - [결과 페이지 (/result)](#97-결과-페이지-result)
10. [API 라우트 상세](#10-api-라우트-상세)
    - [GET /api/weather](#101-get-apiweather)
    - [GET|POST|PATCH|DELETE /api/wardrobe](#102-getpostpatchdelete-apiwardrobe)
    - [POST /api/wardrobe/analyze](#103-post-apiwardrobeanalyze)
    - [POST /api/recommend](#104-post-apirecommend)
11. [추천 알고리즘 상세](#11-추천-알고리즘-상세)
12. [공유 컴포넌트](#12-공유-컴포넌트)
13. [스타일링 & 디자인 시스템](#13-스타일링--디자인-시스템)
14. [데이터 흐름 전체 시나리오](#14-데이터-흐름-전체-시나리오)
15. [주요 비즈니스 로직 정리](#15-주요-비즈니스-로직-정리)

---

## 1. 프로젝트 개요

**앱 이름:** 몇 도야? (`myeotdoya`)

**핵심 가치 제안:**  
사용자가 등록한 자신의 옷장 사진을 기반으로, 오늘의 날씨 + 외출 목적 + 퍼스널 컬러를 조합해 Claude AI가 최적의 코디를 추천해주는 서비스.

**주요 기능 4가지:**
1. **날씨 감지** — GPS 자동 감지 또는 도시명/수동 온도 입력
2. **옷장 관리** — 옷 사진 업로드 → Claude AI 자동 분석(카테고리, 색상, 스타일 등)
3. **AI 코디 추천** — Claude Sonnet이 날씨·활동·퍼스널컬러·스타일 선호를 종합해 코디 조합 선택
4. **스타일리스트 코멘트** — 선택 이유를 4개 관점(날씨/활동/퍼스널컬러/스타일)으로 설명

---

## 2. 기술 스택

| 분야 | 기술 | 버전 | 역할 |
|------|------|------|------|
| 프레임워크 | Next.js | 15.3.3 | App Router, SSR/CSR 혼합 |
| UI 라이브러리 | React | 19.0.0 | 컴포넌트 기반 UI |
| 언어 | TypeScript | 5.x | 타입 안전성 |
| 스타일링 | Tailwind CSS | 3.4.17 | 유틸리티 퍼스트 CSS |
| 백엔드/DB | Supabase | 2.50.0 | PostgreSQL + 스토리지 + Auth |
| AI (코디 추천) | Claude (Anthropic SDK) | 0.52.0 | `claude-sonnet-4-6` 모델 |
| 날씨 데이터 | OpenWeather API | v2.5 | 실시간 날씨 정보 |
| 폰트 | Pretendard | CDN | 한국어 최적화 산세리프 |

**패키지 스크립트:**
```bash
npm run dev    # 개발 서버 (localhost:3000)
npm run build  # 프로덕션 빌드
npm run start  # 프로덕션 서버
npm run lint   # ESLint 검사
```

---

## 3. 디렉토리 구조

```
weather/   # 프로젝트 루트
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃 (메타데이터, PWA, 폰트)
│   │   ├── page.tsx                  # 홈 페이지 — 날씨 입력 + 활동 선택
│   │   ├── globals.css               # 전역 스타일 (Tailwind + 커스텀 클래스)
│   │   │
│   │   ├── api/                      # Next.js Route Handlers (서버 사이드)
│   │   │   ├── weather/
│   │   │   │   └── route.ts          # OpenWeather API 프록시
│   │   │   ├── wardrobe/
│   │   │   │   ├── route.ts          # 옷장 CRUD (GET/POST/PATCH/DELETE)
│   │   │   │   └── analyze/
│   │   │   │       └── route.ts      # Claude AI 이미지 분석
│   │   │   └── recommend/
│   │   │       └── route.ts          # Claude AI 코디 추천 엔진
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth 콜백 처리
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx              # 5단계 프로필 설정 (첫 방문)
│   │   ├── settings/
│   │   │   └── page.tsx              # 프로필 편집
│   │   ├── wardrobe/
│   │   │   ├── page.tsx              # 옷장 갤러리
│   │   │   ├── add/
│   │   │   │   └── page.tsx          # 옷 추가 (이미지 업로드 + AI 분석)
│   │   │   └── edit/
│   │   │       └── [id]/
│   │   │           └── page.tsx      # 옷 수정
│   │   └── result/
│   │       └── page.tsx              # 코디 추천 결과 표시
│   │
│   ├── components/
│   │   └── TopNav.tsx                # 상단 내비게이션 바
│   │
│   ├── lib/
│   │   ├── constants.ts              # 앱 전체 상수/레이블/설정값 중앙 관리
│   │   └── supabase/
│   │       ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │       └── server.ts             # 서버용 Supabase 클라이언트 (쿠키 기반)
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript 타입 정의 전체
│   │
│   └── middleware.ts                 # Supabase 세션 갱신 미들웨어
│
├── next.config.ts                    # Next.js 설정 (이미지 허용 도메인)
├── tailwind.config.ts                # Tailwind 커스텀 색상/폰트/safelist
├── tsconfig.json                     # TypeScript 컴파일 설정
├── postcss.config.mjs                # PostCSS (Tailwind + Autoprefixer)
├── package.json                      # 의존성 & 스크립트
└── .env.example                      # 필요한 환경변수 목록
```

---

## 4. 환경 변수

`.env.local` 파일에 아래 변수들을 설정해야 앱이 동작한다.

```env
# Supabase 프로젝트 URL (공개 가능)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

# Supabase 익명 키 (공개 가능, RLS로 보호됨)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase 서비스 롤 키 (절대 클라이언트에 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenWeather API 키
OPENWEATHER_API_KEY=abc123...

# Anthropic API 키 (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5. 타입 시스템

**파일:** [src/types/index.ts](src/types/index.ts)

모든 핵심 타입이 단일 파일에 정의되어 있다.

### 열거형 타입 (Union Types)

```typescript
// 퍼스널 컬러 — 사계절 색상 타입
type PersonalColor = 'spring_warm' | 'summer_cool' | 'autumn_warm' | 'winter_cool'

// 성별
type Gender = 'male' | 'female' | 'neutral'

// 의류 카테고리
type Category = 'top' | 'bottom' | 'outer' | 'shoes' | 'accessory'

// 스타일 (12종)
type Style =
  | 'casual' | 'formal' | 'sporty' | 'street' | 'minimal' | 'vintage'
  | 'chic' | 'girly' | 'boyish' | 'classic' | 'romantic' | 'preppy'

// 계절
type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all_season'

// 외출 활동
type Activity = 'daily' | 'office' | 'formal' | 'active' | 'date' | 'nightout'
```

### 인터페이스

#### `Profile` — 사용자 프로필
```typescript
interface Profile {
  id: string              // Supabase user.id와 동일
  personal_color: PersonalColor
  gender: Gender
  liked_styles: string[]  // 최대 3개
  disliked_styles: string[] // 최대 3개
  created_at: string
}
```

#### `WardrobeItem` — 옷장 아이템
```typescript
interface WardrobeItem {
  id: string
  user_id: string
  image_url: string       // Supabase Storage 공개 URL
  category: Category
  colors: string[]        // 예: ['네이비', '화이트']
  style: Style[]          // 복수 스타일 가능
  material: string | null // 예: '면', '폴리에스터'
  season: Season[]        // 복수 계절 가능
  description: string | null
  created_at: string
  deleted_at: string | null  // null = 활성, 값 있음 = 소프트 삭제
}
```

#### `WeatherData` — 날씨 정보
```typescript
interface WeatherData {
  temp: number           // 실제 온도 (°C)
  feels_like: number     // 체감 온도 (필터링에 사용)
  weather_desc: string   // 한국어 날씨 설명 (예: '맑음')
  weather_icon: string   // OpenWeather 아이콘 코드
  weather_condition: string // 영어 조건 (예: 'Clear', 'Rain')
  humidity: number       // 습도 (%)
  wind_speed: number     // 풍속 (m/s)
  city: string           // 도시명
}
```

#### `ClothingAnalysis` — Claude AI 의류 분석 결과
```typescript
interface ClothingAnalysis {
  category: Category
  colors: string[]
  style: Style[]
  material: string | null
  season: Season[]
  description: string
}
```

#### `Recommendation` — 코디 추천 결과
```typescript
interface Recommendation {
  top: WardrobeItem | null
  bottom: WardrobeItem | null
  outer: WardrobeItem | null
  shoes: WardrobeItem | null
  accessories: WardrobeItem[]
  reason: string          // 4단락 추천 이유 (줄바꿈으로 구분)
  tips: string[]          // 스타일링 팁 배열
  usedFallback: boolean   // 스타일 필터 없이 날씨만으로 선택했는지
  missingCategories: Category[] // 옷장에 아예 없는 카테고리
  allMissing: boolean     // 추천 가능한 아이템이 전혀 없는 경우
}
```

---

## 6. 데이터베이스 스키마 (Supabase)

### 테이블: `profiles`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid (PK) | `auth.users.id`와 동일 |
| `personal_color` | text | PersonalColor 열거형 값 |
| `gender` | text | Gender 열거형 값 |
| `liked_styles` | text[] | 선호 스타일 배열 |
| `disliked_styles` | text[] | 기피 스타일 배열 |
| `created_at` | timestamptz | 생성 시각 |

### 테이블: `wardrobe`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid (PK) | 자동 생성 |
| `user_id` | uuid (FK) | profiles.id 참조 |
| `image_url` | text | Supabase Storage 공개 URL |
| `category` | text | Category 열거형 값 |
| `colors` | text[] | 색상 배열 |
| `style` | text[] | 스타일 배열 |
| `material` | text | 소재 |
| `season` | text[] | 계절 배열 |
| `description` | text | AI 생성 또는 사용자 수정 설명 |
| `created_at` | timestamptz | 생성 시각 |
| `deleted_at` | timestamptz | 소프트 삭제 시각 (null = 활성) |

### Supabase Storage: `wardrobe-images`

- **버킷:** `wardrobe-images` (공개 접근)
- **파일 경로 규칙:** `{user_id}/{timestamp}.{ext}`
- **허용 형식:** JPEG, PNG, WEBP

### Row Level Security (RLS)

모든 쿼리는 `user_id = auth.uid()` 조건으로 자신의 데이터만 접근 가능.  
API Route에서도 `supabase.auth.getUser()`로 인증 후 `.eq('user_id', user.id)` 조건을 명시한다.

---

## 7. 상수 & 설정 (constants.ts)

**파일:** [src/lib/constants.ts](src/lib/constants.ts)

앱 전체에서 공유하는 모든 레이블, 설정, 비즈니스 로직 상수가 여기에 집중되어 있다.

### 스타일 키워드 (`STYLE_KEYWORDS`)

12개 스타일 각각에 id, 한국어 레이블, 이모지, 설명을 정의한다.

```typescript
{ id: 'casual',   label: '캐주얼',  emoji: '👕', desc: '편하고 자연스러운' }
{ id: 'minimal',  label: '미니멀',  emoji: '⬜', desc: '심플하고 깔끔한' }
{ id: 'street',   label: '스트릿',  emoji: '🧢', desc: '트렌디하고 힙한' }
// ... 9개 더
```

### 퍼스널 컬러 (`PERSONAL_COLOR_*`)

**`PERSONAL_COLOR_LABELS`:** 각 컬러 타입의 한국어 이름

**`PERSONAL_COLOR_DESCRIPTIONS`:** 톤 특징 한 줄 설명

**`PERSONAL_COLOR_SWATCHES`:** UI 표시용 HEX 색상 (4개씩)
```
봄 웜톤:   ['#FF7F7F', '#FFAA80', '#FFF0CC', '#FFD700']
여름 쿨톤: ['#C9A0DC', '#FFB6C1', '#B0D4E8', '#C0C0C0']
가을 웜톤: ['#6B7C3D', '#8B5E3C', '#CC9900', '#556B2F']
겨울 쿨톤: ['#1A1A2E', '#1B3A6B', '#722F37', '#F5F5F5']
```

**`PERSONAL_COLOR_COLORS`:** 추천 알고리즘에서 색상 매칭에 사용하는 한국어 색상 이름 배열 (8개씩)
```
봄 웜톤:   ['코랄', '피치', '아이보리', '골드', '살구', '연노랑', '오렌지', '흰색']
여름 쿨톤: ['라벤더', '로즈', '파우더블루', '실버', '연보라', '민트', '핑크', '흰색']
가을 웜톤: ['카키', '브라운', '머스타드', '올리브', '테라코타', '베이지', '오트밀', '흰색']
겨울 쿨톤: ['블랙', '네이비', '버건디', '화이트', '다크그린', '로열블루', '그레이']
```

### 활동 설정 (`ACTIVITY_*`)

6개 활동 각각에 대해 다음을 정의한다:

| 상수 | 역할 |
|------|------|
| `ACTIVITY_LABELS` | 짧은 레이블 (예: '포멀') |
| `ACTIVITY_DESCRIPTIONS` | 설명 텍스트 (예: '면접, 비즈니스, 결혼식') |
| `ACTIVITY_DETAIL` | Claude 프롬프트에 넣는 상세 설명 |
| `ACTIVITY_ICONS` | 이모지 아이콘 |
| `ACTIVITY_ALLOWED_STYLES` | 해당 활동에 허용되는 스타일 목록 |

**활동별 허용 스타일 (핵심 비즈니스 로직):**

```
formal:   ['formal', 'classic', 'chic']
office:   ['formal', 'minimal', 'classic', 'preppy']
daily:    ['casual', 'street', 'minimal', 'vintage', 'boyish', 'chic', 'classic', 'preppy', 'romantic', 'girly']
active:   ['sporty']                  ← 운동할 때는 스포티만!
date:     ['romantic', 'girly', 'chic', 'minimal', 'casual']
nightout: ['romantic', 'chic', 'street', 'girly', 'formal']
```

### 기온별 의류 가이드 (`TEMP_GUIDE`)

8개 온도 구간별로 적합한 의류를 정의한다:

| 체감 온도 | 상의 | 하의 | 아우터 |
|-----------|------|------|--------|
| 28°C 이상 | 민소매, 반팔, 나시 | 반바지, 숏스커트 | 없음 |
| 23~27°C | 반팔, 얇은 셔츠 | 면바지, 반바지 | 없음 |
| 20~22°C | 긴팔, 얇은 니트 | 청바지, 면바지 | 얇은 가디건 |
| 17~19°C | 맨투맨, 니트 | 청바지, 슬랙스 | 가디건, 데님자켓 |
| 12~16°C | 두꺼운 니트 | 청바지, 슬랙스 | 자켓, 야상 |
| 9~11°C | 두꺼운 니트, 히트텍 | 두꺼운 슬랙스 | 트렌치코트 |
| 5~8°C | 히트텍, 두꺼운 니트 | 레깅스 | 코트, 가죽자켓 |
| 4°C 이하 | 히트텍, 기모 상의 | 기모 레깅스 | 패딩, 두꺼운 코트 |

### `buildWeatherGuide()` 함수

체감 온도 + 날씨 조건 + 풍속을 받아 Claude 프롬프트에 삽입할 텍스트를 생성한다.

```typescript
buildWeatherGuide(feelsLike: number, weatherCondition: string, windSpeed: number): string
```

- 기온 구간에 맞는 의류 가이드 텍스트 생성
- 비 조건(`rain`, `drizzle`, `thunderstorm`) → 방수 아이템 추가 안내
- 눈 조건(`snow`) → 방한·방수 아이템 추가 안내
- 강풍 (`windSpeed >= 8`) → 바람막이 아우터 우선 안내

---

## 8. 인증 흐름

**파일들:** [src/middleware.ts](src/middleware.ts), [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts), [src/lib/supabase/](src/lib/supabase/)

### 인증 방식

- **제공자:** Google OAuth (Supabase Auth 통해)
- **세션:** 쿠키 기반 (SSR 지원을 위해 `@supabase/ssr` 사용)

### 미들웨어 (`middleware.ts`)

모든 요청에서 실행. `supabase.auth.getUser()`를 호출해 세션 쿠키를 자동 갱신한다.  
정적 파일(`/_next/`, `/favicon.ico` 등)은 제외.

### OAuth 콜백 흐름 (`/auth/callback`)

```
Google 로그인 완료
    → /auth/callback?code=xxx
    → supabase.auth.exchangeCodeForSession(code)
    → profiles 테이블에서 user.id 조회
        → 없으면: /onboarding?step=color (신규 사용자)
        → 있으면: / (기존 사용자)
```

### 홈 페이지 인증 체크

```
페이지 로드
    → supabase.auth.getUser()
        → 미로그인 또는 익명: /onboarding으로 리다이렉트
        → profiles 없음: /onboarding?step=color으로 리다이렉트
        → 정상: authReady = true → 날씨 로딩 시작
```

### Supabase 클라이언트 두 종류

| 파일 | 사용 위치 | 생성 방법 |
|------|-----------|-----------|
| `client.ts` | `'use client'` 컴포넌트, 페이지 | `createBrowserClient()` |
| `server.ts` | API Route, Server Component | `createServerClient()` + Next.js cookies() |

---

## 9. 페이지별 상세 설명

### 9.1 홈 페이지 (`/`)

**파일:** [src/app/page.tsx](src/app/page.tsx)  
**렌더링:** 클라이언트 컴포넌트 (`'use client'`)

#### 역할
앱의 메인 진입점. 날씨 정보를 가져오고, 활동/아이템을 선택해 추천을 요청한다.

#### 주요 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `weather` | `WeatherData \| null` | 현재 날씨 정보 |
| `weatherLoading` | `boolean` | 날씨 로딩 중 여부 |
| `activity` | `Activity \| null` | 선택된 활동 |
| `coords` | `{lat, lon} \| null` | GPS 좌표 |
| `authReady` | `boolean` | 인증 완료 여부 |
| `wardrobeEmpty` | `boolean` | 옷장 비어 있는지 |
| `selectedItems` | `Category[]` | 선택된 카테고리 (기본: 전체 5개) |
| `isManualWeather` | `boolean` | 수동 입력 날씨인지 |
| `cityInput` | `string` | 도시명 입력값 |
| `manualTemp` | `string` | 수동 온도 입력값 |

#### 날씨 입력 3가지 방식

1. **GPS 자동 감지** — `navigator.geolocation.getCurrentPosition()`
2. **도시명 검색** — 한국어 입력 시 `KO_TO_EN` 매핑으로 영어로 변환 후 OpenWeather 호출
   ```
   KO_TO_EN: { 서울: 'Seoul', 부산: 'Busan', ... 31개 도시 }
   ```
3. **수동 직접 입력** — 온도 숫자 + 5가지 날씨 조건 버튼 선택
   ```
   맑음(Clear), 흐림(Clouds), 비(Rain), 눈(Snow), 강풍(Windy)
   각각에 humidity, wind_speed 기본값 매핑
   ```

#### 추천 버튼 활성 조건 (`canRecommend`)
```typescript
!!activity &&
!weatherLoading &&
(!!coords || !!cityQuery || isManualWeather) &&
selectedItems.length > 0 &&
!wardrobeEmpty
```

#### 결과 페이지 이동 방식
- GPS: `/result?activity=...&lat=...&lon=...&items=...`
- 도시: `/result?activity=...&city=...&items=...`
- 수동: `sessionStorage.setItem('manualWeather', JSON.stringify(weather))` 후 `/result?activity=...&manual=1&items=...`

#### UI 구성
- **날씨 바** (상단 고정): 도시명, 온도, 날씨 설명, 습도, 풍속 + 도시 변경/직접 입력 버튼
- **도시 입력 슬라이드**: CSS `grid-template-rows: 0fr → 1fr` 애니메이션
- **수동 입력 슬라이드**: 동일 방식 애니메이션
- **활동 그리드**: 3열 × 2행, 선택 시 흑백 반전
- **아이템 선택**: 활동 선택 시 슬라이드로 표시, 체크박스 UI
- **추천 버튼**: 조건 미충족 시 disabled + 안내 텍스트

---

### 9.2 온보딩 (`/onboarding`)

**파일:** [src/app/onboarding/page.tsx](src/app/onboarding/page.tsx)  
**렌더링:** 클라이언트 컴포넌트

#### 5단계 흐름

```
step 0: intro    → 앱 소개 + Google 로그인 버튼
step 1: gender   → 남성 / 여성 / 무관 선택
step 2: color    → 퍼스널 컬러 4가지 선택 (컬러 스와치 UI)
step 3: like     → 좋아하는 스타일 최대 3개 선택
step 4: dislike  → 싫어하는 스타일 최대 3개 선택
                   ↓ 저장 후 / 로 이동
```

#### URL 파라미터
- `/onboarding` → step 0 (intro)
- `/onboarding?step=color` → step 2 (신규 사용자 OAuth 후 이미 로그인된 경우)
- `/onboarding?step=gender` → step 1

#### Supabase 저장
step 4 완료 시 `profiles` 테이블에 `upsert`:
```typescript
supabase.from('profiles').upsert({
  id: user.id,
  personal_color: selectedColor,
  gender: selectedGender,
  liked_styles: likedStyles,
  disliked_styles: dislikedStyles,
})
```

#### UI 특징
- 상단 프로그레스 바 (총 4단계)
- 스타일 선택: 12개 카드, 이모지 + 레이블 + 설명
- 좋아요/싫어요 상호 배타적: 같은 스타일 중복 선택 불가
- 뒤로가기 버튼으로 이전 단계 복귀 가능

---

### 9.3 설정 (`/settings`)

**파일:** [src/app/settings/page.tsx](src/app/settings/page.tsx)  
**렌더링:** 클라이언트 컴포넌트

#### 기능
- 기존 프로필 불러오기
- 퍼스널 컬러, 성별, 좋아하는/싫어하는 스타일 수정
- 변경 감지 (`hasChanged` 상태): 변경이 없으면 저장 버튼 비활성
- 로그아웃 버튼

#### 저장 로직
```typescript
supabase.from('profiles').update({
  personal_color, gender, liked_styles, disliked_styles
}).eq('id', user.id)
```

#### 유효성 검사
- 좋아요/싫어요 최대 3개
- 같은 스타일이 좋아요/싫어요 동시 선택 불가

---

### 9.4 옷장 갤러리 (`/wardrobe`)

**파일:** [src/app/wardrobe/page.tsx](src/app/wardrobe/page.tsx)  
**렌더링:** 클라이언트 컴포넌트

#### 기능
1. `/api/wardrobe` GET으로 아이템 목록 로드
2. 카테고리 필터 버튼 (전체/상의/하의/아우터/신발/액세서리)
3. 5열 그리드 레이아웃으로 썸네일 표시
4. 아이템 클릭 시 모달:
   - 이미지 표시 (Next.js `<Image>`)
   - 색상, 카테고리, 계절, 스타일, 소재, 설명 표시
   - 수정 버튼 → `/wardrobe/edit/[id]`
   - 삭제 버튼 → DELETE API (소프트 삭제)
5. 상단 "추가" 버튼 → `/wardrobe/add`

#### 소프트 삭제
```typescript
// 실제 레코드 삭제가 아니라 deleted_at 필드를 설정
supabase.from('wardrobe')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id).eq('user_id', user.id)
```
조회 시 항상 `.is('deleted_at', null)` 조건 포함.

---

### 9.5 옷 추가 (`/wardrobe/add`)

**파일:** [src/app/wardrobe/add/page.tsx](src/app/wardrobe/add/page.tsx)  
**렌더링:** 클라이언트 컴포넌트

#### 전체 흐름

```
① 이미지 파일 선택 (JPEG/PNG/WEBP)
    ↓
② 미리보기 표시
    ↓
③ "AI 분석" 버튼 → POST /api/wardrobe/analyze
    ↓
④ Claude AI 반환값으로 폼 자동 채우기
   (category, colors[], style[], material, season[], description)
    ↓
⑤ 사용자가 필요시 수동으로 각 필드 수정
    ↓
⑥ "저장" 버튼 → POST /api/wardrobe (이미지 + 분석 결과)
    ↓
⑦ /wardrobe 로 이동
```

#### 편집 가능 필드
- **카테고리**: 단일 선택 (5가지)
- **색상**: 자유 텍스트 (AI 반환값 수동 수정 가능)
- **스타일**: 복수 선택 (12가지)
- **계절**: 복수 선택 (봄/여름/가을/겨울/사계절)
- **소재**: 자유 텍스트
- **설명**: 자유 텍스트

---

### 9.6 옷 수정 (`/wardrobe/edit/[id]`)

**파일:** [src/app/wardrobe/edit/[id]/page.tsx](src/app/wardrobe/edit/[id]/page.tsx)  
**렌더링:** 클라이언트 컴포넌트

#### 기능
- URL의 `[id]`로 특정 아이템 조회
- 이미지는 변경 불가 (표시만)
- 카테고리, 스타일(최소 1개), 계절(최소 1개), 설명 수정 가능
- PATCH `/api/wardrobe`로 저장

---

### 9.7 결과 페이지 (`/result`)

**파일:** [src/app/result/page.tsx](src/app/result/page.tsx)  
**렌더링:** 클라이언트 컴포넌트 (Suspense 래핑)

#### URL 파라미터
```
?activity=daily&lat=37.5&lon=127.0&items=top,bottom,shoes
?activity=formal&city=Seoul&items=top,bottom,outer,shoes
?activity=date&manual=1&items=top,bottom,outer,shoes,accessory
```

#### 로딩 순서
1. URL 파라미터에서 날씨 정보 취득:
   - `manual=1` → `sessionStorage.getItem('manualWeather')`
   - `city=` → `GET /api/weather?city=...`
   - `lat/lon` → `GET /api/weather?lat=...&lon=...`
2. `POST /api/recommend` 호출 (weather + activity + selectedItems)
3. 결과 렌더링

#### 2컬럼 레이아웃
```
┌─────────────────────┬─────────────────────┐
│    추천 코디 목록    │   스타일리스트       │
│                     │   코멘트             │
│  [상의] 이미지      │                     │
│  [하의] 이미지      │  날씨 기반 —        │
│  [아우터] 이미지    │  외출 목적 —        │
│  [신발] 이미지      │  퍼스널 컬러 —      │
│  [액세서리] 이미지  │  스타일 선호도 —    │
│                     │                     │
│                     │  스타일링 팁         │
│                     │  — 팁1              │
│                     │  — 팁2              │
└─────────────────────┴─────────────────────┘
```

#### `OutfitRow` 컴포넌트
아이템이 있을 때와 없을 때를 구분해 표시한다.

**아이템 있음:** 이미지 + 카테고리 태그 + 설명/색상 + 색상 태그들

**아이템 없음 (2가지 상태):**
- **missing (옷장에 없음):** 빨간 점선 박스 + 빨간 메시지 ("상의부터 채워볼까요 👕")
- **optional (선택했지만 매칭 없음):** 주황색 점선 박스 + 주황색 메시지 ("오늘은 아우터 없이도 충분해요 🙆")

#### 스타일리스트 코멘트 파싱
`reason` 필드는 `\n`으로 구분된 4단락:
```
날씨 기반 — 오늘 체감온도는 ...
외출 목적 — 포멀한 자리이므로 ...
퍼스널 컬러 — 봄 웜톤에 맞는 ...
스타일 선호도 — 캐주얼 스타일을 반영하여 ...
```
각 단락을 ` — `으로 분리해 레이블과 내용을 따로 렌더링. 내용은 `. `으로 문장 분리해 단락마다 표시.

---

## 10. API 라우트 상세

### 10.1 `GET /api/weather`

**파일:** [src/app/api/weather/route.ts](src/app/api/weather/route.ts)

**쿼리 파라미터:**
- `?lat=37.5&lon=127.0` — 좌표 기반 조회
- `?city=Seoul` — 도시명 기반 조회

**OpenWeather API 호출:**
```
https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}&lon={lon}
  &units=metric
  &lang=kr
  &appid={OPENWEATHER_API_KEY}
```

**반환 형식 (`WeatherData`):**
```json
{
  "temp": 18,
  "feels_like": 16,
  "weather_desc": "맑음",
  "weather_icon": "01d",
  "weather_condition": "Clear",
  "humidity": 45,
  "wind_speed": 3.2,
  "city": "Seoul"
}
```

---

### 10.2 `GET|POST|PATCH|DELETE /api/wardrobe`

**파일:** [src/app/api/wardrobe/route.ts](src/app/api/wardrobe/route.ts)

#### GET — 옷장 목록 조회
인증된 사용자의 삭제되지 않은 아이템을 최신순으로 반환.
```typescript
.select('*').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false })
```

#### POST — 옷 추가
`multipart/form-data` 수신:
- `image`: 파일 객체
- `analysis`: JSON 문자열 (ClothingAnalysis)

처리 순서:
1. `wardrobe-images` 버킷에 업로드 (`{user_id}/{timestamp}.{ext}`)
2. 공개 URL 획득
3. `wardrobe` 테이블에 INSERT

#### PATCH — 옷 수정
```json
{ "id": "uuid", "category": "top", "style": ["casual"], "season": ["spring"], "description": "..." }
```

#### DELETE — 소프트 삭제
```json
{ "id": "uuid" }
```
`deleted_at` 필드를 현재 시각으로 UPDATE (레코드 실제 삭제 안 함).

---

### 10.3 `POST /api/wardrobe/analyze`

**파일:** [src/app/api/wardrobe/analyze/route.ts](src/app/api/wardrobe/analyze/route.ts)

**입력:** `multipart/form-data` — `image` 필드에 이미지 파일

**처리:**
1. 이미지 파일을 Buffer로 변환 → Base64 인코딩
2. Claude `claude-sonnet-4-6` 모델에 멀티모달 메시지 전송:
   ```
   이 옷의 카테고리, 색상, 스타일, 소재, 계절을 분석해주세요.
   JSON으로만 응답하세요: { category, colors[], style[], material, season[], description }
   ```
3. 반환된 JSON 파싱 후 `ClothingAnalysis` 형식으로 응답

**반환 예시:**
```json
{
  "category": "top",
  "colors": ["네이비", "흰색"],
  "style": ["casual", "minimal"],
  "material": "면",
  "season": ["spring", "autumn", "all_season"],
  "description": "네이비 스트라이프 반팔 티셔츠"
}
```

---

### 10.4 `POST /api/recommend`

**파일:** [src/app/api/recommend/route.ts](src/app/api/recommend/route.ts)

**입력:**
```typescript
{
  weather: WeatherData,
  activity: Activity,
  selectedItems?: Category[]  // 기본값: 전체 5개
}
```

**처리 파이프라인 (상세는 섹션 11 참조):**
```
1. 인증 확인 + 프로필 로드 + 옷장 전체 로드
2. 날씨 필터 (계절 태그 기반)
3. 스타일 필터 (활동별 허용 스타일)
4. 정렬 (활동 우선 스타일 → 퍼스널 컬러 매칭)
5. 선택 카테고리로 필터 + 상위 20개 추출
6. Claude 프롬프트 구성 + API 호출
7. 반환된 인덱스로 실제 WardrobeItem 객체 조합
```

**반환 형식 (`Recommendation`):**
```json
{
  "top": { ...WardrobeItem },
  "bottom": { ...WardrobeItem },
  "outer": null,
  "shoes": { ...WardrobeItem },
  "accessories": [],
  "reason": "날씨 기반 — ...\n외출 목적 — ...\n퍼스널 컬러 — ...\n스타일 선호도 — ...",
  "tips": ["팁1", "팁2"],
  "usedFallback": false,
  "missingCategories": [],
  "allMissing": false
}
```

---

## 11. 추천 알고리즘 상세

**파일:** [src/app/api/recommend/route.ts](src/app/api/recommend/route.ts) 함수들

### 전체 파이프라인

```
옷장 전체 아이템
    ↓
① filterByWeather()      — 체감 온도 기반 계절 태그 필터
    ↓
② filterByStyle()        — 활동별 허용 스타일 필터
  (스타일 매칭 0개이면 ① 결과로 fallback)
    ↓
③ sortByStylePriority()  — 활동의 첫 번째 허용 스타일 우선 정렬
    ↓
④ sortByPersonalColor()  — 퍼스널 컬러 매칭 아이템 우선 정렬
    ↓
⑤ 선택된 카테고리 필터 + slice(0, 20)
    ↓
⑥ Claude API 호출 → 인덱스 반환
    ↓
⑦ 인덱스로 실제 WardrobeItem 매핑
```

### ① `filterByWeather(items, feelsLike, activity)`

체감 온도 기준으로 허용 계절 태그 결정:

```typescript
if (feelsLike >= 23) {
  // 포멀/오피스: 여름에도 봄·가을 아이템(슬랙스 등) 허용
  allowed = (activity === 'formal' || activity === 'office')
    ? ['summer', 'spring', 'autumn', 'all_season']
    : ['summer', 'all_season']
} else if (feelsLike >= 10) {
  allowed = ['spring', 'autumn', 'all_season']
} else {
  allowed = ['winter', 'all_season']
}
```

아이템의 `season` 배열 중 하나라도 `allowed`에 포함되면 통과.

### ② `filterByStyle(items, activity)`

`ACTIVITY_ALLOWED_STYLES[activity]` 목록에 포함된 스타일을 가진 아이템만 통과.

**Fallback 로직:**  
스타일 필터 결과가 0개면 날씨 필터만 통과한 아이템을 사용.  
`usedFallback = true`로 설정하고 Claude에게 알림.

### ③ `sortByStylePriority(items, activity)`

각 활동의 `ACTIVITY_ALLOWED_STYLES[activity][0]` (첫 번째 스타일)을 가진 아이템을 앞으로 정렬.

예: `formal` 활동 → `formal` 스타일 아이템 우선.

### ④ `sortByPersonalColor(items, personalColor)`

`PERSONAL_COLOR_COLORS[personalColor]` 색상 배열과 아이템의 `colors` 배열을 부분 문자열 매칭:

```typescript
preferred.some(p => c.toLowerCase().includes(p) || p.includes(c.toLowerCase()))
```

매칭되는 아이템을 앞으로 정렬.

### ⑤ 상위 20개 선택

선택된 카테고리로 필터 후 `.slice(0, 20)`.  
Claude에게 넘기는 컨텍스트 크기 제한.

### ⑥ Claude 프롬프트 구조

```
당신은 패션 스타일리스트입니다.

[날씨 정보]
- 기온: 18°C (체감 16°C)
- 날씨: 맑음
- 습도: 45%
- 풍속: 3.2m/s

[기온별 추천 — 체감 16°C]
- 상의: 긴팔, 얇은 니트, 셔츠
- 하의: 청바지, 면바지, 슬랙스
- 아우터: 얇은 가디건
- 신발: 스니커즈, 로퍼, 플랫슈즈
- 액세서리: 없음

[오늘 활동]
데일리 — 친구 만남, 나들이 등 편안한 일상 외출. 특별한 드레스코드 없음.

[퍼스널 컬러]
봄 웜톤 (코랄, 피치, 아이보리, 골드 계열)

[성별]
여성

[스타일 선호도]
- 좋아하는 스타일: casual, minimal
- 절대 피해야 할 스타일: formal, sporty

[추천 요청 아이템: 상의, 하의, 신발]

[내 옷장 (12개)]
1. [top] 화이트+베이지 | casual+minimal | spring+autumn | 베이지 스트라이프 면 셔츠
2. [bottom] 네이비 | minimal | all_season | 와이드 데님 팬츠
...

JSON만 출력하세요:
{
  "top_index": 숫자,
  "bottom_index": 숫자,
  "outer_index": null,
  "shoes_index": 숫자,
  "accessory_indices": [],
  "reason": "날씨 기반 — ...\n외출 목적 — ...\n퍼스널 컬러 — ...\n스타일 선호도 — ...",
  "tips": ["팁1", "팁2"]
}
```

### ⑦ 인덱스 → WardrobeItem 변환

Claude가 1-based 인덱스를 반환하므로:
```typescript
topItems[result.top_index - 1]
```

---

## 12. 공유 컴포넌트

### `TopNav` ([src/components/TopNav.tsx](src/components/TopNav.tsx))

모든 일반 페이지 상단에 표시되는 네비게이션 바.

```
┌────────────────────────────────────────────┐
│  몇 도야?      홈  |  내 옷장  |  설정      │
└────────────────────────────────────────────┘
```

- `usePathname()`으로 현재 경로 감지
- 활성 라우트는 `text-accent` (초록색) 강조
- 스티키 포지션, 하단 검은 테두리 (`border-b-2 border-black`)

---

## 13. 스타일링 & 디자인 시스템

**파일들:** [tailwind.config.ts](tailwind.config.ts), [src/app/globals.css](src/app/globals.css)

### 커스텀 색상

| 이름 | HEX | 용도 |
|------|-----|------|
| `accent` | `#03C75A` | 주요 CTA 버튼, 활성 탭, 강조 텍스트 (초록) |
| `point` | `#7C3AED` | 보조 강조, "직접 입력" 뱃지 (보라) |

### 폰트

- **Primary:** Pretendard Variable (CDN)
- **Fallback:** -apple-system, Noto Sans KR, sans-serif
- **Base size:** 18px (rem 기준)

### 글로벌 커스텀 클래스 (`globals.css`)

```css
.btn-primary     /* 검은 배경, 흰 텍스트, hover 시 #333 */
.btn-secondary   /* 흰 배경, 검은 테두리, hover 시 배경 검게 */
.btn-point       /* point(보라) 배경 버튼 */
.card            /* 흰 배경, 회색 테두리, rounded-2xl, shadow-sm */
.page-container  /* min-h-screen flex flex-col bg-white */
.page-header     /* sticky 헤더 기본 스타일 */
```

### Tailwind Safelist

동적으로 생성되는 색상 클래스가 빌드 시 제거되지 않도록:
```typescript
safelist: [
  'border-red-200', 'bg-red-50', 'text-red-500', 'bg-red-100',
  'border-amber-200', 'bg-amber-50', 'text-amber-600', 'bg-amber-100',
]
```
(결과 페이지의 missing/optional 아이템 색상 코딩)

### Next.js 이미지 설정 (`next.config.ts`)

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co' },    // 옷장 이미지
    { protocol: 'https', hostname: 'openweathermap.org' }, // 날씨 아이콘
  ]
}
```

---

## 14. 데이터 흐름 전체 시나리오

### 시나리오 1: 신규 사용자 첫 방문

```
브라우저 → /
    → middleware.ts: 세션 없음
    → page.tsx: supabase.auth.getUser() → null
    → router.replace('/onboarding')
    → /onboarding 로드
    → Google 로그인 버튼 클릭
    → Google OAuth → /auth/callback?code=xxx
    → auth/callback/route.ts:
        exchangeCodeForSession(code)
        profiles 조회 → 없음
    → /onboarding?step=color 으로 리다이렉트
    → 온보딩 step 2 (color)부터 시작
    → gender → color → like → dislike 설정
    → profiles.upsert()
    → / 로 이동
```

### 시나리오 2: 코디 추천 전체 흐름

```
/ (홈)
    → GPS 권한 허용
    → navigator.geolocation.getCurrentPosition()
    → GET /api/weather?lat=...&lon=...
    → weather 상태 업데이트
    → 활동 "데일리" 선택
    → 아이템 전체 선택 확인
    → "추천 받기" 버튼 클릭
    → router.push('/result?activity=daily&lat=...&lon=...&items=top,bottom,outer,shoes,accessory')

/result
    → GET /api/weather?lat=...&lon=... (재요청)
    → POST /api/recommend
        body: { weather, activity: 'daily', selectedItems: ['top','bottom','outer','shoes','accessory'] }
        
        서버:
        1. 프로필 로드 (personal_color: 'spring_warm', liked_styles: ['casual','minimal'])
        2. 옷장 전체 로드 (예: 25개)
        3. filterByWeather(feelsLike=16) → ['spring', 'autumn', 'all_season'] → 18개
        4. filterByStyle('daily') → casual+street+minimal+... → 15개
        5. sortByStylePriority('daily') → casual 아이템 상위 정렬
        6. sortByPersonalColor('spring_warm') → 코랄/피치/아이보리 색상 상위
        7. 상위 20개 → 실제론 15개
        8. Claude 프롬프트 구성 + API 호출
        9. { top_index:3, bottom_index:7, outer_index:null, shoes_index:12, accessory_indices:[] }
        10. 실제 WardrobeItem으로 변환
        
    → Recommendation 상태 업데이트
    → 2컬럼 레이아웃 렌더링
```

### 시나리오 3: 옷 추가

```
/wardrobe/add
    → 이미지 파일 선택
    → 미리보기 표시
    → "AI 분석" 클릭
    → POST /api/wardrobe/analyze
        body: FormData { image: File }
        
        서버:
        1. 이미지 → ArrayBuffer → Base64
        2. Claude claude-sonnet-4-6 멀티모달 호출
        3. JSON 파싱 → ClothingAnalysis 반환
        
    → 폼 자동 채우기
    → 사용자 필요시 수정
    → "저장" 클릭
    → POST /api/wardrobe
        body: FormData { image: File, analysis: JSON 문자열 }
        
        서버:
        1. wardrobe-images 버킷 업로드
        2. 공개 URL 획득
        3. wardrobe 테이블 INSERT
        
    → /wardrobe 로 이동
```

---

## 15. 주요 비즈니스 로직 정리

### 퍼스널 컬러 활용

퍼스널 컬러는 두 곳에서 활용된다:

1. **추천 정렬** (`sortByPersonalColor`): 옷장 아이템의 `colors` 필드와 퍼스널 컬러 추천 색상 목록을 부분 문자열 매칭으로 비교. 매칭 아이템이 우선 노출.

2. **Claude 프롬프트**: 퍼스널 컬러 이름 + 대표 색상 4개를 프롬프트에 포함하여 Claude가 최종 선택 시 색상 조화를 고려하도록 유도.

### 스타일 선호도 활용

좋아하는 스타일과 싫어하는 스타일 모두 Claude 프롬프트에 포함:

```
[스타일 선호도]
- 좋아하는 스타일: casual, minimal
- 절대 피해야 할 스타일: formal, sporty
```

Claude에게 "절대 피해야 할 스타일은 반드시 제외하세요" 지시. 단, 사전 필터링은 활동 기반 `ACTIVITY_ALLOWED_STYLES`로만 하고, 개인 선호는 Claude에게 위임.

### 포멀/오피스 예외 처리

여름(23°C 이상)에도 포멀·오피스 활동은 봄·가을 아이템(슬랙스, 트라우저 등)을 허용:
```typescript
if (feelsLike >= 23) {
  allowed = (activity === 'formal' || activity === 'office')
    ? ['summer', 'spring', 'autumn', 'all_season']  // 예외
    : ['summer', 'all_season']
}
```
격식 자리에서 반바지는 부적절하므로 여름이어도 정장 바지를 선택할 수 있게 한 것.

### 스타일 필터 Fallback

활동에 맞는 스타일 아이템이 없을 경우 날씨 필터만 통과한 아이템을 사용하고 `usedFallback = true` 설정. 결과 화면에서 "비슷한 스타일로 ✨" 뱃지로 사용자에게 안내.

### Missing Categories 계산

추천 요청 전에 미리 계산:
```typescript
const allWardrobeCategories = new Set(allItems.map(i => i.category))
const missingCategories = selectedItems.filter(cat => !allWardrobeCategories.has(cat))
```
옷장에 아예 없는 카테고리를 Claude API 호출 전에 파악. 결과 화면에서 "아이템 없음 (빨간색)" vs "매칭 없음 (주황색)"을 구분하는 데 사용.

### 수동 날씨 sessionStorage 전달

수동 입력 날씨는 URL에 넣기 어려운 복잡한 객체이므로 sessionStorage를 임시 채널로 사용:
```typescript
// 홈 페이지
sessionStorage.setItem('manualWeather', JSON.stringify(weather))
router.push(`/result?manual=1&...`)

// 결과 페이지
const stored = sessionStorage.getItem('manualWeather')
weatherData = JSON.parse(stored)
```
탭을 닫으면 자동 삭제되는 sessionStorage의 특성이 임시 상태 전달에 적합.

---

*이 문서는 2026-06-10 기준 전체 코드를 분석해 작성했습니다.*
