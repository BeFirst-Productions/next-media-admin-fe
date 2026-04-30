import axios from './axios'

export const servicesApi = {
  list: (params) => axios.get('/admin/services', { params }),
  get: (id) => axios.get(`/admin/services/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'serviceImage' && data[key][0]) {
        formData.append(key, data[key][0]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return axios.post('/admin/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: ({ id, data }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'serviceImage' && data[key] instanceof FileList && data[key][0]) {
        formData.append(key, data[key][0]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axios.patch(`/admin/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => axios.delete(`/admin/services/${id}`),
  suggestSlug: (title) => axios.get('/admin/services/suggest-slug', { params: { title } })
}
