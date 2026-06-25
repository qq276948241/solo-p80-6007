import api from './http';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const filterApi = {
  buildings: () => api.get('/filters/buildings'),
  categories: () => api.get('/filters/categories'),
};

export const bookApi = {
  list: ({ building, category, keyword } = {}) => {
    const params = {};
    if (building) params.building = building;
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    return api.get('/books', { params });
  },
  detail: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
};

export const borrowApi = {
  create: (data) => api.post('/borrow-requests', data),
  received: () => api.get('/borrow-requests/received'),
  sent: () => api.get('/borrow-requests/sent'),
  approve: (id) => api.post(`/borrow-requests/${id}/approve`),
  reject: (id) => api.post(`/borrow-requests/${id}/reject`),
  return: (id) => api.post(`/borrow-requests/${id}/return`),
};
