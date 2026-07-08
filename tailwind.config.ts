import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12151C',
          soft: '#1D212C',
        },
        accent: {
          DEFAULT: '#4ADEDE',
          dark: '#0C8F8F',
          light: '#E3FBFB',
        },
        brand: {
          50: '#E6F1FB',
          100: '#CCE3F7',
          500: '#185FA5',
          600: '#125491',
          700: '#0C447C',
        },
        surface: {
          0: '#F7F7F5',
          1: '#F1EFE8',
          2: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
