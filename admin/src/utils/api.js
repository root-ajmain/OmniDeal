import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omnideal-admin-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('omnideal-admin-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueChart: (days) => api.get('/admin/charts/revenue', { params: { days } }),
  getCategoryChart: () => api.get('/admin/charts/categories'),
  getCustomers: (p) => api.get('/admin/customers', { params: p }),
  getLowStock: () => api.get('/admin/low-stock'),
};

export const productsAPI = {
  getAll: (p) => api.get('/products', { params: { ...p, status: 'all' } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories', { params: { status: 'all', all: 1 } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  getAll: (p) => api.get('/orders', { params: p }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const reviewsAPI = {
  getAll: (p) => api.get('/reviews', { params: p }),
  updateStatus: (id, data) => api.put(`/reviews/${id}/status`, data),
};

export const couponsAPI = {
  getAll: (p) => api.get('/coupons', { params: p }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const bannersAPI = {
  getAll: () => api.get('/banners/all'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export const flashSaleAPI = {
  getAll: () => api.get('/flash-sales'),
  create: (data) => api.post('/flash-sales', data),
  update: (id, data) => api.put(`/flash-sales/${id}`, data),
  delete: (id) => api.delete(`/flash-sales/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const returnsAPI = {
  getAll: (p) => api.get('/returns', { params: p }),
  update: (id, data) => api.put(`/returns/${id}`, data),
};

export const uploadAPI = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  images: (files) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    return api.post('/upload/images', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
};

export default api;
