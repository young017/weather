'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_DESCRIPTIONS,
  PERSONAL_COLOR_SWATCHES,
  GENDER_LABELS,
  STYLE_KEYWORDS,
} from '@/lib/constants'
import { TopNav } from '@/components/TopNav'
import type { PersonalColor, Gender, Profile } from '@/types'

const PERSONAL_COLORS: PersonalColor[] = ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool']
const GENDERS: Gender[] = ['male', 'female', 'neutral']
const MAX_STYLE_PICKS = 3

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [personalColor, setPersonalColor] = useState<PersonalColor | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [likedStyles, setLikedStyles] = useState<string[]>([])
  const [dislikedStyles, setDislikedStyles] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setPersonalColor(data.personal_color)
        setGender(data.gender)
        setLikedStyles(data.liked_styles ?? [])
        setDislikedStyles(data.disliked_styles ?? [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  const toggleStyle = (
    id: string,
    selected: string[],
    setSelected: (s: string[]) => void,
    excluded: string[]
  ) => {
    if (excluded.includes(id)) return
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < MAX_STYLE_PICKS) {
      setSelected([...selected, id])
    }
  }

  const handleSave = async () => {
    if (!personalColor || !gender) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('profiles').update({
      personal_color: personalColor,
      gender,
      liked_styles: likedStyles,
      disliked_styles: dislikedStyles,
    }).eq('id', user.id)

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="page-container items-center justify-center">
        <p className="text-2xl font-black text-black animate-pulse">몇 도야 ?</p>
      </div>
    )
  }

  const hasChanged =
    personalColor !== profile?.personal_color ||
    gender !== profile?.gender ||
    JSON.stringify(likedStyles) !== JSON.stringify(profile?.liked_styles ?? []) ||
    JSON.stringify(dislikedStyles) !== JSON.stringify(profile?.disliked_styles ?? [])

  return (
    <div className="page-container">
      <TopNav />

      <main className="flex-1 px-12 py-10">
        <div className="grid grid-cols-2 gap-16">

          {/* LEFT: Personal Color + Gender */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-5">퍼스널 컬러</h2>
              <div className="grid grid-cols-2 gap-3">
                {PERSONAL_COLORS.map(pc => (
                  <button
                    key={pc}
                    onClick={() => setPersonalColor(pc)}
                    className={`flex flex-col gap-3 p-5 rounded border-2 text-left transition-all duration-150 hover:border-accent
                      ${personalColor === pc ? 'border-accent bg-white' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex gap-1.5">
                      {PERSONAL_COLOR_SWATCHES[pc].map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div>
                      <p className={`text-base font-extrabold ${personalColor === pc ? 'text-accent' : 'text-black'}`}>
                        {PERSONAL_COLOR_LABELS[pc]}
                      </p>
                      <p className="text-sm text-[#333333] font-normal mt-0.5">{PERSONAL_COLOR_DESCRIPTIONS[pc]}</p>
                    </div>
                    {personalColor === pc && <span className="text-accent font-black text-sm self-end">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-5">성별</h2>
              <div className="flex gap-3">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-4 rounded border-2 font-extrabold text-base transition-all hover:border-accent
                      ${gender === g ? 'border-accent text-accent bg-white' : 'border-gray-200 bg-white text-black'}`}
                  >
                    {GENDER_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-200">
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.replace('/onboarding')
                }}
                className="w-full py-4 text-base text-point font-extrabold rounded border-2 border-point hover:bg-point hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* RIGHT: Liked + Disliked styles + Save */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-1">좋아하는 스타일</h2>
              <p className="text-sm text-[#333333] font-normal mb-4">
                최대 3개
                <span className={`ml-2 font-extrabold ${likedStyles.length === MAX_STYLE_PICKS ? 'text-accent' : ''}`}>
                  ({likedStyles.length}/{MAX_STYLE_PICKS})
                </span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {STYLE_KEYWORDS.map(kw => {
                  const isSelected = likedStyles.includes(kw.id)
                  const isExcluded = dislikedStyles.includes(kw.id)
                  return (
                    <button
                      key={kw.id}
                      onClick={() => toggleStyle(kw.id, likedStyles, setLikedStyles, dislikedStyles)}
                      disabled={isExcluded}
                      className={`flex flex-col items-center py-4 rounded border-2 text-sm transition-all hover:border-accent
                        ${isSelected ? 'border-accent text-accent font-extrabold bg-white' : isExcluded ? 'opacity-30 border-gray-100 bg-gray-50' : 'border-gray-200 bg-white text-black font-bold'}
                        ${!isSelected && likedStyles.length >= MAX_STYLE_PICKS && !isExcluded ? 'opacity-40' : ''}`}
                    >
                      <span className="text-xl mb-1">{kw.emoji}</span>
                      {kw.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-1">절대 싫은 스타일</h2>
              <p className="text-sm text-[#333333] font-normal mb-4">
                최대 3개
                <span className={`ml-2 font-extrabold ${dislikedStyles.length === MAX_STYLE_PICKS ? 'text-point' : ''}`}>
                  ({dislikedStyles.length}/{MAX_STYLE_PICKS})
                </span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {STYLE_KEYWORDS.map(kw => {
                  const isSelected = dislikedStyles.includes(kw.id)
                  const isExcluded = likedStyles.includes(kw.id)
                  return (
                    <button
                      key={kw.id}
                      onClick={() => toggleStyle(kw.id, dislikedStyles, setDislikedStyles, likedStyles)}
                      disabled={isExcluded}
                      className={`flex flex-col items-center py-4 rounded border-2 text-sm transition-all hover:border-point
                        ${isSelected ? 'border-point text-point font-extrabold bg-white' : isExcluded ? 'opacity-30 border-gray-100 bg-gray-50' : 'border-gray-200 bg-white text-black font-bold'}
                        ${!isSelected && dislikedStyles.length >= MAX_STYLE_PICKS && !isExcluded ? 'opacity-40' : ''}`}
                    >
                      <span className="text-xl mb-1">{kw.emoji}</span>
                      {kw.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasChanged && (
              <button className="btn-primary py-5 text-lg" disabled={saving} onClick={handleSave}>
                {saved ? '저장됐어요 ✓' : saving ? '저장 중...' : '변경사항 저장'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
