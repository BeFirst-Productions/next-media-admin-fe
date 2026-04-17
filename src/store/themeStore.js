import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      accentColor: 'indigo',
      sidebarCollapsed: false,
      compactMode: false,
      animationsEnabled: true,
      language: 'en',

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setAccentColor: (accentColor) => {
        set({ accentColor })
        get().applyAccentColor(accentColor)
      },
      setCompactMode: (compactMode) => set({ compactMode }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setLanguage: (language) => set({ language }),
      initTheme: () => {
        const { theme, accentColor } = get()
        document.documentElement.classList.toggle('dark', theme === 'dark')
        get().applyAccentColor(accentColor)
      },
      applyAccentColor: (colorId) => {
        const hexToRgb = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `${r} ${g} ${b}`;
        };
        const palettes = {
          indigo: { 50:'#f0f4ff', 100:'#e0e9ff', 200:'#c7d7fe', 300:'#a5b8fc', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 800:'#3730a3', 900:'#312e81' },
          violet: { 50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95' },
          blue:   { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' },
          teal:   { 50:'#f0fdfa', 100:'#ccfbf1', 200:'#99f6e4', 300:'#5eead4', 400:'#2dd4bf', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e', 800:'#115e59', 900:'#134e4a' },
          green:  { 50:'#f0fdf4', 100:'#dcfce7', 200:'#bbf7d0', 300:'#86efac', 400:'#4ade80', 500:'#22c55e', 600:'#16a34a', 700:'#15803d', 800:'#166534', 900:'#14532d' },
          rose:   { 50:'#fff1f2', 100:'#ffe4e6', 200:'#fecdd3', 300:'#fda4af', 400:'#fb7185', 500:'#f43f5e', 600:'#e11d48', 700:'#be123c', 800:'#9f1239', 900:'#881337' },
        }
        const root = document.documentElement
        const p = palettes[colorId] || palettes['indigo']
        Object.entries(p).forEach(([k, v]) => root.style.setProperty(`--brand-${k}`, hexToRgb(v)))
      },
    }),
    { name: 'admin-theme' },
  ),
)