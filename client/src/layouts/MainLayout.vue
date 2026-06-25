<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const navItems = [
  { name: 'home', label: '书市首页', icon: '📚' },
  { name: 'publish', label: '发布书籍', icon: '✏️' },
  { name: 'mine', label: '我的空间', icon: '👤' },
];

const isActive = (name) => route.name === name;

function handleLogout() {
  userStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <RouterLink to="/" class="logo">
          <span class="logo-icon">📖</span>
          <span class="logo-text">书香漂流</span>
          <span class="logo-sub">小区二手书平台</span>
        </RouterLink>

        <nav class="nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="nav-item"
            :class="{ active: isActive(item.name) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <div class="user-info">
              <span class="user-avatar">🏠</span>
              <div class="user-detail">
                <span class="user-name">{{ userStore.userInfo?.username }}</span>
                <span class="user-building">{{ userStore.userInfo?.building }}</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="handleLogout">
              退出
            </button>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'login' }" class="btn btn-ghost btn-sm">
              登录
            </RouterLink>
            <RouterLink :to="{ name: 'register' }" class="btn btn-primary btn-sm">
              注册
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <p>🏡 书香漂流 · 让知识在邻里间流动</p>
        <p class="footer-sub">
          以书会友 · 低碳环保 · 共建书香社区
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-warm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 26px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-brown-dark);
  letter-spacing: 1px;
}

.logo-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.nav {
  display: flex;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg-cream-dark);
  color: var(--text-main);
}

.nav-item.active {
  background: var(--bg-warm);
  color: var(--accent-brown-dark);
  font-weight: 500;
}

.nav-icon {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
}

.user-avatar {
  font-size: 20px;
  background: var(--bg-warm);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.user-building {
  font-size: 11px;
  color: var(--text-muted);
}

.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px;
}

.footer {
  background: var(--bg-cream-dark);
  border-top: 1px solid var(--border-warm);
  padding: 28px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.footer-sub {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 12px 16px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
    gap: 4px;
  }
  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }
  .logo-sub {
    display: none;
  }
  .main {
    padding: 18px 16px;
  }
}
</style>
