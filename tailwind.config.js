/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", /* gray-200 */
        input: "var(--color-input)", /* gray-200 */
        ring: "var(--color-ring)", /* Deep navy */
        background: "var(--color-background)", /* gray-50 */
        foreground: "var(--color-foreground)", /* charcoal gray */
        primary: {
          DEFAULT: "var(--color-primary)", /* Deep navy */
          foreground: "var(--color-primary-foreground)", /* white */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* Warm terracotta */
          foreground: "var(--color-secondary-foreground)", /* white */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* Clear red */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* gray-50 */
          foreground: "var(--color-muted-foreground)", /* Medium gray */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* Golden amber */
          foreground: "var(--color-accent-foreground)", /* charcoal gray */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* white */
          foreground: "var(--color-popover-foreground)", /* charcoal gray */
        },
        card: {
          DEFAULT: "var(--color-card)", /* white */
          foreground: "var(--color-card-foreground)", /* charcoal gray */
        },
        surface: {
          DEFAULT: "var(--color-surface)", /* white */
          foreground: "var(--color-surface-foreground)", /* charcoal gray */
        },
        success: {
          DEFAULT: "var(--color-success)", /* Forest green */
          foreground: "var(--color-success-foreground)", /* white */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* Warm amber */
          foreground: "var(--color-warning-foreground)", /* charcoal gray */
        },
        error: {
          DEFAULT: "var(--color-error)", /* Clear red */
          foreground: "var(--color-error-foreground)", /* white */
        },
        text: {
          primary: "var(--color-text-primary)", /* charcoal gray */
          secondary: "var(--color-text-secondary)", /* Medium gray */
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)", /* 12px */
        md: "var(--radius-md)", /* 8px */
        sm: "var(--radius-sm)", /* 6px */
        xl: "var(--radius-xl)", /* 16px */
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'nav': '14px',
      },
      spacing: {
        'sidebar': '240px',
        'nav-item': '48px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        'smooth': '200ms',
        'fast': '150ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'slide-in': 'slideIn 300ms ease-out',
        'pulse-subtle': 'pulseSubtle 1.5s ease-in-out infinite',
      },
      zIndex: {
        'sidebar': '100',
        'dropdown': '150',
        'overlay': '200',
      },
    },
  },
  plugins: [],
}