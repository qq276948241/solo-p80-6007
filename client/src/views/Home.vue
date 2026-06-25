<script setup>
import { reactive, watch, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useBooks } from '../composables/useBooks';
import BookCard from '../components/BookCard.vue';

const userStore = useUserStore();

const { books, buildings, categories, loading, fetchFilters, fetchBooks } = useBooks();

const filters = reactive({
  building: '全部',
  category: '全部',
  keyword: '',
});

function buildBookQuery() {
  return {
    building: filters.building,
    category: filters.category,
    keyword: filters.keyword,
  };
}

function loadBooks() {
  fetchBooks(buildBookQuery());
}

function onSearchSubmit() {
  loadBooks();
}

function onKeywordKeyup(e) {
  if (e.key === 'Enter') {
    loadBooks();
  }
}

watch(
  () => [filters.building, filters.category],
  () => loadBooks()
);

function resetFilters() {
  filters.building = '全部';
  filters.category = '全部';
  filters.keyword = '';
  loadBooks();
}

function clearKeyword() {
  filters.keyword = '';
  loadBooks();
}

onMounted(async () => {
  await fetchFilters();
  loadBooks();
});
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-left">
        <h1 class="hero-title">
          让好书在邻里间
          <span class="highlight">流动起来</span>
        </h1>
        <p class="hero-desc">
          把闲置的书借给邻居，从邻居那借来新书读。<br />
          以书为媒，共建有温度的书香社区。
        </p>
        <div class="hero-actions">
          <RouterLink
            v-if="userStore.isLoggedIn"
            to="/publish"
            class="btn btn-primary btn-lg"
          >
            ✏️ 发布我想借出的书
          </RouterLink>
          <RouterLink v-else to="/register" class="btn btn-primary btn-lg">
            🌟 立即加入社区
          </RouterLink>
          <RouterLink v-if="userStore.isLoggedIn" to="/mine" class="btn btn-secondary btn-lg">
            📋 查看我的空间
          </RouterLink>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-illustration">
          <div class="book-stack">
            <span class="stack-item s1">📗</span>
            <span class="stack-item s2">📘</span>
            <span class="stack-item s3">📙</span>
            <span class="stack-item s4">📕</span>
          </div>
          <div class="float-icon f1">🏡</div>
          <div class="float-icon f2">🤝</div>
        </div>
      </div>
    </section>

    <section class="search-bar">
      <div class="search-bar-inner">
        <span class="search-bar-icon">🔍</span>
        <input
          v-model="filters.keyword"
          type="text"
          placeholder="输入书名或作者，找找邻居们都在分享什么好书..."
          class="search-bar-input"
          @keyup="onKeywordKeyup"
        />
        <button
          v-if="filters.keyword"
          type="button"
          class="search-bar-clear"
          title="清除"
          @click="clearKeyword"
        >
          ✕
        </button>
        <button type="button" class="search-bar-btn" @click="onSearchSubmit">
          搜索
        </button>
      </div>
      <p class="search-bar-tip">
        搜索会和下方楼栋、品类筛选一起生效，比如选「3号楼」+ 搜「三体」，只看 3 号楼里的《三体》
      </p>
    </section>

    <section class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">楼栋</span>
          <div class="filter-chips">
            <button
              v-for="b in buildings"
              :key="b"
              class="chip"
              :class="{ active: filters.building === b }"
              @click="filters.building = b"
            >
              {{ b }}
            </button>
          </div>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">品类</span>
          <div class="filter-chips">
            <button
              v-for="c in categories"
              :key="c"
              class="chip"
              :class="{ active: filters.category === c }"
              @click="filters.category = c"
            >
              {{ c }}
            </button>
          </div>
        </div>
        <button
          v-if="filters.building !== '全部' || filters.category !== '全部' || filters.keyword"
          class="btn btn-ghost btn-sm reset-btn"
          @click="resetFilters"
        >
          重置筛选
        </button>
      </div>
    </section>

    <section class="books-section">
      <div class="section-header">
        <h2 class="section-title">📚 漂书屋</h2>
        <span class="books-count">共 {{ books.length }} 本书</span>
      </div>

      <div v-if="loading" class="loading-wrap">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="books.length === 0" class="empty">
        <div class="empty-icon">{{ filters.keyword ? '�' : '�' }}</div>
        <p v-if="filters.keyword">
          没找到相关书籍，换个关键词试试？
        </p>
        <p v-else>
          暂未找到符合条件的书籍
        </p>
        <p class="empty-sub" v-if="filters.keyword && (filters.building !== '全部' || filters.category !== '全部')">
          提示：当前还选了「{{ filters.building !== '全部' ? filters.building + ' / ' : '' }}{{ filters.category !== '全部' ? filters.category : '' }}」筛选，试试清空筛选再搜
        </p>
        <div class="empty-actions" style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
          <button v-if="filters.keyword" class="btn btn-outline btn-sm" @click="clearKeyword">
            清除关键词
          </button>
          <button
            v-if="filters.building !== '全部' || filters.category !== '全部' || filters.keyword"
            class="btn btn-secondary btn-sm"
            @click="resetFilters"
          >
            重置全部筛选
          </button>
        </div>
      </div>

      <div v-else class="books-grid">
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero {
  background: linear-gradient(135deg, #f5ece0 0%, #ede2d0 100%);
  border-radius: 24px;
  padding: 44px 48px;
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(139, 115, 85, 0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-left {
  flex: 1;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  margin-bottom: 14px;
}

.highlight {
  color: var(--accent-brown);
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  height: 10px;
  background: rgba(176, 154, 124, 0.3);
  border-radius: 4px;
  z-index: -1;
}

.hero-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 26px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 15px;
}

.hero-right {
  flex-shrink: 0;
  width: 240px;
  height: 200px;
  position: relative;
  z-index: 1;
}

.hero-illustration {
  width: 100%;
  height: 100%;
  position: relative;
}

.book-stack {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.stack-item {
  position: absolute;
  font-size: 64px;
  filter: drop-shadow(0 4px 12px rgba(139, 115, 85, 0.2));
  animation: float 4s ease-in-out infinite;
}

.s1 {
  transform: translate(-60px, -30px) rotate(-10deg);
  animation-delay: 0s;
}

.s2 {
  transform: translate(-20px, -10px) rotate(4deg);
  animation-delay: 0.3s;
}

.s3 {
  transform: translate(20px, 10px) rotate(-6deg);
  animation-delay: 0.6s;
}

.s4 {
  transform: translate(60px, 30px) rotate(8deg);
  animation-delay: 0.9s;
}

.float-icon {
  position: absolute;
  font-size: 32px;
  animation: bob 3s ease-in-out infinite;
}

.f1 {
  top: 0;
  left: 0;
  animation-delay: 0.2s;
}

.f2 {
  bottom: 10px;
  right: 10px;
  animation-delay: 0.8s;
}

@keyframes float {
  0%, 100% {
    transform: translate(var(--x, 0), var(--y, 0)) rotate(var(--r, 0));
  }
  50% {
    transform: translate(var(--x, 0), calc(var(--y, 0) - 8px)) rotate(var(--r, 0));
  }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.search-bar {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-bar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-cream);
  border: 2px solid var(--border-warm);
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  transition: all 0.2s ease;
}

.search-bar-inner:focus-within {
  border-color: var(--accent-brown-light);
  box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.08);
  background: #fffdf8;
}

.search-bar-icon {
  font-size: 18px;
  opacity: 0.55;
  flex-shrink: 0;
}

.search-bar-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  padding: 12px 6px;
  color: var(--text-main);
}

.search-bar-input::placeholder {
  color: var(--text-muted);
}

.search-bar-clear {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.search-bar-clear:hover {
  background: var(--bg-warm);
  color: var(--accent-brown-dark);
}

.search-bar-btn {
  background: var(--accent-brown);
  color: #fff;
  padding: 10px 26px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.search-bar-btn:hover {
  background: var(--accent-brown-dark);
}

.search-bar-tip {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 4px;
}

.filter-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-row:last-child {
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 44px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-cream-dark);
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.chip:hover {
  background: var(--bg-warm);
  color: var(--accent-brown-dark);
}

.chip.active {
  background: var(--accent-brown);
  color: #fff;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.25);
}

.reset-btn {
  flex-shrink: 0;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.books-count {
  font-size: 13px;
  color: var(--text-muted);
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

@media (max-width: 768px) {
  .hero {
    padding: 28px 24px;
    flex-direction: column;
    text-align: center;
  }
  .hero-right {
    width: 200px;
    height: 160px;
  }
  .hero-title {
    font-size: 24px;
  }
  .hero-actions {
    justify-content: center;
  }
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
}
</style>
