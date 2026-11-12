import api, { unwrap, unwrapFull, toFormData } from './api';

// Премахва празните параметри от query string-а
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== false));

export const authApi = {
  login: (credentials) => unwrap(api.post('/auth/login', credentials)),
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => unwrap(api.get('/users/me')),
  forgotPassword: (email) => unwrapFull(api.post('/auth/forgot-password', { email })),
  resetPassword: (token, password) => unwrapFull(api.post(`/auth/reset-password/${token}`, { password })),
  verifyEmail: (token) => unwrapFull(api.get(`/auth/verify-email/${token}`)),
  resendVerification: () => unwrapFull(api.post('/auth/resend-verification')),
  changePassword: (payload) => unwrap(api.post('/auth/change-password', payload)),
};

export const profileApi = {
  update: (payload) => unwrap(api.patch('/users/me', payload)),
  updateAvatar: (file) => unwrap(api.patch('/users/me/avatar', toFormData({}, { avatar: file }))),
  deleteAvatar: () => unwrap(api.delete('/users/me/avatar')),
  deleteAccount: () => unwrapFull(api.delete('/users/me')),
};

export const configApi = {
  get: () => unwrap(api.get('/config')),
};

export const productApi = {
  list: (params) => unwrap(api.get('/products', { params: cleanParams(params) })),
  get: (idOrSlug) => unwrap(api.get(`/products/${idOrSlug}`)).then((d) => d.product),
  related: (idOrSlug) => unwrap(api.get(`/products/${idOrSlug}/related`)).then((d) => d.items),
  priceRange: () => unwrap(api.get('/products/price-range')),
  create: (values, files) => unwrap(api.post('/products', toFormData(values, { images: files }))),
  update: (id, values, files) => unwrap(api.patch(`/products/${id}`, toFormData(values, { images: files }))),
  remove: (id) => unwrapFull(api.delete(`/products/${id}`)),
};

export const reviewApi = {
  list: (productId, params) => unwrap(api.get(`/products/${productId}/reviews`, { params })),
  upsert: (productId, payload) => unwrap(api.post(`/products/${productId}/reviews`, payload)),
  remove: (id) => unwrapFull(api.delete(`/reviews/${id}`)),
};

export const categoryApi = {
  list: (params) => unwrap(api.get('/categories', { params: cleanParams(params) })).then((d) => d.items),
  create: (values, file) => unwrap(api.post('/categories', toFormData(values, { image: file }))),
  update: (id, values, file) => unwrap(api.patch(`/categories/${id}`, toFormData(values, { image: file }))),
  remove: (id) => unwrapFull(api.delete(`/categories/${id}`)),
};

export const bannerApi = {
  list: (params) => unwrap(api.get('/banners', { params: cleanParams(params) })).then((d) => d.items),
  create: (values, file) => unwrap(api.post('/banners', toFormData(values, { image: file }))),
  update: (id, values, file) => unwrap(api.patch(`/banners/${id}`, toFormData(values, { image: file }))),
  remove: (id) => unwrapFull(api.delete(`/banners/${id}`)),
};

export const cartApi = {
  get: () => unwrap(api.get('/cart')),
  add: (productId, quantity) => unwrap(api.post('/cart/items', { productId, quantity })),
  update: (productId, quantity) => unwrap(api.patch(`/cart/items/${productId}`, { quantity })),
  remove: (productId) => unwrap(api.delete(`/cart/items/${productId}`)),
  clear: () => unwrap(api.delete('/cart')),
  merge: (items) => unwrap(api.post('/cart/merge', { items })),
};

export const wishlistApi = {
  list: () => unwrap(api.get('/favorites')).then((d) => d.items),
  ids: () => unwrap(api.get('/favorites/ids')).then((d) => d.ids),
  add: (productId) => unwrap(api.post(`/favorites/${productId}`)),
  remove: (productId) => unwrap(api.delete(`/favorites/${productId}`)),
};

export const orderApi = {
  create: (payload) => unwrap(api.post('/orders', payload)).then((d) => d.order),
  mine: (params) => unwrap(api.get('/orders/my', { params: cleanParams(params) })),
  get: (id) => unwrap(api.get(`/orders/${id}`)).then((d) => d.order),
  cancel: (id) => unwrap(api.patch(`/orders/${id}/cancel`)).then((d) => d.order),
  // админ
  all: (params) => unwrap(api.get('/orders', { params: cleanParams(params) })),
  updateStatus: (id, payload) => unwrap(api.patch(`/orders/${id}/status`, payload)).then((d) => d.order),
};

export const adminApi = {
  stats: () => unwrap(api.get('/admin/stats')),
  users: (params) => unwrap(api.get('/users', { params: cleanParams(params) })),
  updateUserRole: (id, role) => unwrap(api.patch(`/users/${id}/role`, { role })),
  updateUserStatus: (id, status) => unwrap(api.patch(`/users/${id}/status`, { status })),
  deleteUser: (id) => unwrapFull(api.delete(`/users/${id}`)),
};

export const contactApi = {
  send: (payload) => unwrapFull(api.post('/contact', payload)),
};
