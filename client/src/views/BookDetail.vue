<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, RouterLink, useRouter } from 'vue-router';
import { bookApi, borrowApi } from '../api';
import { useUserStore } from '../stores/user';
import { useToast } from '../composables/useToast';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const book = ref(null);
const loading = ref(true);
const showApplyModal = ref(false);
const submitting = ref(false);

const applyForm = reactive({
  duration: '',
  handover_time: '',
});

const durationOptions = [
  '1周以内',
  '1-2周',
  '2-4周',
  '1-2个月',
  '2个月以上',
];

const conditionClass = {
  全新: 'cond-new',
  九成新: 'cond-good',
  有划线: 'cond-marked',
};

async function fetchBook() {
  loading.value = true;
  try {
    const res = await bookApi.detail(route.params.id);
    book.value = res.book;
  } catch (e) {
    toast.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function openApply() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  if (book.value.owner_id === userStore.userInfo.id) {
    toast.info('这是您自己发布的书');
    return;
  }
  if (book.value.status !== '可借阅') {
    toast.info('该书当前不可借阅');
    return;
  }
  applyForm.duration = '';
  applyForm.handover_time = '';
  showApplyModal.value = true;
}

async function submitApply() {
  if (!applyForm.duration || !applyForm.handover_time) {
    toast.error('请填写完整信息');
    return;
  }
  try {
    submitting.value = true;
    await borrowApi.create({
      book_id: book.value.id,
      duration: applyForm.duration,
      handover_time: applyForm.handover_time,
    });
    toast.success('借阅申请已提交，等待书主审批');
    showApplyModal.value = false;
  } catch (e) {
    toast.error(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(fetchBook);
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">← 返回书市</RouterLink>

    <div v-if="loading" class="loading-wrap">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="!book" class="empty">
      <div class="empty-icon">📭</div>
      <p>书籍不存在或已被删除</p>
    </div>

    <div v-else class="detail-grid">
      <div class="detail-cover-card">
        <div class="cover-display">
          <span class="cover-big">📖</span>
        </div>
        <div class="cover-tags">
          <span class="tag cond-tag" :class="conditionClass[book.condition]">
            {{ book.condition }}
          </span>
          <span class="tag cat-tag">{{ book.category }}</span>
          <span class="tag status-tag" :class="book.status === '可借阅' ? 'st-available' : 'st-borrowed'">
            {{ book.status }}
          </span>
        </div>
      </div>

      <div class="detail-info-card">
        <h1 class="book-title">{{ book.title }}</h1>
        <p class="book-author">✍️ {{ book.author }}</p>

        <div class="info-section">
          <h3 class="section-h">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">所属楼栋</span>
              <span class="info-value">🏢 {{ book.building }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">书籍品类</span>
              <span class="info-value">📂 {{ book.category }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">品相状态</span>
              <span class="info-value">{{ book.condition }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前状态</span>
              <span class="info-value">{{ book.status }}</span>
            </div>
          </div>
        </div>

        <div v-if="book.description" class="info-section">
          <h3 class="section-h">书籍描述</h3>
          <p class="book-desc">{{ book.description }}</p>
        </div>

        <div class="info-section">
          <h3 class="section-h">书主信息</h3>
          <div class="owner-card">
            <div class="owner-avatar">🏠</div>
            <div class="owner-info">
              <div class="owner-name">{{ book.owner_name }}</div>
              <div class="owner-building">{{ book.owner_building }} · 邻居</div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button
            class="btn btn-primary btn-lg btn-block"
            :disabled="book.status !== '可借阅' || book.owner_id === userStore.userInfo?.id"
            @click="openApply"
          >
            <template v-if="book.owner_id === userStore.userInfo?.id">
              📌 这是我发布的书
            </template>
            <template v-else-if="book.status !== '可借阅'">
              ⏳ 当前不可借阅
            </template>
            <template v-else>
              🙏 申请借阅这本书
            </template>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showApplyModal" class="modal-mask" @click.self="showApplyModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>申请借阅</h3>
            <button class="modal-close" @click="showApplyModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-book">
              <span class="modal-book-cover">📖</span>
              <div>
                <div class="modal-book-title">{{ book?.title }}</div>
                <div class="modal-book-author">{{ book?.author }}</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">想借多久 <span class="required">*</span></label>
              <select v-model="applyForm.duration" class="form-select">
                <option value="" disabled>请选择时长</option>
                <option v-for="d in durationOptions" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">方便交接时间 <span class="required">*</span></label>
              <input
                v-model="applyForm.handover_time"
                class="form-input"
                placeholder="如：工作日晚7点后 / 周末全天"
                type="text"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showApplyModal = false">取消</button>
            <button class="btn btn-primary" :disabled="submitting" @click="submitApply">
              {{ submitting ? '提交中...' : '提交申请' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-link {
  font-size: 14px;
  color: var(--text-secondary);
  align-self: flex-start;
  padding: 6px 4px;
}

.back-link:hover {
  color: var(--accent-brown);
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-warm);
  border-top-color: var(--accent-brown);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
}

.detail-cover-card,
.detail-info-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-soft);
}

.cover-display {
  height: 260px;
  background: linear-gradient(135deg, #f0e6d6 0%, #e6d5be 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.cover-big {
  font-size: 100px;
  filter: drop-shadow(0 4px 16px rgba(139, 115, 85, 0.2));
}

.cover-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.cond-tag.cond-new { background: #e0ece0; color: #3d6b3d; }
.cond-tag.cond-good { background: #e6e0d0; color: #8b6f3e; }
.cond-tag.cond-marked { background: #eadcd0; color: #9e6b48; }
.cat-tag { background: var(--bg-cream-dark); color: var(--accent-brown-dark); }
.status-tag.st-available { background: #e0ece0; color: #3d6b3d; }
.status-tag.st-borrowed { background: #fbead9; color: var(--status-pending); }

.book-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.book-author {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.section-h {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-warm);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
}

.info-label {
  font-size: 12px;
  color: var(--text-muted);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.book-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  padding: 12px 16px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
}

.owner-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
}

.owner-avatar {
  width: 44px;
  height: 44px;
  background: var(--bg-warm);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.owner-info {
  display: flex;
  flex-direction: column;
}

.owner-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.owner-building {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-lg {
  padding: 14px;
  font-size: 15px;
}

.btn-block {
  width: 100%;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(74, 63, 53, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(74, 63, 53, 0.2);
  animation: slideUp 0.25s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-warm);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.modal-close {
  font-size: 20px;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 6px;
}

.modal-close:hover {
  background: var(--bg-cream-dark);
  color: var(--text-main);
}

.modal-body {
  padding: 24px;
}

.modal-book {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-cream-dark);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.modal-book-cover {
  font-size: 36px;
}

.modal-book-title {
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.modal-book-author {
  font-size: 13px;
  color: var(--text-muted);
}

.required {
  color: var(--status-rejected);
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--border-warm);
  background: var(--bg-cream-dark);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
