import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const blindBoxAPI = {
  getList: () => api.get('/blind-box'),
  getById: (id: string) => api.get(`/blind-box/${id}`),
  create: (data: any) => api.post('/blind-box', data),
  update: (id: string, data: any) => api.put(`/blind-box/${id}`, data),
  delete: (id: string) => api.delete(`/blind-box/${id}`),
  draw: (id: string, data: any) => api.post(`/blind-box/${id}/draw`, data)
}

export const productAPI = {
  getRecommendList: () => api.get('/products/recommend'),
  getById: (id: string) => api.get(`/products/${id}`)
}

export const orderAPI = {
  getList: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status })
}

export const userAPI = {
  login: (data: any) => api.post('/users/login', data),
  register: (data: any) => api.post('/users/register', data),
  getInfo: () => api.get('/users/info'),
  update: (data: any) => api.put('/users/update', data)
}

export default api