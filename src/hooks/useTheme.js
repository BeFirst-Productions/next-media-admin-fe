import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function useTheme() {
  const store = useThemeStore()
  useEffect(() => { store.initTheme() }, [])
  return { ...store, isDark: store.theme === 'dark' }
}