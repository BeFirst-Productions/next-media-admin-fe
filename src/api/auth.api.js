import api from './axios'
export const authApi = {
  login:   (data) => api.post('http://localhost:8086/api/v1/admin/auth/login', data),
  logout:  ()     => api.post('http://localhost:8086/api/v1/admin/auth/logout'),
  getMe:   ()     => api.get('http://localhost:8086/api/v1/admin/auth/me'),
  refresh: ()     => api.post('http://localhost:8086/api/v1/admin/auth/refresh'),
}