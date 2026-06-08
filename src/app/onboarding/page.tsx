'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  PERSONAL_COLOR_LABELS,
  PERSONAL_COLOR_DESCRIPTIONS,
  PERSONAL_COLOR_SWATCHES,
  STYLE_KEYWORDS,
} from '@/lib/constants'
import type { PersonalColor, Gender } from '@/types'

const PERSONAL_COLORS: PersonalColor[] = ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool']
const MAX_STYLE_PICKS = 3

const GENDER_OPTIONS: { value: Gender; label: string; desc: string }[] = [
  { value: 'male',    label: '남성',    desc: '남성 패션 기준으로 추천' },
  { value: 'female',  label: '여성',    desc: '여성 패션 기준으로 추천' },
  { value: 'neutral', label: '상관없음', desc: '성별 구분 없이 추천' },
]

type Step = 'intro' | 'gender' | 'color' | 'liked' | 'disliked'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('intro')

  useEffect(() => {
    const s = searchParams.get('step')
    if (s === 'gender') setStep('gender')
    else if (s === 'color') setStep('color')
  }, [searchParams])

  const [gender, setGender] = useState<Gender | null>(null)
  const [personalColor, setPersonalColor] = useState<PersonalColor | null>(null)
  const [likedStyles, setLikedStyles] = useState<string[]>([])
  const [dislikedStyles, setDislikedStyles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

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

  const handleComplete = async () => {
    if (!personalColor) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      personal_color: personalColor,
      gender: gender ?? 'neutral',
      liked_styles: likedStyles,
      disliked_styles: dislikedStyles,
    })

    router.replace('/')
  }

  const STEP_INDEX: Record<Exclude<Step, 'intro'>, number> = { gender: 1, color: 2, liked: 3, disliked: 4 }
  const TOTAL_STEPS = 4

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-7xl font-black text-black tracking-tight mb-6">몇 도야 ?</h1>
          <p className="text-xl text-[#333333] font-normal leading-relaxed mb-12">
            내 옷장에서 오늘의 날씨를, 오늘의 옷차림으로.<br />
            <span className="font-extrabold text-black">매일 아침 5분을 당신께 돌려드립니다.</span>
          </p>

          <div className="grid grid-cols-2 gap-4 mb-12">
            {[
              { label: '날씨 자동 감지', desc: '오늘 기온과 날씨를 바로 불러와요' },
              { label: '내 옷장 기반 추천', desc: '범용 추천이 아닌 내가 가진 옷으로' },
              { label: '퍼스널 컬러 반영', desc: '나에게 어울리는 색상 우선 추천' },
              { label: '스타일 선호도 반영', desc: '좋아하는 스타일로, 싫은 건 절대 안 입어요' },
            ].map(item => (
              <div key={item.label} className="border-2 border-gray-200 rounded p-6">
                <span className="block w-2 h-2 rounded-full bg-accent mb-4" />
                <p className="font-extrabold text-black text-base mb-1">{item.label}</p>
                <p className="text-sm text-[#333333] font-normal leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <button
            className="btn-primary flex items-center justify-center gap-3 py-5 text-lg"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? '연결 중...' : 'Google로 시작하기'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 py-16">
      <div className="w-full max-w-3xl">
        {/* 진행 바 */}
        <div className="mb-10">
          <div className="flex gap-1 mb-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors duration-300
                  ${i < STEP_INDEX[step as Exclude<Step, 'intro'>] ? 'bg-accent' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-xs font-bold tracking-widest text-[#333333] uppercase">
            STEP {STEP_INDEX[step as Exclude<Step, 'intro'>]} / {TOTAL_STEPS}
          </p>
        </div>

        {/* 성별 */}
        {step === 'gender' && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-black text-black leading-tight">성별이<br />어떻게 되세요?</h1>
              <p className="text-base text-[#333333] font-normal mt-3">추천 코디 방향을 잡는 데 참고해요</p>
            </div>
            <div className="flex flex-col gap-3">
              {GENDER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={`flex items-center justify-between px-6 py-5 rounded border-2 text-left transition-all duration-150 hover:border-accent
                    ${gender === opt.value ? 'border-accent' : 'border-gray-200'}`}
                >
                  <div>
                    <p className={`font-extrabold text-lg ${gender === opt.value ? 'text-accent' : 'text-black'}`}>{opt.label}</p>
                    <p className="text-sm text-[#333333] font-normal mt-0.5">{opt.desc}</p>
                  </div>
                  {gender === opt.value && <span className="text-accent font-black text-xl">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-10">
              <button className="btn-primary py-5 text-lg" disabled={!gender} onClick={() => setStep('color')}>
                다음 →
              </button>
            </div>
          </>
        )}

        {/* 퍼스널 컬러 */}
        {step === 'color' && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-black text-black leading-tight">퍼스널 컬러가<br />어떻게 되세요?</h1>
              <p className="text-base text-[#333333] font-normal mt-3">어울리는 색상 계열을 선택해주세요</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {PERSONAL_COLORS.map(pc => (
                <button
                  key={pc}
                  onClick={() => setPersonalColor(pc)}
                  className={`flex items-center gap-5 p-6 rounded border-2 text-left transition-all duration-150 hover:border-accent
                    ${personalColor === pc ? 'border-accent bg-white' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex gap-1.5">
                    {PERSONAL_COLOR_SWATCHES[pc].map((color, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className={`font-extrabold text-base ${personalColor === pc ? 'text-accent' : 'text-black'}`}>
                      {PERSONAL_COLOR_LABELS[pc]}
                    </p>
                    <p className="text-sm text-[#333333] font-normal mt-0.5">{PERSONAL_COLOR_DESCRIPTIONS[pc]}</p>
                  </div>
                  {personalColor === pc && <span className="text-accent font-black">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-10">
              <button className="btn-secondary py-5 text-lg" onClick={() => setStep('gender')}>← 이전</button>
              <button className="btn-primary py-5 text-lg" disabled={!personalColor} onClick={() => setStep('liked')}>
                다음 →
              </button>
            </div>
          </>
        )}

        {/* 좋아하는 스타일 */}
        {step === 'liked' && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-black text-black leading-tight">좋아하는 스타일을<br />골라주세요</h1>
              <p className="text-base text-[#333333] font-normal mt-3">
                최대 3개 선택
                <span className={`ml-2 font-extrabold ${likedStyles.length === MAX_STYLE_PICKS ? 'text-accent' : 'text-[#333333]'}`}>
                  {likedStyles.length}/{MAX_STYLE_PICKS}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {STYLE_KEYWORDS.map(kw => {
                const isSelected = likedStyles.includes(kw.id)
                const isExcluded = dislikedStyles.includes(kw.id)
                return (
                  <button
                    key={kw.id}
                    onClick={() => toggleStyle(kw.id, likedStyles, setLikedStyles, dislikedStyles)}
                    disabled={isExcluded}
                    className={`flex flex-col items-center py-6 px-3 rounded border-2 transition-all duration-150 hover:border-accent
                      ${isSelected ? 'border-accent bg-white' : isExcluded ? 'border-gray-100 bg-gray-50 opacity-30' : 'border-gray-200 bg-white'}
                      ${!isSelected && likedStyles.length >= MAX_STYLE_PICKS && !isExcluded ? 'opacity-50' : ''}`}
                  >
                    <span className="text-2xl mb-2">{kw.emoji}</span>
                    <span className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-black'}`}>{kw.label}</span>
                    <span className="text-xs text-[#333333] text-center leading-tight mt-1 font-normal">{kw.desc}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-10">
              <button className="btn-secondary py-5 text-lg" onClick={() => setStep('color')}>← 이전</button>
              <button className="btn-primary py-5 text-lg" disabled={likedStyles.length === 0} onClick={() => setStep('disliked')}>
                다음 →
              </button>
            </div>
          </>
        )}

        {/* 싫어하는 스타일 */}
        {step === 'disliked' && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-black text-black leading-tight">절대 싫은 스타일은<br />뭔가요?</h1>
              <p className="text-base text-[#333333] font-normal mt-3">
                최대 3개 선택
                <span className={`ml-2 font-extrabold ${dislikedStyles.length === MAX_STYLE_PICKS ? 'text-point' : 'text-[#333333]'}`}>
                  {dislikedStyles.length}/{MAX_STYLE_PICKS}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {STYLE_KEYWORDS.map(kw => {
                const isSelected = dislikedStyles.includes(kw.id)
                const isExcluded = likedStyles.includes(kw.id)
                return (
                  <button
                    key={kw.id}
                    onClick={() => toggleStyle(kw.id, dislikedStyles, setDislikedStyles, likedStyles)}
                    disabled={isExcluded}
                    className={`flex flex-col items-center py-6 px-3 rounded border-2 transition-all duration-150 hover:border-point
                      ${isSelected ? 'border-point bg-white' : isExcluded ? 'border-gray-100 bg-gray-50 opacity-30' : 'border-gray-200 bg-white'}
                      ${!isSelected && dislikedStyles.length >= MAX_STYLE_PICKS && !isExcluded ? 'opacity-50' : ''}`}
                  >
                    <span className="text-2xl mb-2">{kw.emoji}</span>
                    <span className={`text-sm font-bold ${isSelected ? 'text-point' : 'text-black'}`}>{kw.label}</span>
                    <span className="text-xs text-[#333333] text-center leading-tight mt-1 font-normal">{kw.desc}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-10">
              <button className="btn-secondary py-5 text-lg" onClick={() => setStep('liked')}>← 이전</button>
              <button className="btn-primary py-5 text-lg" disabled={saving} onClick={handleComplete}>
                {saving ? '저장 중...' : '완료'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
