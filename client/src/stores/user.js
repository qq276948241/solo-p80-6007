import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isLoggedIn = computed(() => !!token.value);

  function saveAuth(t, u) {
    token.value = t;
    userInfo.value = u;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function clearAuth() {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function login(data) {
    const res = await authApi.login(data);
    saveAuth(res.token, res.user);
    return res;
  }

  async function register(data) {
    const res = await authApi.register(data);
    saveAuth(res.token, res.user);
    return res;
  }

  function logout() {
    clearAuth();
  }

  return { token, userInfo, isLoggedIn, login, register, logout };
});
