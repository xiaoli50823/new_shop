import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { showTabBar: true, title: '首页' }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('@/views/Discover.vue'),
    meta: { showTabBar: true, title: '发现' }
  },
  {
    path: '/box-cabinet',
    name: 'BoxCabinet',
    component: () => import('@/views/BoxCabinet.vue'),
    meta: { showTabBar: true, title: '盒柜', requiresAuth: true }
  },
  {
    path: '/personal',
    name: 'Personal',
    component: () => import('@/views/Personal.vue'),
    meta: { showTabBar: true, title: '我的', requiresAuth: true }
  },
  {
    path: '/blind-box/:id',
    name: 'BlindBoxDetail',
    component: () => import('@/views/BlindBoxDetail.vue'),
    meta: { title: '盲盒详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address.vue'),
    meta: { title: '收货地址', requiresAuth: true }
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/Recharge.vue'),
    meta: { title: '充值', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Admin.vue'),
    meta: { title: '管理后台' },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '数据大盘' }
      },
      {
        path: 'blind-box',
        name: 'AdminBlindBox',
        component: () => import('@/views/admin/BlindBoxManage.vue'),
        meta: { title: '盲盒管理' }
      },
      {
        path: 'prizes',
        name: 'AdminPrizes',
        component: () => import('@/views/admin/PrizeManage.vue'),
        meta: { title: '奖品管理' }
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: () => import('@/views/admin/OrderManage.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'revenue',
        name: 'AdminRevenue',
        component: () => import('@/views/admin/RevenueReport.vue'),
        meta: { title: '营收报表' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SystemSettings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '盲盒星球'} - 盲盒星球`

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
