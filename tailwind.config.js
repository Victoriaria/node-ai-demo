/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 自定义金融风格颜色
        brand: {
          dark: "#0a0a1a",
          neon: "#00f2ff",
          alert: "#ff4d4d",
          success: "#00ff88",
          primary: "#1a56db",
          secondary: "#2d3748",
        },
        // 统一的深色主题颜色
        dark: {
          bg: "#0a0a1a",
          card: "#1a1a2e",
          border: "#16213e",
          text: "#ffffff",
          muted: "#a9a9a9",
        },
        // 风险评分颜色
        risk: {
          high: "#ff4d4d",
          medium: "#ffaa00",
          low: "#00ff88",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        "neon": "0 0 10px rgba(0, 242, 255, 0.5)",
        "alert": "0 0 10px rgba(255, 77, 77, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 242, 255, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 242, 255, 0.8)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // 风险评分颜色类
    'text-[#ff4d4d]',
    'text-yellow-400',
    'text-[#00ff88]',
    // 背景颜色类
    'bg-[#0a0a1a]',
    'bg-black',
    'bg-gray-900/80',
    'bg-gray-800/50',
    'bg-blue-500/90',
    'bg-blue-900/60',
    'bg-blue-600',
    'bg-red-500',
    'bg-blue-950/90',
    // 边框颜色类
    'border-gray-800',
    'border-gray-700',
    'border-blue-800/50',
    'border-blue-800/50',
    'border-red-800/50',
    // 文本颜色类
    'text-white',
    'text-white/70',
    'text-gray-300',
    'text-gray-400',
    'text-gray-600',
    'text-blue-400',
    'text-[#00f2ff]',
    // 布局类
    'hidden',
    'flex',
    'grid',
    'flex-col',
    'lg:flex-row',
    'lg:col-span-6',
    'lg:col-span-4',
    'lg:flex-1',
    'lg:w-[350px]',
    'min-h-[600px]',
    'h-full',
    'flex-1',
    'overflow-y-auto',
    // 其他关键类
    'animate-pulse',
    'pointer-events-none',
    'z-0',
    'z-10',
    'z-40',
    'backdrop-blur-sm',
    'shadow-lg',
    'shadow-xl',
  ],
}