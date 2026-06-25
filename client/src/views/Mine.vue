<script setup>
import { ref, onMounted, computed } from 'vue';
import { borrowApi } from '../api';
import { useToast } from '../composables/useToast';

const toast = useToast();
const loading = ref(false);
const activeTab = ref('pending');

const received = ref([]);
const sent = ref([]);

const tabs = [
  { key: 'pending', label: '待审批', icon: '⏳', badge: 0 },
  { key: 'borrowed', label: '我的借阅', icon: '📖' },
  { key: 'lent', label: '我的借出', icon: '📤' },
];

const pendingList = computed(() =>
  received.value.filter((r) => r.status === '待审批')
);

tabs[0].badge = pendingList.value.length;

const myBorrowedList = computed(() => [...sent.value].sort((a, b) => {
  const order = { '待审批': 0, '已通过': 1, '已归还': 2, '已拒绝': 3 };
  return (order[a.status] ?? 9) - (order[b.status] ?? 9);
}));

const myLentList = computed(() => [...received.value].filter(r => r.status !== '待审批').sort((a, b) => {
  const order = { '已通过': 0, '已归还': 1, '已拒绝': 2 };
  return (order[a.status] ?? 9) - (order[b.status] ?? 9);
}));

const statusClass = (s) => {
  const map = {
    待审批: 'status-pending',
    已通过: 'status-approved',
    已归还: 'status-returned',
    已拒绝: 'status-rejected',
  };
  return map[s] || '';
};

