'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_DESCRIPTIONS,
  PERSONAL_COLOR_SWATCHES,
  GENDER_LABELS,
} from '@/lib/constants'
import type { PersonalColor, Gender } from '@/types'

const PERSONAL_COLORS: PersonalColor[] = ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool']
const GENDERS: Gender[] = ['male', 'female', 'neutral']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [personalColor, setPersonalColor] = useState<PersonalColor | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [saving, setSaving] = useState(false)

  const handleComplete = async () => {
    if (!personalColor || !gender) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const { data } = await supabase.auth.signInAnonymously()
      if (!data.user) { setSaving(false); return }
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { setSaving(false); return }

    await supabase.from('profiles').upsert({
      id: currentUser.id,
      personal_color: personalColor,
      gender,
    })

    router.replace('/')
  }

  return (
    <div className="page-container px-4 py-8">
      <div className="mb-8">
        <div className="flex gap-1 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-gray-200'}`} />
        </div>
        <p className="text-sm text-gray-400 font-medium">STEP {step} / 2</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {step === 1 ? '퍼스널 컬러를\n알려주세요' : '성별을\n선택해주세요'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">
          {step === 1
            ? '어울리는 색상 계열을 선택하면\n더 정확한 코디를 추천해드려요'
            : '추천 스타일에 반영됩니다'}
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-3 flex-1">
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
                    className="w-6 h-6 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${personalColor === pc ? 'text-accent' : 'text-gray-800'}`}>
                  {PERSONAL_COLOR_LABELS[pc]}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{PERSONAL_COLOR_DESCRIPTIONS[pc]}</p>
              </div>
              {personalColor === pc && (
                <span className="text-accent text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="flex gap-3 flex-1">
          {GENDERS.map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-6 rounded-2xl border-2 font-semibold text-base transition-all duration-150 active:scale-95
                ${gender === g
                  ? 'border-accent bg-orange-50 text-accent'
                  : 'border-gray-100 bg-white text-gray-700'
                }`}
            >
              {GENDER_LABELS[g]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-2">
        {step === 1 ? (
          <button
            className="btn-primary"
            disabled={!personalColor}
            onClick={() => setStep(2)}
          >
            다음
          </button>
        ) : (
          <>
            <button
              className="btn-primary"
              disabled={!gender || saving}
              onClick={handleComplete}
            >
              {saving ? '저장 중...' : '시작하기'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setStep(1)}
            >
              이전
            </button>
          </>
        )}
      </div>
    </div>
  )
}
