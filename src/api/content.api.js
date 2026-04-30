import api from './axios'

export const contentApi = {
  list: (params) => api.get('/website/content/all', { params }),
  getBySlug: (slug) => api.get(`/website/content/${slug}`),
  create: (data) => api.post('/website/content', data),
  publish: (id) => api.patch(`/website/content/${id}/publish`),
  delete: (id) => api.delete(`/website/content/${id}`),
}