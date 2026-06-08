import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_COLORS,
  ACTIVITY_LABELS,
  ACTIVITY_ALLOWED_STYLES,
  GENDER_LABELS,
  getTempGuide,
} from '@/lib/constants'
import type { WardrobeItem, Activity, PersonalColor, WeatherData } from '@/types'

const client = new Anthropic()

function filterByWeather(items: WardrobeItem[], feelsLike: number): WardrobeItem[] {
  const seasonFilter: WardrobeItem['season'][] = ['all_season']
  if (feelsLike >= 17) seasonFilter.push('spring_summer')
  else seasonFilter.push('autumn_winter')
  return items.filter(item => seasonFilter.includes(item.season))
}

function filterByActivity(items: WardrobeItem[], activity: Activity): WardrobeItem[] {
  const allowed = ACTIVITY_ALLOWED_STYLES[activity]
  return items.filter(item => allowed.includes(item.style))
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

  const body: { weather: WeatherData; activity: Activity } = await request.json()
  const { weather, activity } = body

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
    return NextResponse.json(
      { error: '등록된 옷이 없습니다. 먼저 옷을 등록해주세요.' },
      { status: 400 }
    )
  }

  let filtered = allItems as WardrobeItem[]

  if (activity !== 'homewear') {
    filtered = filterByWeather(filtered, weather.feels_like)
  }

  filtered = filterByActivity(filtered, activity)
  filtered = sortByPersonalColor(filtered, profile.personal_color)

  const topItems = filtered.slice(0, 20)

  if (topItems.length === 0) {
    return NextResponse.json(
      { error: '조건에 맞는 옷이 없습니다. 옷장을 더 채워주세요.' },
      { status: 400 }
    )
  }

  const wardrobeText = topItems
    .map(
      (item, i) =>
        `${i + 1}. [${item.category}] ${item.colors.join('+')} | ${item.style} | ${item.season}${item.description ? ` | ${item.description}` : ''}`
    )
    .join('\n')

  const personalColorLabel = `${PERSONAL_COLOR_LABELS[profile.personal_color as PersonalColor]} (${PERSONAL_COLOR_COLORS[profile.personal_color as PersonalColor].slice(0, 4).join(', ')} 계열)`

  const isHomewear = activity === 'homewear'

  const weatherSection = isHomewear
    ? ''
    : `[날씨 정보]
- 기온: ${weather.temp}°C (체감 ${weather.feels_like}°C)
- 날씨: ${weather.weather_desc}
- 습도: ${weather.humidity}%
- 풍속: ${weather.wind_speed}m/s

[기온별 가이드라인]
${getTempGuide(weather.feels_like)}

`

  const prompt = `당신은 패션 스타일리스트입니다.

${weatherSection}[오늘 활동]
${ACTIVITY_LABELS[activity]}

[퍼스널 컬러]
${personalColorLabel}

[성별]
${GENDER_LABELS[profile.gender as keyof typeof GENDER_LABELS]}

[내 옷장 (${topItems.length}개)]
${wardrobeText}

${isHomewear ? '홈웨어이므로 편안함을 최우선으로 하여 ' : '위 정보를 바탕으로 '}최적의 코디를 추천해주세요.
JSON만 출력하세요 (코드블록 없이):

{
  "top_index": 숫자 또는 null,
  "bottom_index": 숫자 또는 null,
  "outer_index": 숫자 또는 null,
  "shoes_index": 숫자 또는 null,
  "accessory_indices": [],
  "reason": "추천 이유 2~3문장",
  "tips": ["스타일링 팁1", "팁2"]
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
    })
  } catch {
    return NextResponse.json({ error: '추천 생성에 실패했습니다' }, { status: 500 })
  }
}
