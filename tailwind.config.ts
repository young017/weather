import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    'border-red-200', 'bg-red-50', 'text-red-300', 'bg-red-100', 'text-red-500',
    'border-amber-200', 'bg-amber-50', 'text-amber-300', 'bg-amber-100', 'text-amber-600',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#03C75A',
          light: '#00E06B',
          dark: '#02A34A',
        },
        point: {
          DEFAULT: '#7C3AED',
          light: '#9D5CF0',
          dark: '#6020C8',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
