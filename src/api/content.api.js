import api from './axios'
export const contentApi = {
  list:      (params) => api.get('http://localhost:8086/api/v1/website/content/all', { params }),
  getBySlug: (slug) => api.get(`http://localhost:8086/api/v1/website/content/${slug}`),
  create:    (data) => api.post('http://localhost:8086/api/v1/website/content', data),
  publish:   (id)   => api.patch(`http://localhost:8086/api/v1/website/content/${id}/publish`),
  delete:    (id)   => api.delete(`http://localhost:8086/api/v1/website/content/${id}`),
}