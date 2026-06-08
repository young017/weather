'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import type { Recommendation, WeatherData, Activity } from '@/types'
import { ACTIVITY_LABELS, CATEGORY_LABELS } from '@/lib/constants'

function OutfitItem({ item, label }: { item: NonNullable<Recommendation['top']>; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <Image src={item.image_url} alt={label} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-accent">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 truncate">{item.description ?? item.colors.join(', ')}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.colors.join(' · ')}</p>
      </div>
    </div>
  )
}

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activity = searchParams.get('activity') as Activity | null
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activity || !lat || !lon) {
      router.replace('/')
      return
    }

    const run = async () => {
      setLoading(true)
      setError(null)

      const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const weatherData: WeatherData = await weatherRes.json()

      if ((weatherData as { error?: string }).error) {
        setError('날씨 정보를 가져올 수 없습니다')
        setLoading(false)
        return
      }

      setWeather(weatherData)

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherData, activity }),
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
  }, [activity, lat, lon, router])

  if (loading) {
    return (
      <div className="page-container items-center justify-center gap-4 px-8 text-center">
        <div className="text-5xl animate-bounce">👗</div>
        <p className="text-gray-700 font-semibold">오늘의 코디 조합 중...</p>
        <p className="text-sm text-gray-400">
          {activity ? `${ACTIVITY_LABELS[activity]} 룩을 찾고 있어요` : ''}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container items-center justify-center gap-4 px-8 text-center">
        <div className="text-5xl">😔</div>
        <p className="text-gray-700 font-semibold">{error}</p>
        <button
          className="btn-primary mt-4"
          onClick={() => error.includes('옷') ? router.push('/wardrobe/add') : router.back()}
        >
          {error.includes('옷') ? '옷 등록하러 가기' : '다시 시도'}
        </button>
      </div>
    )
  }

  if (!recommendation) return null

  const outfitItems = [
    { key: 'top', item: recommendation.top, label: CATEGORY_LABELS.top },
    { key: 'bottom', item: recommendation.bottom, label: CATEGORY_LABELS.bottom },
    { key: 'outer', item: recommendation.outer, label: CATEGORY_LABELS.outer },
    { key: 'shoes', item: recommendation.shoes, label: CATEGORY_LABELS.shoes },
  ].filter((o): o is { key: string; item: NonNullable<typeof o.item>; label: string } => o.item != null)

  return (
    <div className="page-container pb-8">
      <header className="page-header flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-500 text-lg p-1">←</button>
        <div>
          <h1 className="font-bold text-gray-900">오늘의 코디</h1>
          {weather && (
            <p className="text-xs text-gray-400">
              {weather.temp}°C · {weather.weather_desc}
              {activity ? ` · ${ACTIVITY_LABELS[activity]}` : ''}
            </p>
          )}
        </div>
      </header>

      <div className="px-4 mt-4 space-y-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">추천 코디</h2>
          <div className="space-y-4">
            {outfitItems.map(({ key, item, label }) => (
              <OutfitItem key={key} item={item} label={label} />
            ))}
            {recommendation.accessories.map((item, i) => (
              <OutfitItem key={`acc-${i}`} item={item} label={CATEGORY_LABELS.accessory} />
            ))}
          </div>
          {outfitItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              조건에 맞는 아이템이 부족합니다
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">스타일리스트 코멘트</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{recommendation.reason}</p>
        </div>

        {recommendation.tips.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">스타일링 팁</h2>
            <ul className="space-y-1.5">
              {recommendation.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn-secondary" onClick={() => router.push('/')}>
          다시 추천 받기
        </button>
      </div>
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
