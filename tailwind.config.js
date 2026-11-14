/** @type {import('tailwindcss').Config} */
// AWOS 앱(tailwind.config.js)과 같은 토큰. 앱 쪽 값이 바뀌면 여기도 같이 맞춘다.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#FFFFFF',
          light: '#F1F5F9',
          dark: '#F8FAFC',
        },
        panel: '#FFFFFF',
        deep: '#EAF1FB',
        sky: {
          DEFAULT: '#2563EB',
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        go: {
          DEFAULT: '#10B981',
        },
        surface: {
          DEFAULT: '#F8FAFC',
        },
        ink: {
          DEFAULT: '#0F172A',
        },
        role: {
          pilot: '#2563EB',
          mechanic: '#F59E0B',
          controller: '#10B981',
          ops: '#A855F7',
          drone: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        display: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        body: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        control: '6px',
      },
      spacing: {
        section: '96px',
        cardpad: '28px',
      },
    },
  },
  plugins: [],
}
