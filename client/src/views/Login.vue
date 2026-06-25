<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useToast } from '../composables/useToast';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

async function handleSubmit() {
  if (!form.username || !form.password) {
    toast.error('请填写完整信息');
    return;
  }
  try {
    loading.value = true;
    await userStore.login(form);
    toast.success('登录成功');
    const redirect = route.query.redirect || '/';
    router.replace(redirect);
  } catch (e) {
    toast.error(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">📖</div>
        <h1 class="auth-title">欢迎回来</h1>
        <p class="auth-subtitle">登录书香漂流，开启你的阅读之旅</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            class="form-input"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block auth-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <div class="auth-footer">
        <span>还没有账号？</span>
        <RouterLink to="/register" class="auth-link">立即注册</RouterLink>
      </div>

      <div class="demo-tip">
        <p>💡 演示账号：demo1 / demo2 / demo3，密码均为 123456</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(176, 154, 124, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 115, 85, 0.1) 0%, transparent 50%),
    var(--bg-cream);
  padding: 24px;
}

.auth-card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(139, 115, 85, 0.12);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  font-size: 48px;
  margin-bottom: 12px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-brown-dark);
  margin-bottom: 6px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.auth-form {
  margin-bottom: 20px;
}

.auth-btn {
  margin-top: 8px;
  padding: 12px;
  font-size: 15px;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-link {
  color: var(--accent-brown);
  font-weight: 500;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}

.demo-tip {
  margin-top: 24px;
  padding: 12px 16px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}
</style>
