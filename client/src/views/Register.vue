<script setup>
import { reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useToast } from '../composables/useToast';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const loading = ref(false);

const buildingOptions = [
  '1号楼',
  '2号楼',
  '3号楼',
  '4号楼',
  '5号楼',
  '6号楼',
  '7号楼',
  '8号楼',
  '9号楼',
  '10号楼',
];

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  building: '',
});

async function handleSubmit() {
  if (!form.username || !form.password || !form.building) {
    toast.error('请填写完整信息');
    return;
  }
  if (form.password.length < 6) {
    toast.error('密码至少 6 位');
    return;
  }
  if (form.password !== form.confirmPassword) {
    toast.error('两次密码不一致');
    return;
  }
  try {
    loading.value = true;
    await userStore.register({
      username: form.username,
      password: form.password,
      building: form.building,
    });
    toast.success('注册成功');
    router.replace('/');
  } catch (e) {
    toast.error(e.message || '注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🌟</div>
        <h1 class="auth-title">加入书香漂流</h1>
        <p class="auth-subtitle">注册账号，开始与邻居分享好书</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            class="form-input"
            type="text"
            placeholder="给自己取个名字"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label class="form-label">所在楼栋</label>
          <select v-model="form.building" class="form-select">
            <option value="" disabled>请选择楼栋</option>
            <option v-for="b in buildingOptions" :key="b" :value="b">
              {{ b }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            class="form-input"
            type="password"
            placeholder="至少 6 位"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model="form.confirmPassword"
            class="form-input"
            type="password"
            placeholder="再次输入密码"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block auth-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注 册' }}
        </button>
      </form>

      <div class="auth-footer">
        <span>已有账号？</span>
        <RouterLink to="/login" class="auth-link">去登录</RouterLink>
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
</style>
