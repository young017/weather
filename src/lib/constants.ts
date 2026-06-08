import type { PersonalColor, Activity, Category, Season, Style } from '@/types'

export const PERSONAL_COLOR_LABELS: Record<PersonalColor, string> = {
  spring_warm: '봄 웜톤',
  summer_cool: '여름 쿨톤',
  autumn_warm: '가을 웜톤',
  winter_cool: '겨울 쿨톤',
}

export const PERSONAL_COLOR_DESCRIPTIONS: Record<PersonalColor, string> = {
  spring_warm: '밝고 따뜻한 톤',
  summer_cool: '부드럽고 차가운 톤',
  autumn_warm: '깊고 따뜻한 톤',
  winter_cool: '선명하고 차가운 톤',
}

export const PERSONAL_COLOR_SWATCHES: Record<PersonalColor, string[]> = {
  spring_warm: ['#FF7F7F', '#FFAA80', '#FFF0CC', '#FFD700'],
  summer_cool: ['#C9A0DC', '#FFB6C1', '#B0D4E8', '#C0C0C0'],
  autumn_warm: ['#6B7C3D', '#8B5E3C', '#CC9900', '#556B2F'],
  winter_cool: ['#1A1A2E', '#1B3A6B', '#722F37', '#F5F5F5'],
}

export const PERSONAL_COLOR_COLORS: Record<PersonalColor, string[]> = {
  spring_warm: ['코랄', '피치', '아이보리', '골드', '살구', '연노랑', '오렌지'],
  summer_cool: ['라벤더', '로즈', '파우더블루', '실버', '연보라', '민트', '핑크'],
  autumn_warm: ['카키', '브라운', '머스타드', '올리브', '테라코타', '베이지', '오트밀'],
  winter_cool: ['블랙', '네이비', '버건디', '화이트', '다크그린', '로열블루', '그레이'],
}

export const ACTIVITY_LABELS: Record<Activity, string> = {
  formal: '포멀',
  office: '오피스',
  daily: '데일리',
  active: '액티브',
  nightout: '나이트아웃',
  homewear: '홈웨어',
}

export const ACTIVITY_DESCRIPTIONS: Record<Activity, string> = {
  formal: '면접, 비즈니스, 결혼식',
  office: '출근, 등교',
  daily: '친구 만남, 데이트',
  active: '운동, 등산, 캠핑',
  nightout: '파티, 클럽, 공연',
  homewear: '재택, 휴식',
}

export const ACTIVITY_ICONS: Record<Activity, string> = {
  formal: '👔',
  office: '💼',
  daily: '☀️',
  active: '🏃',
  nightout: '🌙',
  homewear: '🏠',
}

export const ACTIVITY_ALLOWED_STYLES: Record<Activity, Style[]> = {
  formal: ['formal'],
  office: ['formal', 'minimal', 'casual'],
  daily: ['casual', 'minimal', 'street', 'formal', 'sporty'],
  active: ['sporty'],
  nightout: ['formal', 'street', 'minimal'],
  homewear: ['casual', 'minimal', 'sporty'],
}

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '상의',
  bottom: '하의',
  outer: '아우터',
  shoes: '신발',
  accessory: '액세서리',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring_summer: '봄/여름',
  autumn_winter: '가을/겨울',
  all_season: '사계절',
}

export const STYLE_LABELS: Record<Style, string> = {
  casual: '캐주얼',
  formal: '포멀',
  sporty: '스포티',
  street: '스트릿',
  minimal: '미니멀',
}

export const GENDER_LABELS = {
  male: '남성',
  female: '여성',
  neutral: '무관',
}

export const TEMP_GUIDE: Array<{ min: number; max: number; items: string }> = [
  { min: 28, max: 999, items: '민소매, 반팔, 반바지, 원피스' },
  { min: 23, max: 27, items: '반팔, 얇은 셔츠, 반바지, 면바지' },
  { min: 20, max: 22, items: '얇은 가디건, 긴팔, 면바지, 청바지' },
  { min: 17, max: 19, items: '얇은 니트, 맨투맨, 가디건, 청바지' },
  { min: 12, max: 16, items: '자켓, 가디건, 야상, 스타킹, 청바지' },
  { min: 9, max: 11, items: '자켓, 트렌치코트, 야상, 니트, 스타킹' },
  { min: 5, max: 8, items: '코트, 가죽자켓, 히트텍, 니트, 레깅스' },
  { min: -999, max: 4, items: '패딩, 두꺼운 코트, 목도리, 기모제품' },
]

export function getTempGuide(temp: number): string {
  return TEMP_GUIDE.find(g => temp >= g.min && temp <= g.max)?.items ?? '기본 옷차림'
}
