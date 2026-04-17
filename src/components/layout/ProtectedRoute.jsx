import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return <Outlet />
}