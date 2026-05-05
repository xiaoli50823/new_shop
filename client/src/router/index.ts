import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import BoxCabinet from '../views/BoxCabinet.vue'
import BlindBoxDetail from '../views/BlindBoxDetail.vue'
import Personal from '../views/Personal.vue'

const requireAuth = (to: any, from: any, next: any) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

const requireAdmin = (to: any, from: any, next: any) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  try {
    const user = JSON.parse(userStr || '{}')
    if (user.role !== 'admin') {
      next('/')
      return
    }
    next()
  } catch {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/box-cabinet',
    name: 'BoxCabinet',
    component: BoxCabinet,
    beforeEnter: requireAuth
  },
  {
    path: '/blind-box/:id',
    name: 'BlindBoxDetail',
    component: BlindBoxDetail
  },
  {
    path: '/personal',
    name: 'Personal',
    component: Personal,
    beforeEnter: requireAuth
  },
  {
    path: '/hot',
    name: 'HotProducts',
    component: () => import('../views/HotProducts.vue')
  },
  {
    path: '/infinite',
    name: 'InfiniteBlindBox',
    component: () => import('../views/InfiniteBlindBox.vue')
  },
  {
    path: '/new',
    name: 'NewProducts',
    component: () => import('../views/NewProducts.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => {
      console.log('Loading Coupons component');
      return import('../views/Coupons.vue');
    },
    beforeEnter: requireAuth
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => {
      console.log('Loading MyOrders component');
      return import('../views/MyOrders.vue');
    },
    beforeEnter: requireAuth
  },
  {
    path: '/check-in',
    name: 'CheckIn',
    component: () => import('../views/CheckIn.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/points-mall',
    name: 'PointsMall',
    component: () => import('../views/PointsMall.vue')
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('../views/Address.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('../views/Recharge.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Admin.vue'),
    beforeEnter: requireAdmin,
    children: [
      {
        path: '',
        name: 'AdminIndex',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'blind-box-manage',
        name: 'BlindBoxManage',
        component: () => import('../views/admin/BlindBoxManage.vue')
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('../views/admin/CategoryManage.vue')
      },
      {
        path: 'order-manage',
        name: 'OrderManage',
        component: () => import('../views/admin/OrderManage.vue')
      },
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('../views/admin/UserManage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router