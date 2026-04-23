import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('omnideal-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  } catch { /* ignore */ }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('omnideal-auth');
    }
    return Promise.reject(error);
  }
);

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getDeal: () => api.get('/products/deal-of-the-day'),
  search: (q, params) => api.get('/products', { params: { search: q, ...params } }),
  create: (data) => api.post('/products', { data: JSON.stringify(data) }),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  trackByPhone: (phone) => api.get(`/orders/track-phone/${encodeURIComponent(phone)}`),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const reviewsAPI = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};

export const couponsAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: (params) => api.get('/coupons', { params }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const bannersAPI = {
  getAll: (type) => api.get('/banners', { params: type ? { type } : {} }),
  getAllAdmin: () => api.get('/banners/all'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export const flashSaleAPI = {
  getLive: () => api.get('/flash-sales/live'),
  getUpcoming: () => api.get('/flash-sales/upcoming'),
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
  create: (data) => api.post('/returns', data),
  track: (number) => api.get(`/returns/track/${number}`),
  getAll: (params) => api.get('/returns', { params }),
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

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueChart: (days) => api.get('/admin/charts/revenue', { params: { days } }),
  getCategoryChart: () => api.get('/admin/charts/categories'),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getLowStock: () => api.get('/admin/low-stock'),
};

export default api;
