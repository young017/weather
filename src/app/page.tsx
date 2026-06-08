'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_ICONS,
} from '@/lib/constants'
import { TopNav } from '@/components/TopNav'
import type { WeatherData, Activity, Category } from '@/types'

const ACTIVITIES: Activity[] = ['formal', 'office', 'daily', 'active', 'date', 'nightout']

const ALL_ITEMS: Category[] = ['top', 'bottom', 'outer', 'shoes', 'accessory']
const ITEM_LABELS: Record<Category, string> = {
  top: '상의', bottom: '하의', outer: '아우터', shoes: '신발', accessory: '액세서리',
}

const KO_TO_EN: Record<string, string> = {
  서울: 'Seoul', 부산: 'Busan', 대구: 'Daegu', 인천: 'Incheon',
  광주: 'Gwangju', 대전: 'Daejeon', 울산: 'Ulsan', 세종: 'Sejong',
  수원: 'Suwon', 고양: 'Goyang', 성남: 'Seongnam', 창원: 'Changwon',
  제주: 'Jeju', 전주: 'Jeonju', 청주: 'Cheongju', 천안: 'Cheonan',
  안산: 'Ansan', 안양: 'Anyang', 남양주: 'Namyangju', 화성: 'Hwaseong',
  평택: 'Pyeongtaek', 용인: 'Yongin', 포항: 'Pohang', 김해: 'Gimhae',
  익산: 'Iksan', 목포: 'Mokpo', 여수: 'Yeosu', 순천: 'Suncheon',
  강릉: 'Gangneung', 원주: 'Wonju', 춘천: 'Chuncheon',
}

const MANUAL_CONDITIONS = [
  { value: 'Clear',      label: '맑음', humidity: 40, wind_speed: 2 },
  { value: 'Clouds',     label: '흐림', humidity: 60, wind_speed: 3 },
  { value: 'Rain',       label: '비',   humidity: 85, wind_speed: 5 },
  { value: 'Snow',       label: '눈',   humidity: 85, wind_speed: 4 },
  { value: 'Windy',      label: '강풍', humidity: 50, wind_speed: 12 },
] as const

type ManualConditionValue = typeof MANUAL_CONDITIONS[number]['value']

