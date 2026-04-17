import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout: storeLogout, updateToken } = useAuthStore()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      const { accessToken } = res.data.data
      updateToken(accessToken)
      const meRes = await authApi.getMe()
      setAuth(meRes.data.data, accessToken)
      
      const userName = meRes.data.data.name || meRes.data.data.email
      toast.success(`Welcome back, ${userName}!`)
      
      // Add persistent in-app notification
      const { addNotification } = await import('@/store/notificationStore').then(m => m)
      addNotification({
        title: 'Login Successful',
        message: `Thank you for logging in, ${userName}! Welcome to your admin dashboard.`,
        type: 'success'
      })

      navigate('/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
      toast.success('Logged out')
    },
  })

  return {
    user,
    isAuthenticated,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin:      user?.role === 'admin',
    login:        loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    logout:       logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  }
}