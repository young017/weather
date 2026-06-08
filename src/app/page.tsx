'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_ICONS,
} from '@/lib/constants'
import type { WeatherData, Activity } from '@/types'

const ACTIVITIES: Activity[] = ['formal', 'office', 'daily', 'active', 'nightout', 'homewear']

function WeatherCard({ data, loading }: { data: WeatherData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="card mx-4 mt-4 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-2" />
        <div className="h-12 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card mx-4 mt-4 text-center text-gray-400 py-6">
        <p className="text-2xl mb-1">📍</p>
        <p className="text-sm">위치 권한을 허용해주세요</p>
      </div>
    )
  }

  const iconUrl = `https://openweathermap.org/img/wn/${data.weather_icon}@2x.png`

  return (
    <div className="card mx-4 mt-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{data.city}</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-5xl font-bold text-gray-900">{data.temp}°</span>
            <span className="text-lg text-gray-400 mb-1">체감 {data.feels_like}°</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 capitalize">{data.weather_desc}</p>
        </div>
        <Image src={iconUrl} alt={data.weather_desc} width={72} height={72} />
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-orange-100 text-sm text-gray-500">
        <span>💧 {data.humidity}%</span>
        <span>💨 {data.wind_speed}m/s</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      let userId: string | undefined = session?.user?.id

      if (!session) {
        const { data } = await supabase.auth.signInAnonymously()
        userId = data.user?.id
      }

      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (!profile) {
          router.replace('/onboarding')
          return
        }
      }

      setAuthReady(true)
    }

    init()
  }, [router])

  const fetchWeather = useCallback((lat: number, lon: number) => {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setWeather(data)
      })
      .finally(() => setWeatherLoading(false))
  }, [])

  useEffect(() => {
    if (!authReady) return

    if (!navigator.geolocation) {
      setWeatherLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        setCoords({ lat, lon })
        fetchWeather(lat, lon)
      },
      () => setWeatherLoading(false)
    )
  }, [authReady, fetchWeather])

  const handleRecommend = () => {
    if (!activity || !coords) return
    router.push(
      `/result?activity=${activity}&lat=${coords.lat}&lon=${coords.lon}`
    )
  }

  if (!authReady) {
    return (
      <div className="page-container items-center justify-center">
        <div className="text-3xl animate-bounce">👗</div>
      </div>
    )
  }

  return (
    <div className="page-container pb-24">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">몇도야</h1>
        <p className="text-sm text-gray-400 mt-0.5">오늘 뭐 입을까?</p>
      </header>

      <WeatherCard data={weather} loading={weatherLoading} />

      <section className="px-4 mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">오늘 어디 가세요?</h2>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITIES.map(act => (
            <button
              key={act}
              onClick={() => setActivity(act)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-150 active:scale-95
                ${activity === act
                  ? 'border-accent bg-orange-50 shadow-sm'
                  : 'border-gray-100 bg-white'
                }`}
            >
              <span className="text-2xl mb-1">{ACTIVITY_ICONS[act]}</span>
              <span className={`text-xs font-semibold ${activity === act ? 'text-accent' : 'text-gray-700'}`}>
                {ACTIVITY_LABELS[act]}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">
                {ACTIVITY_DESCRIPTIONS[act]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-6 pt-3 bg-gradient-to-t from-gray-50 to-transparent">
        <button
          className="btn-primary"
          disabled={!activity || weatherLoading || !coords}
          onClick={handleRecommend}
        >
          {weatherLoading
            ? '날씨 불러오는 중...'
            : !coords
            ? '위치 권한이 필요합니다'
            : !activity
            ? '활동을 선택해주세요'
            : '추천 받기 →'}
        </button>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-gray-100 bg-white flex">
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-accent">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">홈</span>
        </button>
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
          onClick={() => router.push('/wardrobe')}
        >
          <span className="text-xl">👗</span>
          <span className="text-[10px] font-medium">내 옷장</span>
        </button>
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
          onClick={() => router.push('/settings')}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-medium">설정</span>
        </button>
      </nav>
    </div>
  )
}
