import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/Home.vue') },
      { path: 'book/:id', name: 'book-detail', component: () => import('../views/BookDetail.vue') },
      { path: 'publish', name: 'publish', component: () => import('../views/Publish.vue'), meta: { requiresAuth: true } },
      { path: 'mine', name: 'mine', component: () => import('../views/Mine.vue'), meta: { requiresAuth: true } },
    ],
  },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if ((to.name === 'login' || to.name === 'register') && userStore.isLoggedIn) {
    return { name: 'home' };
  }
});

export default router;
