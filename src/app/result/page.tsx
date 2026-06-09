'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import type { Recommendation, WeatherData, Activity, Category, WardrobeItem } from '@/types'
import { ACTIVITY_LABELS, CATEGORY_LABELS } from '@/lib/constants'

const CATEGORY_MISSING_MSG: Record<Category, string> = {
  top:       '상의부터 채워볼까요 👕',
  bottom:    '하의 하나면 코디의 절반은 완성이에요 👖',
  outer:     '아우터 하나면 어떤 날씨든 걱정 없어요 🧥',
  shoes:     '신발까지 있으면 진짜 완벽한 코디예요 👟',
  accessory: '작은 포인트 하나가 코디를 바꿔요 💍',
}

const CATEGORY_NO_MATCH_MSG: Record<Category, string> = {
  top:       '오늘 활동에 맞는 상의를 찾지 못했어요',
  bottom:    '오늘 활동에 맞는 하의를 찾지 못했어요',
  outer:     '오늘은 아우터 없이도 충분해요 🙆',
  shoes:     '오늘 활동에 맞는 신발을 찾지 못했어요',
  accessory: '오늘은 없어도 완성된 코디예요 ✨',
}

const CATEGORY_EMOJI: Record<Category, string> = {
  top: '👕', bottom: '👖', outer: '🧥', shoes: '👟', accessory: '💍',
}