export default function HomePage() {
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [wardrobeEmpty, setWardrobeEmpty] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Category[]>([...ALL_ITEMS])

  // city input
  const [cityInput, setCityInput] = useState('')
  const [showCityInput, setShowCityInput] = useState(false)
  const [cityError, setCityError] = useState('')
  const [cityQuery, setCityQuery] = useState('')

  // manual weather input
  const [isManualWeather, setIsManualWeather] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualTemp, setManualTemp] = useState('')
  const [manualCondition, setManualCondition] = useState<ManualConditionValue>('Clear')

  const homeCoords = useRef<{ lat: number; lon: number } | null>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const manualTempRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.is_anonymous) {
        if (user?.is_anonymous) await supabase.auth.signOut()
        router.replace('/onboarding')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        router.replace('/onboarding?step=color')
        return
      }

      const { count } = await supabase
        .from('wardrobe')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null)
      setWardrobeEmpty(!count || count === 0)

      setAuthReady(true)
    }

    init()
  }, [router])

  const fetchWeather = useCallback((lat: number, lon: number) => {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setWeather(data) })
      .finally(() => setWeatherLoading(false))
  }, [])

  const fetchWeatherByCity = useCallback((city: string) => {
    const trimmed = city.trim()
    if (!trimmed) return
    setCityError('')
    const query = KO_TO_EN[trimmed] ?? trimmed
    setWeatherLoading(true)
    setShowCityInput(false)
    fetch(`/api/weather?city=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setWeather(data)
          setCoords(null)
          setCityQuery(query)
          setIsManualWeather(false)
        } else {
          setCityError(`'${trimmed}' 도시를 찾을 수 없어요`)
          setShowCityInput(true)
        }
      })
      .finally(() => setWeatherLoading(false))
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (!navigator.geolocation) { setWeatherLoading(false); return }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        homeCoords.current = { lat, lon }
        setCoords({ lat, lon })
        fetchWeather(lat, lon)
      },
      () => setWeatherLoading(false)
    )
  }, [authReady, fetchWeather])

  const goToMyLocation = useCallback(() => {
    if (!homeCoords.current) return
    const { lat, lon } = homeCoords.current
    setCityQuery('')
    setCityError('')
    setShowCityInput(false)
    setShowManualInput(false)
    setCityInput('')
    setIsManualWeather(false)
    setCoords({ lat, lon })
    setWeatherLoading(true)
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setWeather(data) })
      .finally(() => setWeatherLoading(false))
  }, [])

  const applyManualWeather = () => {
    const temp = parseInt(manualTemp)
    if (isNaN(temp) || manualTemp.trim() === '') return

    const cond = MANUAL_CONDITIONS.find(c => c.value === manualCondition)!
    const condDescMap: Record<ManualConditionValue, string> = {
      Clear: '맑음', Clouds: '흐림', Rain: '비', Snow: '눈', Windy: '강풍',
    }

    const manualWx: WeatherData = {
      temp,
      feels_like: temp,
      weather_desc: condDescMap[manualCondition],
      weather_icon: '',
      weather_condition: manualCondition === 'Windy' ? 'Clear' : manualCondition,
      humidity: cond.humidity,
      wind_speed: cond.wind_speed,
      city: '직접 입력',
    }

    setWeather(manualWx)
    setIsManualWeather(true)
    setShowManualInput(false)
    setShowCityInput(false)
    setCoords(null)
    setCityQuery('')
  }

  const openManualInput = () => {
    setShowManualInput(true)
    setShowCityInput(false)
    setTimeout(() => manualTempRef.current?.focus(), 50)
  }

  const openCityInput = () => {
    setShowCityInput(true)
    setShowManualInput(false)
    setTimeout(() => cityInputRef.current?.focus(), 50)
  }

  const toggleItem = (cat: Category) =>
    setSelectedItems(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const canRecommend =
    !!activity &&
    !weatherLoading &&
    (!!coords || !!cityQuery || isManualWeather) &&
    selectedItems.length > 0 &&
    !wardrobeEmpty

  const handleRecommend = () => {
    if (!activity || !canRecommend) return
    const itemsParam = selectedItems.join(',')
    if (isManualWeather && weather) {
      sessionStorage.setItem('manualWeather', JSON.stringify(weather))
      router.push(`/result?activity=${activity}&manual=1&items=${itemsParam}`)
    } else if (coords) {
      router.push(`/result?activity=${activity}&lat=${coords.lat}&lon=${coords.lon}&items=${itemsParam}`)
    } else {
      router.push(`/result?activity=${activity}&city=${encodeURIComponent(cityQuery)}&items=${itemsParam}`)
    }
  }

  if (!authReady) {
    return (
      <div className="page-container items-center justify-center">
        <div className="flex gap-3">
          {['👗', '🌤', '✨', '👟', '🧥'].map((emoji, i) => (
            <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
              {emoji}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <TopNav />

      {/* Weather bar */}
      <div className="border-b-2 border-black px-12">
        {weatherLoading ? (
          <div className="py-5 flex items-center gap-3">
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : weather ? (
          <div className="py-5 flex items-center gap-6 flex-wrap">
            {isManualWeather ? (
              <span className="text-xs font-extrabold text-point tracking-widest uppercase border border-point rounded px-2 py-0.5">
                직접 입력
              </span>
            ) : (
              <span className="font-black text-black text-xl tracking-widest uppercase">{weather.city}</span>
            )}
            <span className="font-black text-black text-4xl leading-none">{weather.temp}°</span>
            <span className="text-[#333333] text-base font-normal">{weather.weather_desc}</span>
            <span className="text-[#333333] text-base font-normal">습도 {weather.humidity}%</span>
            <span className="text-[#333333] text-base font-normal">풍속 {weather.wind_speed}m/s</span>
            <div className="ml-auto flex items-center gap-3">
              {(cityQuery || isManualWeather) && homeCoords.current && (
                <button
                  onClick={goToMyLocation}
                  className="text-sm text-accent font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  내 위치로
                </button>
              )}
              {!isManualWeather && (
                <button
                  onClick={openCityInput}
                  className="px-4 py-2 border-2 border-gray-300 rounded text-sm font-bold text-black hover:border-black transition-colors"
                >
                  도시 변경
                </button>
              )}
              <button
                onClick={isManualWeather ? openManualInput : openManualInput}
                className="px-4 py-2 border-2 border-black rounded text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
              >
                {isManualWeather ? '날씨 수정' : '직접 입력'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-5 flex items-center justify-between">
            <span className="text-[#333333] text-base font-normal">위치 권한을 허용해주세요</span>
            <div className="flex items-center gap-3">
              <button onClick={openCityInput}
                className="px-4 py-2 border-2 border-gray-300 rounded text-sm font-bold text-black hover:border-black transition-colors">
                도시 입력
              </button>
              <button onClick={openManualInput}
                className="px-4 py-2 border-2 border-black rounded text-sm font-bold text-black hover:bg-black hover:text-white transition-colors">
                직접 입력
              </button>
            </div>
          </div>
        )}

        {/* City input slide-down */}
        <div style={{ display: 'grid', gridTemplateRows: showCityInput ? '1fr' : '0fr', transition: 'grid-template-rows 250ms ease' }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="pb-4 flex gap-3">
              <input
                ref={cityInputRef}
                type="text"
                value={cityInput}
                onChange={e => { setCityInput(e.target.value); setCityError('') }}
                onKeyDown={e => e.key === 'Enter' && fetchWeatherByCity(cityInput)}
                placeholder="도시명 입력 (예: 광주, 부산)"
                className={`flex-1 text-base bg-white border-2 rounded px-4 py-3 focus:outline-none focus:border-accent font-normal ${cityError ? 'border-red-400' : 'border-gray-200'}`}
              />
              <button onClick={() => fetchWeatherByCity(cityInput)}
                className="px-6 py-3 bg-accent text-white text-base rounded font-bold hover:bg-accent-dark transition-colors">
                확인
              </button>
              <button onClick={() => { setShowCityInput(false); setCityError(''); setCityInput('') }}
                className="px-4 py-3 text-[#333333] text-base rounded border-2 border-gray-200 font-bold hover:border-black transition-colors">
                ✕
              </button>
            </div>
            {cityError && <p className="text-sm text-red-500 font-medium pb-3">{cityError}</p>}
          </div>
        </div>

        {/* Manual weather input slide-down */}
        <div style={{ display: 'grid', gridTemplateRows: showManualInput ? '1fr' : '0fr', transition: 'grid-template-rows 250ms ease' }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="pb-4 flex flex-col gap-3">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    ref={manualTempRef}
                    type="number"
                    value={manualTemp}
                    onChange={e => setManualTemp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyManualWeather()}
                    placeholder="온도"
                    className="w-28 text-base bg-white border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-accent font-normal"
                  />
                  <span className="text-xl font-black text-black">°C</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {MANUAL_CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setManualCondition(c.value)}
                      className={`px-4 py-3 rounded border-2 text-sm font-bold transition-colors
                        ${manualCondition === c.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-black hover:border-black'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={applyManualWeather}
                  disabled={!manualTemp.trim()}
                  className="px-6 py-3 bg-accent text-white text-base rounded font-bold hover:bg-accent-dark transition-colors disabled:opacity-40"
                >
                  적용
                </button>
                <button
                  onClick={() => { setShowManualInput(false); setManualTemp('') }}
                  className="px-4 py-3 text-[#333333] text-base rounded border-2 border-gray-200 font-bold hover:border-black transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#333333] font-normal">
                온도를 입력하고 날씨 조건을 선택하면 그에 맞는 코디를 추천해드려요
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-12 py-10 flex flex-col gap-8">

        {/* ① Activity grid */}
        <div>
          <h2 className="text-2xl font-extrabold text-black mb-5">오늘 어디 가세요?</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACTIVITIES.map(act => (
              <button
                key={act}
                onClick={() => setActivity(act === activity ? null : act)}
                className={`flex items-center gap-4 px-6 py-5 rounded border-2 transition-all duration-150 text-left
                  ${activity === act
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-black hover:border-black'
                  }`}
              >
                <span className="text-2xl flex-shrink-0">{ACTIVITY_ICONS[act]}</span>
                <div className="min-w-0">
                  <p className={`text-base font-extrabold leading-tight ${activity === act ? 'text-white' : 'text-black'}`}>
                    {ACTIVITY_LABELS[act]}
                  </p>
                  <p className={`text-xs font-normal leading-tight mt-0.5 truncate ${activity === act ? 'text-gray-300' : 'text-[#333333]'}`}>
                    {ACTIVITY_DESCRIPTIONS[act]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ② Item selection — slide down */}
        <div style={{ display: 'grid', gridTemplateRows: activity ? '1fr' : '0fr', transition: 'grid-template-rows 300ms ease' }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="border-t-2 border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-extrabold text-black">어떤 아이템 골라드릴까요?</h2>
                <button
                  onClick={() => setSelectedItems([...ALL_ITEMS])}
                  className="px-5 py-2.5 border-2 border-black rounded text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
                >
                  전체 코디 한번에
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {ALL_ITEMS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleItem(cat)}
                    className={`flex items-center gap-2 px-6 py-4 rounded border-2 text-base font-bold transition-all
                      ${selectedItems.includes(cat)
                        ? 'border-accent text-accent bg-white'
                        : 'border-gray-200 text-[#333333] bg-white hover:border-gray-400'
                      }`}
                  >
                    <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 text-xs
                      ${selectedItems.includes(cat) ? 'border-accent bg-accent text-white' : 'border-gray-300'}`}>
                      {selectedItems.includes(cat) ? '✓' : ''}
                    </span>
                    {ITEM_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ③ Recommend button */}
        <div className="mt-auto pt-4 flex flex-col gap-3">
          {wardrobeEmpty && (
            <div className="flex items-center justify-between gap-4 border-2 border-gray-200 rounded px-5 py-4 bg-gray-50">
              <p className="text-base text-[#333333] font-normal">
                등록된 옷이 없어요. 옷 사진을 먼저 등록해주세요 👗
              </p>
              <button
                className="px-5 py-3 bg-black text-white text-sm font-bold rounded flex-shrink-0 hover:bg-[#333333] transition-colors"
                onClick={() => router.push('/wardrobe/add')}
              >
                옷장 등록하러 가기
              </button>
            </div>
          )}
          <button
            className="btn-primary text-lg py-5 w-full"
            disabled={!canRecommend}
            onClick={handleRecommend}
          >
            {weatherLoading
              ? '날씨 불러오는 중...'
              : !activity
              ? '활동을 선택해주세요'
              : selectedItems.length === 0
              ? '아이템을 선택해주세요'
              : '추천 받기 →'}
          </button>
        </div>

      </main>
    </div>
  )
}
