import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: '위치 정보가 필요합니다' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`,
    { next: { revalidate: 600 } }
  )

  if (!res.ok) {
    return NextResponse.json({ error: '날씨 정보를 가져올 수 없습니다' }, { status: 502 })
  }

  const data = await res.json()

  return NextResponse.json({
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    weather_desc: data.weather[0].description,
    weather_icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    city: data.name,
  })
}
