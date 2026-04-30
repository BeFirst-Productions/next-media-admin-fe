import axios from './axios'

export const blogsApi = {
  list: (params) => axios.get('/admin/blogs', { params }),
  get: (id) => axios.get(`/admin/blogs/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'blogImage' && data[key] instanceof FileList && data[key][0]) {
        formData.append(key, data[key][0]);
      } else if (key === 'blogImage' && data[key] instanceof File) {
          formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return axios.post('/admin/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: ({ id, data }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (key === 'blogImage') {
        if (value instanceof FileList && value[0]) {
          formData.append(key, value[0]);
        } else if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value !== undefined) {
        formData.append(key, value);
      }
    });
    return axios.patch(`/admin/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => axios.delete(`/admin/blogs/${id}`),
  suggestSlug: (title) => axios.get('/admin/blogs/suggest-slug', { params: { title } })
}
