import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/blind-box/:id',
      name: 'BlindBoxDetail',
      component: () => import('./views/BlindBoxDetail.vue')
    },
    {
      path: '/box-cabinet',
      name: 'BoxCabinet',
      component: () => import('./views/BoxCabinet.vue')
    },
    {
      path: '/personal',
      name: 'Personal',
      component: () => import('./views/Personal.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('./views/admin/Admin.vue'),
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('./views/admin/Dashboard.vue')
        },
        {
          path: 'blind-box',
          name: 'AdminBlindBox',
          component: () => import('./views/admin/BlindBoxManage.vue')
        },
        {
          path: 'order',
          name: 'AdminOrder',
          component: () => import('./views/admin/OrderManage.vue')
        },
        {
          path: 'user',
          name: 'AdminUser',
          component: () => import('./views/admin/UserManage.vue')
        }
      ]
    }
  ]
})

export default router