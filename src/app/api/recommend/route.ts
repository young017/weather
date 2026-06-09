import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_COLORS,
  ACTIVITY_LABELS,
  ACTIVITY_ALLOWED_STYLES,
  ACTIVITY_DETAIL,
  GENDER_LABELS,
  buildWeatherGuide,
} from '@/lib/constants'
import type { WardrobeItem, Activity, Category, PersonalColor, WeatherData, Season } from '@/types'

const client = new Anthropic()

function filterByWeather(items: WardrobeItem[], feelsLike: number): WardrobeItem[] {
  let allowed: Season[]
  if (feelsLike >= 23)      allowed = ['summer']
  else if (feelsLike >= 10) allowed = ['spring_autumn']
  else                      allowed = ['winter']
  return items.filter(item => allowed.includes(item.season))
}

function filterByStyle(items: WardrobeItem[], activity: Activity): WardrobeItem[] {
  const styles = ACTIVITY_ALLOWED_STYLES[activity]
  return items.filter(item => (styles as string[]).includes(item.style))
}

function sortByPersonalColor(items: WardrobeItem[], personalColor: PersonalColor): WardrobeItem[] {
  const preferred = PERSONAL_COLOR_COLORS[personalColor].map(c => c.toLowerCase())
  return [...items].sort((a, b) => {
    const aMatch = a.colors.some(c =>
      preferred.some(p => c.toLowerCase().includes(p) || p.includes(c.toLowerCase()))
    )
    const bMatch = b.colors.some(c =>
      preferred.some(p => c.toLowerCase().includes(p) || p.includes(c.toLowerCase()))
    )
    return aMatch === bMatch ? 0 : aMatch ? -1 : 1
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const body: { weather: WeatherData; activity: Activity; selectedItems?: Category[] } = await request.json()
  const { weather, activity } = body
  const selectedItems: Category[] = body.selectedItems ?? ['top', 'bottom', 'outer', 'shoes', 'accessory']

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: '프로필이 없습니다' }, { status: 400 })
  }

  const { data: allItems } = await supabase
    .from('wardrobe')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!allItems || allItems.length === 0) {
    return NextResponse.json({ error: '옷장이 비어 있어요. 옷을 등록해주세요.' }, { status: 400 })
  }

  // Compute which selected categories are completely absent from the wardrobe (unregistered)
  const allWardrobeCategories = new Set((allItems as WardrobeItem[]).map(i => i.category))
  const missingCategories: Category[] = selectedItems.filter(cat => !allWardrobeCategories.has(cat))

  // 1: weather filter
  const weatherFiltered = filterByWeather(allItems as WardrobeItem[], weather.feels_like)

  // 2: style filter (fallback to all weather items if no style match)
  let styleFiltered = filterByStyle(weatherFiltered, activity)
  const usedFallback = styleFiltered.length === 0
  if (usedFallback) styleFiltered = weatherFiltered

  if (styleFiltered.length === 0) {
    return NextResponse.json({ error: '현재 날씨에 맞는 옷이 부족합니다.' }, { status: 400 })
  }

  // 3: sort by personal color
  const sorted = sortByPersonalColor(styleFiltered, profile.personal_color as PersonalColor)

  // 4: filter to selected categories (top 20 for Claude)
  const topItems = sorted
    .filter(item => selectedItems.includes(item.category))
    .slice(0, 20)

  // Case: all selected categories have no usable items — return without calling Claude
  if (topItems.length === 0) {
    return NextResponse.json({
      top: null,
      bottom: null,
      outer: null,
      shoes: null,
      accessories: [],
      reason: '',
      tips: [],
      usedFallback,
      missingCategories,
      allMissing: true,
    })
  }

  const personalColorLabel = `${PERSONAL_COLOR_LABELS[profile.personal_color as PersonalColor]} (${PERSONAL_COLOR_COLORS[profile.personal_color as PersonalColor].slice(0, 4).join(', ')} 계열)`
  const likedStyles: string[] = profile.liked_styles ?? []
  const dislikedStyles: string[] = profile.disliked_styles ?? []

  const wardrobeText = topItems
    .map((item, i) =>
      `${i + 1}. [${item.category}] ${item.colors.join('+')} | ${item.style} | ${item.season}${item.description ? ` | ${item.description}` : ''}`
    )
    .join('\n')

  const stylePrefsSection = (likedStyles.length > 0 || dislikedStyles.length > 0)
    ? `[스타일 선호도]\n${likedStyles.length > 0 ? `- 좋아하는 스타일: ${likedStyles.join(', ')}` : ''}\n${dislikedStyles.length > 0 ? `- 절대 피해야 할 스타일: ${dislikedStyles.join(', ')}` : ''}\n\n`
    : ''

  const selectedCatsKo = selectedItems.map(c => ({
    top: '상의', bottom: '하의', outer: '아우터', shoes: '신발', accessory: '액세서리'
  }[c])).join(', ')

  const prompt = `당신은 패션 스타일리스트입니다.

[날씨 정보]
- 기온: ${weather.temp}°C (체감 ${weather.feels_like}°C)
- 날씨: ${weather.weather_desc}
- 습도: ${weather.humidity}%
- 풍속: ${weather.wind_speed}m/s

${buildWeatherGuide(weather.feels_like, weather.weather_condition, weather.wind_speed)}

[오늘 활동]
${ACTIVITY_LABELS[activity]} — ${ACTIVITY_DETAIL[activity]}${usedFallback ? '\n(허용 스타일이 없어 비슷한 스타일로 대체)' : ''}

[퍼스널 컬러]
${personalColorLabel}

[성별]
${GENDER_LABELS[profile.gender as keyof typeof GENDER_LABELS]}

${stylePrefsSection}[추천 요청 아이템: ${selectedCatsKo}]

[내 옷장 (${topItems.length}개)]
${wardrobeText}

위 정보를 바탕으로 최적의 코디를 추천해주세요. 절대 피해야 할 스타일은 반드시 제외하세요.
요청된 아이템 카테고리만 추천하고, 옷장에 없는 카테고리는 null로 반환하세요.
JSON만 출력하세요 (코드블록 없이):

{
  "top_index": 숫자 또는 null,
  "bottom_index": 숫자 또는 null,
  "outer_index": 숫자 또는 null,
  "shoes_index": 숫자 또는 null,
  "accessory_indices": [],
  "reason": "날씨 기반 — (오늘 체감온도·날씨 상태를 근거로 이 옷을 선택한 이유를 구체적으로. 예: 기온, 바람, 습도 등)\\n외출 목적 — (선택한 활동·자리에 이 코디가 왜 어울리는지 분위기·격식 수준까지 설명)\\n퍼스널 컬러 — (추천한 옷의 색상이 퍼스널 컬러와 어떻게 잘 맞는지 색상 이름 언급하며 구체적으로)\\n스타일 선호도 — (좋아하는 스타일을 어떻게 반영했는지, 또는 싫어하는 스타일을 어떻게 피했는지)",
  "tips": ["실제로 따라 할 수 있는 구체적인 스타일링 팁 (예: 소매 걷기, 레이어링 방법, 색상 포인트 주는 법 등)", "착용감·활동성·날씨 대응 관련 실용적인 팁"]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found')
    const result = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      top: result.top_index != null ? topItems[result.top_index - 1] ?? null : null,
      bottom: result.bottom_index != null ? topItems[result.bottom_index - 1] ?? null : null,
      outer: result.outer_index != null ? topItems[result.outer_index - 1] ?? null : null,
      shoes: result.shoes_index != null ? topItems[result.shoes_index - 1] ?? null : null,
      accessories: ((result.accessory_indices as number[]) ?? [])
        .map((i: number) => topItems[i - 1])
        .filter(Boolean),
      reason: result.reason ?? '',
      tips: result.tips ?? [],
      usedFallback,
      missingCategories,
      allMissing: false,
    })
  } catch (e) {
    console.error('[recommend] parse error:', e, '\nresponse:', responseText)
    return NextResponse.json({ error: '추천 생성에 실패했습니다' }, { status: 500 })
  }
}
