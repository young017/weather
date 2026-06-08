'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { WardrobeItem, Category } from '@/types'
import { CATEGORY_LABELS, SEASON_LABELS, STYLE_LABELS } from '@/lib/constants'

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
    <div className="page-container pb-24">
      <header className="page-header flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">내 옷장</h1>
          <p className="text-xs text-gray-400">{items.length}개 등록됨</p>
        </div>
        <button
          onClick={() => router.push('/wardrobe/add')}
          className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white text-xl font-light shadow-md active:scale-95 transition-transform"
        >
          +
        </button>
      </header>

      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-hide">
        {CATEGORY_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filter === value
                ? 'bg-accent text-white'
                : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 mt-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8">
          <div className="text-5xl mb-4">👗</div>
          <p className="font-semibold text-gray-700 mb-1">
            {filter === 'all' ? '아직 등록된 옷이 없어요' : `등록된 ${CATEGORY_LABELS[filter as Category]}이 없어요`}
          </p>
          <p className="text-sm text-gray-400 mb-6">옷 사진을 찍어서 옷장을 채워보세요</p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 28px' }}
            onClick={() => router.push('/wardrobe/add')}
          >
            옷 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 mt-3">
          {filtered.map(item => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
                <Image
                  src={item.image_url}
                  alt={item.description ?? item.category}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full text-white text-xs
                             opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="mt-1.5 px-0.5">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {item.description ?? item.colors.join(', ')}
                </p>
                <div className="flex gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">{STYLE_LABELS[item.style]}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{SEASON_LABELS[item.season]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-gray-100 bg-white flex">
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
          onClick={() => router.push('/')}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">홈</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-accent">
          <span className="text-xl">👗</span>
          <span className="text-[10px] font-medium">내 옷장</span>
        </button>
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
          onClick={() => router.push('/settings')}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-medium">설정</span>
        </button>
      </nav>
    </div>
  )
}
