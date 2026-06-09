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

function ItemModal({ item, onClose, onEdit, onDelete }: {
  item: WardrobeItem
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const styles = Array.isArray(item.style) ? item.style as Style[] : [item.style as unknown as Style]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full aspect-square bg-gray-100">
          <Image src={item.image_url} alt={item.description ?? item.category} fill className="object-cover" />
        </div>

        <div className="px-7 py-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-black text-black leading-snug">
              {item.description ?? item.colors.join(', ')}
            </p>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-xl font-bold flex-shrink-0">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-extrabold text-[#999] tracking-widest uppercase mb-1">종류</p>
              <p className="text-base font-bold text-black">{CATEGORY_LABELS[item.category]}</p>
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#999] tracking-widest uppercase mb-1">계절</p>
              <p className="text-base font-bold text-black">{SEASON_LABELS[item.season]}</p>
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#999] tracking-widest uppercase mb-1">스타일</p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {styles.map(s => (
                  <span key={s} className="text-sm font-bold bg-accent/10 text-accent px-2.5 py-0.5 rounded-full">
                    {STYLE_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#999] tracking-widest uppercase mb-1">색상</p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {item.colors.map((c, i) => (
                  <span key={i} className="text-sm text-[#555] bg-gray-100 px-2.5 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
            {item.material && (
              <div>
                <p className="text-xs font-extrabold text-[#999] tracking-widest uppercase mb-1">소재</p>
                <p className="text-base font-bold text-black">{item.material}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 py-3 rounded border-2 border-black text-black text-base font-extrabold hover:bg-black hover:text-white transition-colors"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-3 rounded border-2 border-red-400 text-red-500 text-base font-extrabold hover:bg-red-500 hover:text-white transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WardrobePage() {
  const router = useRouter()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)

  useEffect(() => {
    fetch('/api/wardrobe')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('이 옷을 삭제할까요?')) return
    setDeletingId(id)
    setSelectedItem(null)
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

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => router.push(`/wardrobe/edit/${selectedItem.id}`)}
          onDelete={() => handleDelete(selectedItem.id)}
        />
      )}

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
              <div
                key={item.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-square rounded overflow-hidden bg-gray-100 relative border border-gray-200 hover:border-accent transition-colors">
                  <Image
                    src={item.image_url}
                    alt={item.description ?? item.category}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-bold text-black truncate">
                    {item.description ?? item.colors.join(', ')}
                  </p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    <span className="text-xs text-[#333333] font-normal">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-[#333333] font-normal">
                      {(Array.isArray(item.style) ? item.style as Style[] : [item.style as unknown as Style]).map(s => STYLE_LABELS[s]).join(', ')}
                    </span>
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
