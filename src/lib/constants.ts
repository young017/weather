import type { PersonalColor, Activity, Category, Season, Style } from '@/types'

export const STYLE_KEYWORDS = [
  { id: 'casual',   label: '캐주얼',  emoji: '👕', desc: '편하고 자연스러운' },
  { id: 'minimal',  label: '미니멀',  emoji: '⬜', desc: '심플하고 깔끔한' },
  { id: 'street',   label: '스트릿',  emoji: '🧢', desc: '트렌디하고 힙한' },
  { id: 'sporty',   label: '스포티',  emoji: '👟', desc: '활동적이고 편한' },
  { id: 'formal',   label: '포멀',    emoji: '👔', desc: '단정하고 격식 있는' },
  { id: 'vintage',  label: '빈티지',  emoji: '🎸', desc: '레트로하고 개성 있는' },
  { id: 'chic',     label: '시크',    emoji: '🖤', desc: '세련되고 도시적인' },
  { id: 'girly',    label: '걸리시',  emoji: '🌸', desc: '여성스럽고 사랑스러운' },
  { id: 'boyish',   label: '보이시',  emoji: '🧥', desc: '중성적이고 시원한' },
  { id: 'classic',  label: '클래식',  emoji: '🎩', desc: '고전적이고 품격 있는' },
  { id: 'romantic', label: '로맨틱',  emoji: '🌹', desc: '부드럽고 낭만적인' },
  { id: 'preppy',   label: '프레피',  emoji: '📚', desc: '단정하고 학생다운' },
] as const

export const EMPTY_WARDROBE_MESSAGES: Record<Activity, string> = {
  formal:   "격식 있는 자리인데 딱 맞는 옷이 없네요.\n이번 기회에 포멀 아이템 한 벌 어때요? 👔",
  office:   "출근할 옷이 없네요.\n한 벌만 장만해보는 건 어떨까요? 😅",
  daily:    "나들이 갈 옷이 없다니!\n옷장이 텅텅 비었나요? 쇼핑 갈 때가 됐어요 🛍️",
  active:   "운동복이 없네요.\n새 운동복 사면 의욕도 따라오거든요 💪",
  date:     "데이트 코디가 없다고요?\n오늘이 새 옷 살 완벽한 핑계예요 💕",
  nightout: "꾸밀 옷이 없다고요?\n오늘이 새 옷 살 핑계가 생긴 날이에요 ✨",
}

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
  formal:   '포멀',
  office:   '오피스',
  daily:    '데일리',
  active:   '액티브',
  date:     '데이트',
  nightout: '파티·나이트',
}

export const ACTIVITY_DESCRIPTIONS: Record<Activity, string> = {
  formal:   '면접, 비즈니스, 결혼식',
  office:   '출근, 등교',
  daily:    '친구 만남, 나들이',
  active:   '운동, 등산, 캠핑',
  date:     '연인, 소개팅',
  nightout: '파티, 클럽, 공연',
}

export const ACTIVITY_DETAIL: Record<Activity, string> = {
  formal:   '면접, 비즈니스 미팅, 결혼식, 장례식처럼 격식이 반드시 필요한 자리. 캐주얼한 옷은 절대 안 됨. 여름이라도 반드시 긴바지 착용.',
  office:   '일반 출근, 등교. 단정하되 하루 종일 입어도 불편하지 않은 옷.',
  daily:    '친구 만남, 나들이 등 편안한 일상 외출. 특별한 드레스코드 없음.',
  active:   '운동, 등산, 캠핑 등 몸을 쓰는 날. 기능성 스포츠웨어, 유니폼만 해당. 일반 캐주얼 옷은 제외.',
  date:     '연인과의 외출, 소개팅. 상대방에게 잘 보여야 하는 날.',
  nightout: '파티, 클럽, 공연, 행사. 꾸미는 게 기본인 날.',
}

export const ACTIVITY_ICONS: Record<Activity, string> = {
  formal:   '👔',
  office:   '💼',
  daily:    '☀️',
  active:   '🏃',
  date:     '💕',
  nightout: '🌙',
}

export const ACTIVITY_ALLOWED_STYLES: Record<Activity, Style[]> = {
  formal:   ['formal', 'classic', 'chic'],
  office:   ['formal', 'minimal', 'classic', 'preppy'],
  daily:    ['casual', 'street', 'minimal', 'vintage', 'boyish'],
  active:   ['sporty'],
  date:     ['romantic', 'girly', 'chic', 'minimal', 'casual'],
  nightout: ['chic', 'street', 'girly', 'romantic', 'formal'],
}

export const CATEGORY_LABELS: Record<Category, string> = {
  top:       '상의',
  bottom:    '하의',
  outer:     '아우터',
  shoes:     '신발',
  accessory: '액세서리',
}

export const SEASON_LABELS: Record<Season, string> = {
  summer:       '여름',
  spring_autumn: '봄/가을',
  winter:       '겨울',
}

