/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Smart-Gram Glass Palette ───────────────────
        sky: {
          frost: '#A9CDE0',
          glass: 'rgba(169,205,224,0.38)',
        },
        teal: {
          glass: '#86C8C5',
          surface: 'rgba(134,200,197,0.25)',
        },
        lavender: {
          glass: '#B4B8D9',
          surface: 'rgba(180,184,217,0.28)',
        },
        smoky: {
          ice: '#D2E0E8',
        },
        // Primary / Secondary Text
        ptxt: '#28485A',
        stxt: '#607887',
        mtxt: '#8299A6',
        // Legacy primary surface
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          850: '#151f32',
          900: '#0f172a',
          950: '#070a13'
        },
        saffron: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309'
        },
        emeraldGlow: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669'
        },
        cyanGlow: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2'
        }
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(49,79,96,0.07)',
        'glass-sm': '0 4px 16px 0 rgba(49,79,96,0.05)',
        'glass-lg': '0 16px 44px 0 rgba(49,79,96,0.12)',
        'glow-sky': '0 0 20px -4px rgba(169,205,224,0.55)',
        'glow-teal': '0 0 20px -4px rgba(134,200,197,0.55)',
        'glow-lavender': '0 0 20px -4px rgba(180,184,217,0.5)',
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        '2xs': '0 1px 3px 0 rgba(49,79,96,0.05)',
        'xs': '0 2px 6px 0 rgba(49,79,96,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 4s linear infinite',
        'fadeIn': 'fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
