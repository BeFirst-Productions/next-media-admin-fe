import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Analytics from '@/pages/Analytics'
import Activity from '@/pages/Activity'
import Users from '@/pages/Users'
import Content from '@/pages/Content'
import Services from '@/pages/Services'
import Blogs from '@/pages/Blogs'
import BlogEditor from '@/pages/BlogEditor'
import BlogView from '@/pages/BlogView'
import Settings from '@/pages/Settings'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

function ThemeInit() {
  const initTheme = useThemeStore((s) => s.initTheme)
  useEffect(() => { initTheme() }, [])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ThemeInit />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/content" element={<Content />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/new" element={<BlogEditor />} />
              <Route path="/blogs/view/:id" element={<BlogView />} />
              <Route path="/blogs/edit/:id" element={<BlogEditor />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<ProtectedRoute requiredRole="superadmin" />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
        }} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}