export const STYLE_LABELS: Record<Style, string> = {
  casual:   '캐주얼',
  formal:   '포멀',
  sporty:   '스포티',
  street:   '스트릿',
  minimal:  '미니멀',
  vintage:  '빈티지',
  chic:     '시크',
  girly:    '걸리시',
  boyish:   '보이시',
  classic:  '클래식',
  romantic: '로맨틱',
  preppy:   '프레피',
}

export const GENDER_LABELS = {
  male:    '남성',
  female:  '여성',
  neutral: '무관',
}

interface TempGuideEntry {
  min: number
  max: number
  top: string
  bottom: string
  outer: string | null
  shoes: string
  accessory: string | null
}

const TEMP_GUIDE: TempGuideEntry[] = [
  {
    min: 28,   max: 999,
    top:       '민소매, 반팔, 나시',
    bottom:    '반바지, 숏스커트, 원피스',
    outer:     null,
    shoes:     '샌들, 슬리퍼, 스니커즈',
    accessory: '선글라스, 모자',
  },
  {
    min: 23,   max: 27,
    top:       '반팔, 얇은 셔츠, 린넨 셔츠',
    bottom:    '면바지, 반바지, 와이드팬츠',
    outer:     null,
    shoes:     '스니커즈, 로퍼, 샌들',
    accessory: '선글라스',
  },
  {
    min: 20,   max: 22,
    top:       '긴팔, 얇은 니트, 셔츠',
    bottom:    '청바지, 면바지, 슬랙스',
    outer:     '얇은 가디건',
    shoes:     '스니커즈, 로퍼, 플랫슈즈',
    accessory: null,
  },
  {
    min: 17,   max: 19,
    top:       '맨투맨, 니트, 후드티',
    bottom:    '청바지, 슬랙스, 면바지',
    outer:     '얇은 가디건, 데님자켓',
    shoes:     '스니커즈, 로퍼, 앵클부츠',
    accessory: null,
  },
  {
    min: 12,   max: 16,
    top:       '두꺼운 니트, 긴팔',
    bottom:    '청바지, 슬랙스, 스타킹',
    outer:     '자켓, 야상, 블레이저',
    shoes:     '스니커즈, 로퍼, 앵클부츠',
    accessory: '얇은 스카프',
  },
  {
    min: 9,    max: 11,
    top:       '두꺼운 니트, 히트텍',
    bottom:    '청바지, 두꺼운 슬랙스, 스타킹',
    outer:     '트렌치코트, 야상, 가죽자켓',
    shoes:     '부츠, 앵클부츠, 스니커즈',
    accessory: '목도리, 얇은 장갑',
  },
  {
    min: 5,    max: 8,
    top:       '히트텍, 두꺼운 니트',
    bottom:    '레깅스, 두꺼운 슬랙스',
    outer:     '코트, 가죽자켓',
    shoes:     '부츠, 두꺼운 스니커즈',
    accessory: '목도리, 장갑',
  },
  {
    min: -999, max: 4,
    top:       '히트텍, 기모 상의',
    bottom:    '기모 레깅스, 기모 바지',
    outer:     '패딩, 두꺼운 코트',
    shoes:     '방한부츠, 두꺼운 스니커즈',
    accessory: '목도리, 장갑, 귀마개',
  },
]

export function buildWeatherGuide(feelsLike: number, weatherCondition: string, windSpeed: number): string {
  const entry = TEMP_GUIDE.find(g => feelsLike >= g.min && feelsLike <= g.max)
  const lines: string[] = [`[기온별 추천 — 체감 ${feelsLike}°C]`]

  if (entry) {
    lines.push(`- 상의: ${entry.top}`)
    lines.push(`- 하의: ${entry.bottom}`)
    lines.push(`- 아우터: ${entry.outer ?? '불필요 (더운 날씨)'}`)
    lines.push(`- 신발: ${entry.shoes}`)
    lines.push(`- 액세서리: ${entry.accessory ?? '없음'}`)
  }

  const cond = weatherCondition.toLowerCase()
  const isRain = cond === 'rain' || cond === 'drizzle' || cond === 'thunderstorm'
  const isSnow = cond === 'snow'
  const isWindy = windSpeed >= 8

  if (isRain) {
    lines.push('\n[비 조건 — 추가 반영]')
    lines.push('- 신발: 방수 스니커즈, 레인부츠 우선')
    lines.push('- 아우터: 방수 아우터, 바람막이 우선')
    lines.push('- 액세서리: 우산 추가 제안')
  }
  if (isSnow) {
    lines.push('\n[눈 조건 — 추가 반영]')
    lines.push('- 신발: 방한 방수 부츠 우선')
    lines.push('- 아우터: 패딩, 방수 코트 우선')
    lines.push('- 액세서리: 목도리, 장갑, 우산 추가 제안')
  }
  if (isWindy) {
    lines.push('\n[강풍 조건 — 추가 반영]')
    lines.push('- 아우터: 바람막이, 후드 있는 아우터 우선')
  }

  return lines.join('\n')
}
