<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { bookApi } from '../api';
import { useToast } from '../composables/useToast';
import { useUserStore } from '../stores/user';

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const submitting = ref(false);

const conditionOptions = ['全新', '九成新', '有划线'];
const categoryOptions = [
  '文学',
  '历史',
  '哲学',
  '心理学',
  '经济',
  '科幻',
  '悬疑',
  '童书',
  '科技',
  '艺术',
  '生活',
  '教育',
  '其他',
];

const form = reactive({
  title: '',
  author: '',
  condition: '',
  category: '',
  description: '',
});

async function handleSubmit() {
  if (!form.title || !form.author || !form.condition || !form.category) {
    toast.error('请填写必填项');
    return;
  }
  try {
    submitting.value = true;
    await bookApi.create({ ...form });
    toast.success('发布成功！邻居们很快就能看到啦');
    setTimeout(() => router.push('/'), 800);
  } catch (e) {
    toast.error(e.message || '发布失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="publish-page">
    <div class="page-head">
      <h1 class="page-title">✏️ 发布书籍</h1>
      <p class="page-sub">把你想借出的书分享给邻居们吧</p>
    </div>

    <div class="form-card">
      <div class="form-hint">
        <div class="hint-icon">💡</div>
        <div class="hint-content">
          <p class="hint-title">发布须知</p>
          <p class="hint-text">
            书籍将自动关联您的楼栋（<strong>{{ userStore.userInfo?.building }}</strong>），方便同楼栋邻居交接。
            请如实描述书籍品相，让借阅人心中有数。
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="publish-form">
        <div class="form-row">
          <div class="form-group grow">
            <label class="form-label">
              书名 <span class="required">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="例如：百年孤独"
            />
          </div>
          <div class="form-group grow">
            <label class="form-label">
              作者 <span class="required">*</span>
            </label>
            <input
              v-model="form.author"
              type="text"
              class="form-input"
              placeholder="例如：加西亚·马尔克斯"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group grow">
            <label class="form-label">
              品相 <span class="required">*</span>
            </label>
            <div class="option-pills">
              <button
                v-for="c in conditionOptions"
                :key="c"
                type="button"
                class="pill"
                :class="{ active: form.condition === c }"
                @click="form.condition = c"
              >
                {{ c }}
              </button>
            </div>
          </div>
          <div class="form-group grow">
            <label class="form-label">
              品类 <span class="required">*</span>
            </label>
            <select v-model="form.category" class="form-select">
              <option value="" disabled>请选择品类</option>
              <option v-for="c in categoryOptions" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">书籍简介（选填）</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="简单介绍一下这本书，比如：适合什么人看、有没有特别想说明的..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="router.back()">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '发布中...' : '确认发布' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 780px;
  margin: 0 auto;
}

.page-head {
  text-align: center;
  padding: 8px 0 4px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.page-sub {
  font-size: 14px;
  color: var(--text-muted);
}

.form-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-soft);
}

.form-hint {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #f8f1e4 0%, #f0e6d6 100%);
  border-radius: var(--radius-md);
  margin-bottom: 28px;
}

.hint-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.hint-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-brown-dark);
  margin-bottom: 4px;
}

.hint-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.required {
  color: var(--status-rejected);
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.form-row > .form-group {
  margin-bottom: 18px;
}

.grow {
  flex: 1;
}

.option-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  padding: 9px 18px;
  border-radius: 22px;
  border: 1px solid var(--border-warm);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pill:hover {
  border-color: var(--accent-brown-light);
  color: var(--accent-brown-dark);
}

.pill.active {
  background: var(--accent-brown);
  border-color: var(--accent-brown);
  color: #fff;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border-warm);
}

.form-actions .btn {
  padding: 11px 28px;
  font-size: 14px;
}

@media (max-width: 640px) {
  .form-card {
    padding: 22px;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
