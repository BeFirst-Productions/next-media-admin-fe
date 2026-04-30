import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []
const processQueue = (err, token = null) => {
  failedQueue.forEach((p) => err ? p.reject(err) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(`${API_BASE}/admin/auth/refresh`, {}, { withCredentials: true })
        const newToken = data.data.accessToken
        useAuthStore.getState().updateToken(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (e) {
        processQueue(e, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    const msg = error.response?.data?.message || 'Something went wrong'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  },
)

export default api