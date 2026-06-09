'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import type { WardrobeItem, Category, Style, Season } from '@/types'
import { CATEGORY_LABELS, STYLE_LABELS, SEASON_LABELS } from '@/lib/constants'

const CATEGORIES: Category[] = ['top', 'bottom', 'outer', 'shoes', 'accessory']
const STYLES: Style[] = ['casual', 'minimal', 'street', 'sporty', 'formal', 'vintage', 'chic', 'girly', 'boyish', 'classic', 'romantic', 'preppy']
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

export default function EditWardrobePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [item, setItem] = useState<WardrobeItem | null>(null)
  const [category, setCategory] = useState<Category>('top')
  const [styles, setStyles] = useState<Style[]>([])
  const [seasons, setSeasons] = useState<Season[]>(['spring', 'summer', 'autumn', 'winter'])
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/wardrobe')
      .then(r => r.json())
      .then((items: WardrobeItem[]) => {
        const found = items.find(i => i.id === id)
        if (!found) { router.replace('/wardrobe'); return }
        setItem(found)
        setCategory(found.category)
        setStyles(Array.isArray(found.style) ? found.style as Style[] : [found.style as unknown as Style])
        setSeasons(Array.isArray(found.season) ? found.season as Season[] : [found.season as unknown as Season])
        setDescription(found.description ?? '')
      })
  }, [id, router])

  const toggleStyle = (s: Style) => {
    setStyles(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s])
  }

  const toggleSeason = (s: Season) => {
    setSeasons(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s])
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/wardrobe', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, category, style: styles, season: seasons, description }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '저장에 실패했습니다')
      setSaving(false)
    } else {
      router.push('/wardrobe')
    }
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-accent animate-ping" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b-2 border-black px-12 py-0 flex items-center">
        <button onClick={() => router.back()} className="text-black font-bold text-2xl py-5 pr-6 border-r-2 border-gray-200 mr-6">←</button>
        <h1 className="font-black text-black text-xl">옷 수정</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-12 py-10">
        <div className="grid grid-cols-2 gap-12">

          <div className="relative w-full aspect-square rounded overflow-hidden bg-gray-100 border border-gray-200">
            <Image src={item.image_url} alt={item.description ?? item.category} fill className="object-cover" />
          </div>

          <div className="flex flex-col gap-5">
            <div className="card space-y-6">

              <div>
                <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">종류</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                        ${category === cat ? 'bg-accent text-white border-accent' : 'bg-white text-black border-gray-200 hover:border-accent'}`}>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">스타일 <span className="text-accent font-normal normal-case tracking-normal">(중복 선택 가능)</span></label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => toggleStyle(s)}
                      className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                        ${styles.includes(s) ? 'bg-accent text-white border-accent' : 'bg-white text-black border-gray-200 hover:border-accent'}`}>
                      {STYLE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">계절 <span className="text-accent font-normal normal-case tracking-normal">(중복 선택 가능)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(s => (
                    <button key={s} onClick={() => toggleSeason(s)}
                      className={`px-4 py-2 rounded text-sm font-bold border-2 transition-colors
                        ${seasons.includes(s) ? 'bg-accent text-white border-accent' : 'bg-white text-black border-gray-200 hover:border-accent'}`}>
                      {SEASON_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-[#333333] tracking-widest uppercase mb-3 block">설명</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-base text-black font-normal bg-white border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>

              {error && <p className="text-sm text-point font-bold">{error}</p>}
            </div>

            <button className="btn-primary py-5 text-lg" disabled={saving} onClick={handleSave}>
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
