import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动加 JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data
    // 如果后端返回的 code 不是 200/0，视为业务错误
    if (data.code !== undefined && data.code !== 200 && data.code !== 0) {
      ElMessage.error(data.message || data.msg || '请求失败')
      return Promise.reject(new Error(data.message || data.msg || '请求失败'))
    }
    return data
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response
      if (status === 401) {
        const isAuthEndpoint = config.url?.startsWith('/auth/login') || config.url?.startsWith('/auth/register')
        if (isAuthEndpoint) {
          ElMessage.error(error.response.data?.message || '邮箱或密码错误')
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
        }
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误')
      } else {
        ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.message?.includes('timeout')) {
      ElMessage.error('请求超时，请重试')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

// ==================== Auth API ====================
export const authAPI = {
  /** 登录 */
  login(data: { email: string; password: string }) {
    return api.post('/auth/login', data) as Promise<any>
  },
  /** 注册 */
  register(data: { username: string; email: string; password: string; phone?: string }) {
    return api.post('/auth/register', data) as Promise<any>
  },
  /** 获取当前用户信息 */
  getMe() {
    return api.get('/auth/me') as Promise<any>
  }
}

// ==================== Blind Box API ====================
export const blindBoxAPI = {
  /** 获取盲盒列表 */
  getList(params?: {
    page?: number
    pageSize?: number
    category?: string
    sort?: string
    keyword?: string
    minPrice?: number
    maxPrice?: number
    type?: string
    tag?: string
  }) {
    return api.get('/blind-boxes', { params }) as Promise<any>
  },
  /** 获取盲盒详情 */
  getById(id: string | number) {
    return api.get(`/blind-boxes/${id}`) as Promise<any>
  },
  /** 获取热门盲盒 */
  getHot(limit?: number) {
    return api.get('/blind-boxes/hot', { params: { limit } }) as Promise<any>
  },
  /** 获取无限盲盒 */
  getInfinite(params?: { limit?: number; category?: string }) {
    return api.get('/blind-boxes/infinite', { params }) as Promise<any>
  },
  /** 获取新品盲盒 */
  getNew(params?: { limit?: number; category?: string }) {
    return api.get('/blind-boxes/new', { params }) as Promise<any>
  },
  /** 获取分类盲盒 */
  getByCategory(category: string, limit?: number) {
    return api.get(`/blind-boxes/category/${category}`, { params: { limit } }) as Promise<any>
  },
  /** 抽盒 */
  draw(id: string | number, data: { count: number; type?: string }) {
    return api.post(`/blind-boxes/${id}/draw`, data) as Promise<any>
  }
}

// ==================== Order API ====================
export const orderAPI = {
  /** 获取订单列表 */
  getList(params?: { page?: number; pageSize?: number; status?: string }) {
    return api.get('/orders', { params }) as Promise<any>
  },
  /** 获取订单详情 */
  getById(id: string | number) {
    return api.get(`/orders/${id}`) as Promise<any>
  },
  /** 创建订单 */
  create(data: any) {
    return api.post('/orders', data) as Promise<any>
  },
  /** 更新订单状态 */
  updateStatus(id: string | number, status: string) {
    return api.put(`/orders/${id}/status`, { status }) as Promise<any>
  },
  /** 取消订单 */
  cancel(id: string | number) {
    return api.put(`/orders/${id}/cancel`) as Promise<any>
  }
}

// ==================== User API ====================
export const userAPI = {
  /** 获取用户信息 */
  getInfo(id: string | number) {
    return api.get(`/users/${id}`) as Promise<any>
  },
  /** 更新用户信息 */
  update(id: string | number, data: any) {
    return api.put(`/users/${id}`, data) as Promise<any>
  },
  /** 签到 */
  checkIn(id: string | number) {
    return api.post(`/users/${id}/check-in`) as Promise<any>
  },
  /** 获取盒柜 */
  getCabinet(id: string | number, params?: { status?: string; page?: number; pageSize?: number }) {
    return api.get(`/users/${id}/cabinet`, { params }) as Promise<any>
  },
  /** 盒柜发货 */
  shipCabinet(id: string | number, data: { itemIds: number[]; addressId: number }) {
    return api.post(`/users/${id}/cabinet/ship`, data) as Promise<any>
  },
  /** 回收 */
  recycle(id: string | number, data: { itemIds: number[] }) {
    return api.post(`/users/${id}/cabinet/recycle`, data) as Promise<any>
  },
  /** 获取抽盒记录 */
  getDrawRecords(id: string | number, params?: { page?: number; pageSize?: number }) {
    return api.get(`/users/${id}/draw-records`, { params }) as Promise<any>
  },
  /** 获取优惠券 */
  getCoupons(id: string | number) {
    return api.get(`/users/${id}/coupons`) as Promise<any>
  }
}

// ==================== Product API ====================
export const productAPI = {
  /** 获取推荐列表 */
  getRecommendList() {
    return api.get('/products/recommend') as Promise<any>
  },
  /** 获取商品详情 */
  getById(id: string | number) {
    return api.get(`/products/${id}`) as Promise<any>
  }
}

// ==================== Dashboard API (Admin) ====================
export const dashboardAPI = {
  /** 获取概览数据 */
  getOverview() {
    return api.get('/dashboard/overview') as Promise<any>
  },
  /** 获取销售趋势 */
  getSalesTrend(params?: { days?: number }) {
    return api.get('/dashboard/sales-trend', { params }) as Promise<any>
  },
  /** 获取转化漏斗 */
  getFunnel() {
    return api.get('/dashboard/funnel') as Promise<any>
  },
  /** 获取奖品监控 */
  getPrizeMonitor() {
    return api.get('/dashboard/prize-monitor') as Promise<any>
  }
}

// ==================== Address API ====================
export const addressAPI = {
  /** 获取地址列表 */
  getList() {
    return api.get('/addresses') as Promise<any>
  },
  /** 创建地址 */
  create(data: any) {
    return api.post('/addresses', data) as Promise<any>
  },
  /** 更新地址 */
  update(id: number, data: any) {
    return api.put(`/addresses/${id}`, data) as Promise<any>
  },
  /** 删除地址 */
  remove(id: number) {
    return api.delete(`/addresses/${id}`) as Promise<any>
  },
  /** 设置默认地址 */
  setDefault(id: number) {
    return api.put(`/addresses/${id}/default`) as Promise<any>
  }
}

// ==================== Recharge API ====================
export const rechargeAPI = {
  /** 充值 */
  create(data: { amount: number; payMethod: string }) {
    return api.post('/recharge', data) as Promise<any>
  }
}

// ==================== Hot Products API ====================
export const hotProductAPI = {
  /** 获取热门周边列表 */
  getList(params?: { page?: number; pageSize?: number; category?: string }) {
    return api.get('/hot-products', { params }) as Promise<any>
  },
  /** 获取热门周边详情 */
  getById(id: string | number) {
    return api.get(`/hot-products/${id}`) as Promise<any>
  },
  /** 购买热门周边 */
  buy(id: string | number, data: { quantity: number }) {
    return api.post(`/hot-products/${id}/buy`, data) as Promise<any>
  }
}

// ==================== Points API ====================
export const pointsAPI = {
  /** 获取积分商品列表 */
  getProducts(params?: { page?: number; pageSize?: number; category?: string }) {
    return api.get('/points', { params }) as Promise<any>
  },
  /** 获取积分商品详情 */
  getProductById(id: string | number) {
    return api.get(`/points/${id}`) as Promise<any>
  },
  /** 兑换积分商品 */
  exchange(data: {
    productId: number
    quantity: number
    recipientName: string
    recipientPhone: string
    recipientAddress: string
  }) {
    return api.post('/points/exchange', data) as Promise<any>
  },
  /** 获取我的兑换记录 */
  getMyExchanges(params?: { page?: number; pageSize?: number; status?: string }) {
    return api.get('/points/my/exchanges', { params }) as Promise<any>
  }
}

// ==================== User Profile API ====================
export const userProfileAPI = {
  /** 获取当前用户信息 */
  getProfile() {
    return api.get('/users/profile') as Promise<any>
  }
}

export default api
