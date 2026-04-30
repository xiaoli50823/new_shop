import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import BoxCabinet from '../views/BoxCabinet.vue'
import BlindBoxDetail from '../views/BlindBoxDetail.vue'
import Personal from '../views/Personal.vue'

// 路由守卫
const requireAuth = (to: any, from: any, next: any) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
  } else {
    next()
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
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Admin.vue'),
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
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