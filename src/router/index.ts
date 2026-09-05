import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { hideNav: true, public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { hideNav: true, public: true },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/pages/home/HomePage.vue'),
    },
    {
      path: '/survey/create',
      name: 'survey-create',
      component: () => import('@/pages/survey/CreatePage.vue'),
    },
    {
      path: '/survey/mine',
      name: 'survey-mine',
      component: () => import('@/pages/survey/MinePage.vue'),
    },
    {
      path: '/survey/:id/stats',
      name: 'survey-stats',
      component: () => import('@/pages/survey/StatsPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/profile/ProfilePage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // Invite links must land on the register page (not home), even if a session exists.
  const inviteQ = to.query.invite
  const hasInvite = typeof inviteQ === 'string' ? Boolean(inviteQ.trim()) : Array.isArray(inviteQ)
  if (to.name === 'register' && hasInvite) {
    return true
  }
  if ((to.name === 'login' || to.name === 'register') && userStore.token) {
    return { name: 'home' }
  }
  return true
})

export default router
