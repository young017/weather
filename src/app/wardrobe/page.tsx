'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { WardrobeItem, Category, Style } from '@/types'
import { CATEGORY_LABELS, SEASON_LABELS, STYLE_LABELS } from '@/lib/constants'
import { TopNav } from '@/components/TopNav'

const CATEGORY_FILTERS: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'outer', label: '아우터' },
  { value: 'shoes', label: '신발' },
  { value: 'accessory', label: '액세서리' },
]

export default function WardrobePage() {
  const router = useRouter()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/wardrobe')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('이 옷을 삭제할까요?')) return
    setDeletingId(id)
    await fetch('/api/wardrobe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
    setDeletingId(null)
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <div className="page-container">
      <TopNav />

      <div className="px-12 pt-8 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="font-black text-black text-3xl">내 옷장</h1>
          <p className="text-base text-[#333333] font-normal mt-1">{items.length}개 등록됨</p>
        </div>
        <button
          onClick={() => router.push('/wardrobe/add')}
          className="px-6 py-3 bg-accent text-white text-base font-bold rounded hover:bg-accent-dark transition-colors active:scale-95"
        >
          + 옷 추가
        </button>
      </div>

      <div className="flex gap-3 px-12 pt-5 pb-3">
        {CATEGORY_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors
              ${filter === value
                ? 'bg-black text-white'
                : 'bg-white text-black border-2 border-gray-200 hover:border-black'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-12 py-4">
        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <p className="font-extrabold text-black text-2xl mb-3">
              {filter === 'all' ? '아직 등록된 옷이 없어요' : `등록된 ${CATEGORY_LABELS[filter as Category]}이 없어요`}
            </p>
            <p className="text-base text-[#333333] font-normal mb-10">옷 사진을 찍어서 옷장을 채워보세요</p>
            <button
              className="bg-accent text-white font-bold text-base rounded px-10 py-4 hover:bg-accent-dark transition-colors active:scale-95"
              onClick={() => router.push('/wardrobe/add')}
            >
              옷 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded overflow-hidden bg-gray-100 relative border border-gray-200">
                  <Image
                    src={item.image_url}
                    alt={item.description ?? item.category}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/wardrobe/edit/${item.id}`)}
                      className="w-8 h-8 bg-black/70 rounded text-white text-sm flex items-center justify-center font-bold"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="w-8 h-8 bg-black/70 rounded text-white text-sm flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-bold text-black truncate">
                    {item.description ?? item.colors.join(', ')}
                  </p>
                  <div className="flex gap-1 mt-0.5">
                    <span className="text-xs text-[#333333] font-normal">{(item.style as Style[]).map(s => STYLE_LABELS[s]).join(', ')}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-[#333333] font-normal">{SEASON_LABELS[item.season]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
