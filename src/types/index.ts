export type PersonalColor = 'spring_warm' | 'summer_cool' | 'autumn_warm' | 'winter_cool'
export type Gender = 'male' | 'female' | 'neutral'
export type Category = 'top' | 'bottom' | 'outer' | 'shoes' | 'accessory'
export type Style = 'casual' | 'formal' | 'sporty' | 'street' | 'minimal'
export type Season = 'spring_summer' | 'autumn_winter' | 'all_season'
export type Activity = 'formal' | 'office' | 'daily' | 'active' | 'nightout' | 'homewear'

export interface Profile {
  id: string
  personal_color: PersonalColor
  gender: Gender
  created_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  image_url: string
  category: Category
  colors: string[]
  style: Style
  material: string | null
  season: Season
  description: string | null
  created_at: string
  deleted_at: string | null
}

export interface WeatherData {
  temp: number
  feels_like: number
  weather_desc: string
  weather_icon: string
  humidity: number
  wind_speed: number
  city: string
}

export interface ClothingAnalysis {
  category: Category
  colors: string[]
  style: Style
  material: string | null
  season: Season
  description: string
}

export interface Recommendation {
  top: WardrobeItem | null
  bottom: WardrobeItem | null
  outer: WardrobeItem | null
  shoes: WardrobeItem | null
  accessories: WardrobeItem[]
  reason: string
  tips: string[]
}
