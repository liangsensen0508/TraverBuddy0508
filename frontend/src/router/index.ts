import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/goods-list',
      name: 'goods-list',
      component: () => import('@/views/goods-list.vue')
    },
    {
      path: '/goods-details',
      name: 'goods-details',
      component: () => import('@/views/goods-details.vue')
    },
    {
      // 支付结果页：支付宝支付完成后经后端中转 302 回到这里
      path: '/pay-result',
      name: 'pay-result',
      component: () => import('@/views/pay-result.vue')
    },
    {
      path: '/complaint',
      name: 'complaint',
      component: () => import('@/views/complaint.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/register.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile.vue'),
      // 需要登录才能访问：未登录时由下方守卫重定向到登录页
      meta: { requiresAuth: true }
    }
  ]
})

/**
 * 全局前置守卫：访问需要登录的页面时，未登录则先跳登录页
 * TODO: 接入真实接口后，可改为校验 token 是否有效
 */
router.beforeEach((to) => {
  // 带上原地址，登录成功后才能回到用户本来想去的页面
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
