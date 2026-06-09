'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ClothingAnalysis, Category, Style, Season } from '@/types'
import { CATEGORY_LABELS, STYLE_LABELS, SEASON_LABELS } from '@/lib/constants'

const CATEGORIES: Category[] = ['top', 'bottom', 'outer', 'shoes', 'accessory']
const STYLES: Style[] = ['casual', 'minimal', 'street', 'sporty', 'formal', 'vintage', 'chic', 'girly', 'boyish', 'classic', 'romantic', 'preppy']
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

export default function AddWardrobePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAnalysis(null)
    setError(null)
    setAnalyzing(true)

    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch('/api/wardrobe/analyze', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? '분석에 실패했습니다')
    } else {
      setAnalysis({
        ...data,
        style: Array.isArray(data.style) ? data.style : [data.style],
        season: Array.isArray(data.season) ? data.season : [data.season],
      })
    }
    setAnalyzing(false)
  }

  const handleSave = async () => {
    if (!imageFile || !analysis) return
    setSaving(true)

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('analysis', JSON.stringify(analysis))

    const res = await fetch('/api/wardrobe', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? '저장에 실패했습니다')
      setSaving(false)
    } else {
      router.push('/wardrobe')
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b-2 border-black px-12 py-0 flex items-center">
        <button onClick={() => router.back()} className="text-black font-bold text-2xl py-5 pr-6 border-r-2 border-gray-200 mr-6">←</button>
        <h1 className="font-black text-black text-xl">옷 등록</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-12 py-10">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        <div className="grid grid-cols-2 gap-12">

          {/* LEFT: Image upload */}
          <div className="flex flex-col gap-4">
            {!previewUrl ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full aspect-square rounded border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 bg-white hover:border-accent hover:bg-gray-50 transition-colors"
              >
                <p className="text-xl font-extrabold text-black">사진 선택</p>
                <p className="text-base text-[#333333] font-normal">JPG, PNG, WEBP</p>
              </button>
            ) : (
              <div className="relative">
                <div className="relative w-full aspect-square rounded overflow-hidden bg-gray-100 border border-gray-200">
                  <Image src={previewUrl} alt="업로드 이미지" fill className="object-cover" />
                </div>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="absolute top-4 right-4 px-4 py-2 bg-black text-white text-sm rounded font-bold hover:bg-[#333333] transition-colors"
                >
                  다시 선택
                </button>
              </div>
            )}

            {analyzing && (
              <div className="card flex items-center gap-5 py-5">
                <div className="w-3 h-3 rounded-full bg-accent animate-ping flex-shrink-0" />
                <div>
                  <p className="text-base font-extrabold text-black">AI가 분석 중이에요...</p>
                  <p className="text-sm text-[#333333] font-normal">잠시만 기다려주세요</p>
                </div>
              </div>
            )}

            {error && (
              <div className="border-2 border-point rounded p-5">
                <p className="text-base text-point font-bold">{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Analysis + Save */}
          <div className="flex flex-col gap-5">
            {analysis && !analyzing ? (
              <>
                <div className="card space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold text-[#333333] tracking-widest uppercase">AI 분석 결과</h2>
                    <span className="text-sm text-[#333333] font-normal">수정 가능</span>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">종류</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setAnalysis({ ...analysis, category: cat })}
                          className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                            ${analysis.category === cat
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-black border-gray-200 hover:border-accent'
                            }`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">스타일 <span className="text-accent font-normal normal-case tracking-normal">(중복 선택 가능)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            const cur = analysis.style as Style[]
                            const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]
                            if (next.length > 0) setAnalysis({ ...analysis, style: next })
                          }}
                          className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                            ${(analysis.style as Style[]).includes(s)
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-black border-gray-200 hover:border-accent'
                            }`}
                        >
                          {STYLE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">계절 <span className="text-accent font-normal normal-case tracking-normal">(중복 선택 가능)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            const cur = analysis.season as Season[]
                            const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]
                            if (next.length > 0) setAnalysis({ ...analysis, season: next })
                          }}
                          className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                            ${(analysis.season as Season[]).includes(s)
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-black border-gray-200 hover:border-accent'
                            }`}
                        >
                          {SEASON_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">색상</label>
                    <p className="text-base text-black font-normal">{analysis.colors.join(', ')}</p>
                  </div>

                  {analysis.description && (
                    <div>
                      <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">설명</label>
                      <input
                        type="text"
                        value={analysis.description}
                        onChange={e => setAnalysis({ ...analysis, description: e.target.value })}
                        className="w-full text-base text-black font-normal bg-white border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                </div>

                <button className="btn-primary py-5 text-lg" disabled={saving} onClick={handleSave}>
                  {saving ? '저장 중...' : '내 옷장에 저장'}
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-[#333333]">
                <p className="text-base font-normal">사진을 선택하면<br />AI가 자동으로 분석해드려요</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
