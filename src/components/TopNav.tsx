'use client'

import { useRouter, usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: '홈', path: '/' },
  { label: '내 옷장', path: '/wardrobe' },
  { label: '설정', path: '/settings' },
]

export function TopNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-10 bg-white border-b-2 border-black flex items-center px-12">
      <span
        className="text-2xl font-black text-black py-5 mr-auto cursor-pointer"
        onClick={() => router.push('/')}
      >
        몇 도야 ?
      </span>
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`px-8 py-5 text-base font-bold border-b-2 transition-colors ${
                isActive
                  ? 'text-accent border-accent'
                  : 'text-[#333333] border-transparent hover:text-black'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