async function fetchAll() {
  loading.value = true;
  try {
    const [rRes, sRes] = await Promise.all([
      borrowApi.received(),
      borrowApi.sent(),
    ]);
    received.value = rRes.requests;
    sent.value = sRes.requests;
  } catch (e) {
    toast.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleApprove(id) {
  try {
    await borrowApi.approve(id);
    toast.success('已通过申请');
    await fetchAll();
  } catch (e) {
    toast.error(e.message || '操作失败');
  }
}

async function handleReject(id) {
  try {
    await borrowApi.reject(id);
    toast.success('已拒绝申请');
    await fetchAll();
  } catch (e) {
    toast.error(e.message || '操作失败');
  }
}

async function handleReturn(id, role) {
  try {
    await borrowApi.return(id);
    toast.success(role === 'owner' ? '已确认归还' : '已标记归还');
    await fetchAll();
  } catch (e) {
    toast.error(e.message || '操作失败');
  }
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m}-${day} ${hh}:${mm}`;
}

onMounted(fetchAll);
</script>

<template>
  <div class="mine-page">
    <div class="page-head">
      <h1 class="page-title">👤 我的空间</h1>
      <p class="page-sub">管理你的借阅申请、审批和书籍</p>
    </div>

    <div class="tab-nav card">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading-wrap">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <template v-else>
      <!-- 待审批 -->
      <section v-show="activeTab === 'pending'">
        <div v-if="pendingList.length === 0" class="empty card">
          <div class="empty-icon">🎐</div>
          <p>暂无待审批的申请</p>
          <p class="empty-sub">当邻居申请借阅你发布的书时，会显示在这里</p>
        </div>
        <div v-else class="list-stack">
          <div v-for="req in pendingList" :key="req.id" class="req-card card">
            <div class="req-main">
              <div class="req-book">
                <span class="book-emoji">📗</span>
                <div>
                  <h3 class="book-title">{{ req.book_title }}</h3>
                  <p class="book-author">{{ req.book_author }}</p>
                </div>
              </div>
              <div class="req-badge status-pending">待审批</div>
            </div>
            <div class="divider"></div>
            <div class="req-detail-grid">
              <div class="detail-item">
                <span class="d-label">申请人</span>
                <span class="d-value">
                  <span class="mini-avatar">🏠</span>
                  {{ req.borrower_name }}
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">楼栋</span>
                <span class="d-value">{{ req.borrower_building }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">借阅时长</span>
                <span class="d-value">⏱️ {{ req.duration }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">交接时间</span>
                <span class="d-value">🕒 {{ req.handover_time }}</span>
              </div>
              <div class="detail-item full">
                <span class="d-label">申请时间</span>
                <span class="d-value">{{ formatDate(req.created_at) }}</span>
              </div>
            </div>
            <div class="req-actions">
              <button class="btn btn-danger" @click="handleReject(req.id)">
                ✕ 拒绝
              </button>
              <button class="btn btn-success" @click="handleApprove(req.id)">
                ✓ 通过申请
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 我的借阅 -->
      <section v-show="activeTab === 'borrowed'">
        <div v-if="myBorrowedList.length === 0" class="empty card">
          <div class="empty-icon">📚</div>
          <p>还没有借阅记录</p>
          <p class="empty-sub">去首页逛逛，发现好书吧</p>
        </div>
        <div v-else class="list-stack">
          <div v-for="req in myBorrowedList" :key="req.id" class="req-card card">
            <div class="req-main">
              <div class="req-book">
                <span class="book-emoji">📘</span>
                <div>
                  <h3 class="book-title">{{ req.book_title }}</h3>
                  <p class="book-author">{{ req.book_author }}</p>
                </div>
              </div>
              <div class="req-badge" :class="statusClass(req.status)">
                {{ req.status }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="req-detail-grid">
              <div class="detail-item">
                <span class="d-label">书主</span>
                <span class="d-value">
                  <span class="mini-avatar">🏠</span>
                  {{ req.owner_name }}
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">楼栋</span>
                <span class="d-value">{{ req.owner_building }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">借阅时长</span>
                <span class="d-value">⏱️ {{ req.duration }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">交接时间</span>
                <span class="d-value">🕒 {{ req.handover_time }}</span>
              </div>
              <div class="detail-item full">
                <span class="d-label">申请时间</span>
                <span class="d-value">{{ formatDate(req.created_at) }}</span>
              </div>
            </div>
            <div v-if="req.status === '已通过'" class="req-actions single">
              <button class="btn btn-outline" @click="handleReturn(req.id, 'borrower')">
                🔄 我已归还
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 我的借出 -->
      <section v-show="activeTab === 'lent'">
        <div v-if="myLentList.length === 0" class="empty card">
          <div class="empty-icon">📤</div>
          <p>暂无借出记录</p>
          <p class="empty-sub">发布书籍后，有人借阅时会显示在这里</p>
        </div>
        <div v-else class="list-stack">
          <div v-for="req in myLentList" :key="req.id" class="req-card card">
            <div class="req-main">
              <div class="req-book">
                <span class="book-emoji">📙</span>
                <div>
                  <h3 class="book-title">{{ req.book_title }}</h3>
                  <p class="book-author">{{ req.book_author }}</p>
                </div>
              </div>
              <div class="req-badge" :class="statusClass(req.status)">
                {{ req.status }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="req-detail-grid">
              <div class="detail-item">
                <span class="d-label">借阅人</span>
                <span class="d-value">
                  <span class="mini-avatar">🏠</span>
                  {{ req.borrower_name }}
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">楼栋</span>
                <span class="d-value">{{ req.borrower_building }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">借阅时长</span>
                <span class="d-value">⏱️ {{ req.duration }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">交接时间</span>
                <span class="d-value">🕒 {{ req.handover_time }}</span>
              </div>
              <div class="detail-item full">
                <span class="d-label">申请时间</span>
                <span class="d-value">{{ formatDate(req.created_at) }}</span>
              </div>
            </div>
            <div v-if="req.status === '已通过'" class="req-actions single">
              <button class="btn btn-outline" @click="handleReturn(req.id, 'owner')">
                ✅ 确认已归还
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.mine-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 860px;
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

.tab-nav {
  display: flex;
  gap: 8px;
  padding: 10px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn:hover {
  background: var(--bg-cream-dark);
  color: var(--text-main);
}

.tab-btn.active {
  background: var(--bg-warm);
  color: var(--accent-brown-dark);
  box-shadow: inset 0 -2px 0 var(--accent-brown);
}

.tab-icon {
  font-size: 18px;
}

.tab-badge {
  background: var(--status-rejected);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
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

.empty-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.list-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.req-card {
  padding: 22px;
}

.req-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.req-book {
  display: flex;
  align-items: center;
  gap: 14px;
}

.book-emoji {
  width: 52px;
  height: 52px;
  background: var(--bg-warm);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.book-author {
  font-size: 13px;
  color: var(--text-muted);
}

.req-badge {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.req-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
  padding: 4px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.d-label {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 64px;
  flex-shrink: 0;
}

.d-value {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-avatar {
  width: 22px;
  height: 22px;
  background: var(--bg-warm);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.req-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border-warm);
}

.req-actions.single {
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .tab-nav {
    flex-wrap: wrap;
  }
  .tab-btn {
    padding: 10px 8px;
    font-size: 13px;
  }
  .req-card {
    padding: 18px;
  }
  .req-detail-grid {
    grid-template-columns: 1fr;
  }
  .req-actions {
    flex-direction: column-reverse;
  }
  .req-actions .btn {
    width: 100%;
  }
}
</style>