function OutfitRow({
  category,
  item,
  isMissing,
}: {
  category: Category
  item: WardrobeItem | null
  isMissing: boolean
}) {
  const label = CATEGORY_LABELS[category]

  if (!item) {
    return (
      <div className="flex items-center gap-5 py-1">
        <div className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
          <span className="text-3xl opacity-20">{CATEGORY_EMOJI[category]}</span>
        </div>
        <div className="flex-1">
          <span className="inline-block text-sm font-extrabold bg-gray-100 text-[#555] px-3 py-1 rounded-full mb-2 tracking-widest uppercase">
            {label}
          </span>
          <p className="text-sm text-[#555] font-normal leading-relaxed">
            {isMissing ? CATEGORY_MISSING_MSG[category] : CATEGORY_NO_MATCH_MSG[category]}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm">
        <Image src={item.image_url} alt={label} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-sm font-extrabold bg-accent/10 text-accent px-3 py-1 rounded-full mb-1.5 tracking-widest uppercase">
          {label}
        </span>
        <p className="text-base text-black font-bold truncate">{item.description ?? item.colors.join(', ')}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {item.colors.map((c, i) => (
            <span key={i} className="text-sm text-[#555] bg-gray-100 px-2.5 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const OUTFIT_KEYS = ['top', 'bottom', 'outer', 'shoes'] as const

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activity = searchParams.get('activity') as Activity | null
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const city = searchParams.get('city')
  const isManual = searchParams.get('manual') === '1'
  const itemsParam = searchParams.get('items')
  const selectedItems: Category[] = itemsParam
    ? (itemsParam.split(',') as Category[])
    : ['top', 'bottom', 'outer', 'shoes', 'accessory']

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activity || (!lat && !lon && !city && !isManual)) {
      router.replace('/')
      return
    }

    const run = async () => {
      setLoading(true)
      setError(null)

      let weatherData: WeatherData
      if (isManual) {
        const stored = sessionStorage.getItem('manualWeather')
        if (!stored) { router.replace('/'); return }
        weatherData = JSON.parse(stored) as WeatherData
      } else {
        const weatherQuery = city
          ? `/api/weather?city=${encodeURIComponent(city)}`
          : `/api/weather?lat=${lat}&lon=${lon}`
        const weatherRes = await fetch(weatherQuery)
        weatherData = await weatherRes.json()

        if ((weatherData as { error?: string }).error) {
          setError('날씨 정보를 가져올 수 없습니다')
          setLoading(false)
          return
        }
      }

      setWeather(weatherData)

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherData, activity, selectedItems }),
      })

      const recData = await recRes.json()

      if (!recRes.ok) {
        setError(recData.error ?? '추천 생성에 실패했습니다')
        setLoading(false)
        return
      }

      setRecommendation(recData)
      setLoading(false)
    }

    run()
  }, [activity, city, lat, lon, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="text-6xl animate-pulse">👗</p>
        <p className="text-xl text-black font-bold">오늘의 코디 조합 중...</p>
        <p className="text-base text-[#333333] font-normal">
          {activity ? `${ACTIVITY_LABELS[activity]} 룩을 찾고 있어요` : ''}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-8 text-center max-w-lg mx-auto">
        <p className="text-xl text-black font-bold whitespace-pre-line leading-relaxed">{error}</p>
        <button className="btn-primary py-5 text-lg mt-4" onClick={() => router.push('/')}>
          홈으로
        </button>
      </div>
    )
  }

  if (!recommendation) return null

  const missing = recommendation.missingCategories ?? []
  const allMissing = recommendation.allMissing ?? false
  const usedFallback = recommendation.usedFallback ?? false

  const outfitRows = OUTFIT_KEYS
    .filter(key => selectedItems.includes(key))
    .map(key => ({
      key,
      item: recommendation[key],
      isMissing: missing.includes(key),
    }))

  const wantsAccessory = selectedItems.includes('accessory')
  const hasAccessories = recommendation.accessories.length > 0
  const accessoryMissing = missing.includes('accessory')

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b-2 border-black px-12 py-0 flex items-center">
        <button
          onClick={() => router.push('/')}
          className="text-black font-bold text-2xl py-5 pr-6 border-r-2 border-gray-200 mr-6"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-black text-black text-xl">오늘의 코디</h1>
          {weather && (
            <p className="text-sm text-[#333333] font-normal">
              {weather.city} · {weather.temp}°C · {weather.weather_desc}
              {activity ? ` · ${ACTIVITY_LABELS[activity]}` : ''}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 px-12 py-8">
        <div className="grid grid-cols-2 gap-6">

          {/* Left: outfit list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* card header */}
            <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#333] tracking-widest uppercase">추천 코디</h2>
              {usedFallback && (
                <span className="text-xs text-accent font-bold bg-accent/10 px-3 py-1 rounded-full">
                  비슷한 스타일로 ✨
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {outfitRows.map(({ key, item, isMissing }) => (
                <div key={key} className="px-7 py-5">
                  <OutfitRow category={key} item={item} isMissing={isMissing} />
                </div>
              ))}

              {wantsAccessory && (
                hasAccessories
                  ? recommendation.accessories.map((item, i) => (
                      <div key={`acc-${i}`} className="px-7 py-5">
                        <OutfitRow category="accessory" item={item} isMissing={false} />
                      </div>
                    ))
                  : (
                    <div className="px-7 py-5">
                      <OutfitRow category="accessory" item={null} isMissing={accessoryMissing} />
                    </div>
                  )
              )}

              {outfitRows.length === 0 && !wantsAccessory && (
                <div className="px-7 py-10 text-center">
                  <p className="text-base text-[#333333] font-normal">선택된 아이템이 없어요</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: comment / all-missing */}
          <div className="flex flex-col gap-4">
            {allMissing ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col items-center justify-center text-center gap-5 py-12 px-7">
                <p className="text-xl text-black font-bold leading-relaxed">
                  등록된 옷이 없어요.<br />옷장을 먼저 채워주세요 👗
                </p>
                <button
                  className="btn-primary w-auto px-8 py-4 text-base"
                  onClick={() => router.push('/wardrobe/add')}
                >
                  옷장 채우러 가기
                </button>
                <button className="text-sm text-[#555] font-normal underline" onClick={() => router.push('/')}>
                  홈으로 돌아가기
                </button>
              </div>
            ) : (
              <>
                {/* stylist comment */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-7 py-4 border-b border-gray-100">
                    <p className="text-sm font-extrabold text-[#333] tracking-widest uppercase">스타일리스트 코멘트</p>
                  </div>
                  {recommendation.reason.split('\n').filter(Boolean).map((line, i) => {
                    const [label, ...rest] = line.split(' — ')
                    return (
                      <div key={i} className={`px-7 py-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                        <p className="text-sm font-extrabold text-accent tracking-widest uppercase mb-1.5">{label}</p>
                        <p className="text-base text-black font-normal leading-relaxed">{rest.join(' — ')}</p>
                      </div>
                    )
                  })}
                </div>

                {/* tips */}
                {recommendation.tips.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-6">
                    <p className="text-sm font-extrabold text-[#333] tracking-widest uppercase mb-4">스타일링 팁</p>
                    <ul className="space-y-3">
                      {recommendation.tips.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-base text-black font-normal">
                          <span className="text-accent font-black flex-shrink-0 mt-0.5">—</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="btn-primary py-5 text-lg mt-auto"
                  onClick={() => router.push('/')}
                >
                  다시 추천 받기
                </button>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
