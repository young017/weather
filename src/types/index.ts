export type PersonalColor = 'spring_warm' | 'summer_cool' | 'autumn_warm' | 'winter_cool'
export type Gender = 'male' | 'female' | 'neutral'
export type Category = 'top' | 'bottom' | 'outer' | 'shoes' | 'accessory'
export type Style = 'casual' | 'formal' | 'sporty' | 'street' | 'minimal' | 'vintage' | 'chic' | 'girly' | 'boyish' | 'classic' | 'romantic' | 'preppy'
export type Season = 'summer' | 'spring_autumn' | 'winter'
export type Activity = 'daily' | 'office' | 'formal' | 'active' | 'date' | 'nightout'

export interface Profile {
  id: string
  personal_color: PersonalColor
  gender: Gender
  liked_styles: string[]
  disliked_styles: string[]
  created_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  image_url: string
  category: Category
  colors: string[]
  style: Style[]
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
  weather_condition: string
  humidity: number
  wind_speed: number
  city: string
}

export interface ClothingAnalysis {
  category: Category
  colors: string[]
  style: Style[]
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
  usedFallback: boolean
  missingCategories: Category[]
  allMissing: boolean
}
