import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
