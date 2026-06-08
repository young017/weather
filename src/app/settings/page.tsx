'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_DESCRIPTIONS,
  PERSONAL_COLOR_SWATCHES,
  GENDER_LABELS,
} from '@/lib/constants'
import type { PersonalColor, Gender, Profile } from '@/types'

const PERSONAL_COLORS: PersonalColor[] = ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool']
const GENDERS: Gender[] = ['male', 'female', 'neutral']

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [personalColor, setPersonalColor] = useState<PersonalColor | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setPersonalColor(data.personal_color)
        setGender(data.gender)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    if (!personalColor || !gender) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase
      .from('profiles')
      .update({ personal_color: personalColor, gender })
      .eq('id', user.id)

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="page-container items-center justify-center">
        <div className="text-3xl animate-bounce">⚙️</div>
      </div>
    )
  }

  const hasChanged =
    personalColor !== profile?.personal_color || gender !== profile?.gender

  return (
    <div className="page-container pb-24">
      <header className="page-header flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-500 text-lg p-1">←</button>
        <h1 className="font-bold text-gray-900">설정</h1>
      </header>

      <div className="px-4 mt-4 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">퍼스널 컬러</h2>
          <div className="space-y-2">
            {PERSONAL_COLORS.map(pc => (
              <button
                key={pc}
                onClick={() => setPersonalColor(pc)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-[0.98]
                  ${personalColor === pc
                    ? 'border-accent bg-orange-50'
                    : 'border-gray-100 bg-white'
                  }`}
              >
                <div className="flex gap-1">
                  {PERSONAL_COLOR_SWATCHES[pc].map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${personalColor === pc ? 'text-accent' : 'text-gray-800'}`}>
                    {PERSONAL_COLOR_LABELS[pc]}
                  </p>
                  <p className="text-xs text-gray-400">{PERSONAL_COLOR_DESCRIPTIONS[pc]}</p>
                </div>
                {personalColor === pc && <span className="text-accent">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">성별</h2>
          <div className="flex gap-2">
            {GENDERS.map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95
                  ${gender === g
                    ? 'border-accent bg-orange-50 text-accent'
                    : 'border-gray-100 bg-white text-gray-700'
                  }`}
              >
                {GENDER_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        {hasChanged && (
          <button
            className="btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saved ? '저장됐어요 ✓' : saving ? '저장 중...' : '변경사항 저장'}
          </button>
        )}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-gray-100 bg-white flex">
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
          onClick={() => router.push('/')}
        >
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
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-accent">
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-medium">설정</span>
        </button>
      </nav>
    </div>
  )
}
