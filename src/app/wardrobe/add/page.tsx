'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ClothingAnalysis, Category, Style, Season } from '@/types'
import { CATEGORY_LABELS, STYLE_LABELS, SEASON_LABELS } from '@/lib/constants'

const CATEGORIES: Category[] = ['top', 'bottom', 'outer', 'shoes', 'accessory']
const STYLES: Style[] = ['casual', 'formal', 'sporty', 'street', 'minimal']
const SEASONS: Season[] = ['spring_summer', 'autumn_winter', 'all_season']

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
      setAnalysis(data)
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
    <div className="page-container pb-8">
      <header className="page-header flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 text-lg p-1">←</button>
        <h1 className="font-bold text-gray-900">옷 등록</h1>
      </header>

      <div className="px-4 mt-4 space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {!previewUrl ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className="text-4xl">📸</span>
            <p className="text-sm font-medium text-gray-600">사진을 선택하세요</p>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
          </button>
        ) : (
          <div className="relative">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image src={previewUrl} alt="업로드 이미지" fill className="object-cover" />
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs rounded-full"
            >
              다시 선택
            </button>
          </div>
        )}

        {analyzing && (
          <div className="card flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg animate-spin">
              🔄
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">AI가 분석 중이에요...</p>
              <p className="text-xs text-gray-400">잠시만 기다려주세요</p>
            </div>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {analysis && !analyzing && (
          <div className="card space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <h2 className="text-sm font-semibold text-gray-700">AI 분석 결과</h2>
              <span className="text-xs text-gray-400 ml-auto">수정 가능</span>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">종류</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setAnalysis({ ...analysis, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                      ${analysis.category === cat
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">스타일</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setAnalysis({ ...analysis, style: s })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                      ${analysis.style === s
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
                  >
                    {STYLE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">계절</label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setAnalysis({ ...analysis, season: s })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                      ${analysis.season === s
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
                  >
                    {SEASON_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">색상</label>
              <p className="text-sm text-gray-700">{analysis.colors.join(', ')}</p>
            </div>

            {analysis.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">설명</label>
                <input
                  type="text"
                  value={analysis.description}
                  onChange={e => setAnalysis({ ...analysis, description: e.target.value })}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        )}

        {analysis && !analyzing && (
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? '저장 중...' : '내 옷장에 저장'}
          </button>
        )}
      </div>
    </div>
  )
}
