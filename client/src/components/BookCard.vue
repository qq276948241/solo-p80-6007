<script setup>
import { RouterLink } from 'vue-router';

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
});

const conditionColor = {
  全新: 'tag-new',
  九成新: 'tag-good',
  有划线: 'tag-marked',
};
</script>

<template>
  <RouterLink :to="{ name: 'book-detail', params: { id: book.id } }" class="book-card">
    <div class="book-cover">
      <span class="cover-emoji">📕</span>
    </div>
    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <div class="book-meta">
        <span class="tag" :class="conditionColor[book.condition]">{{ book.condition }}</span>
        <span class="tag tag-category">{{ book.category }}</span>
      </div>
      <div class="book-footer">
        <span class="building">🏢 {{ book.building }}</span>
        <span class="status" :class="book.status === '可借阅' ? 'available' : 'borrowed'">
          {{ book.status }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.book-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-soft);
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-warm);
}

.book-cover {
  height: 140px;
  background: linear-gradient(135deg, #f0e6d6 0%, #e6d5be 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.book-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.4) 0%,
    transparent 60%
  );
}

.cover-emoji {
  font-size: 56px;
  position: relative;
  z-index: 1;
}

.book-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 13px;
  color: var(--text-secondary);
}

.book-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-new {
  background: #e0ece0;
  color: #3d6b3d;
}

.tag-good {
  background: #e6e0d0;
  color: #8b6f3e;
}

.tag-marked {
  background: #eadcd0;
  color: #9e6b48;
}

.tag-category {
  background: var(--bg-cream-dark);
  color: var(--accent-brown-dark);
}

.book-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-warm);
  font-size: 12px;
}

.building {
  color: var(--text-secondary);
}

.status {
  font-weight: 500;
}

.status.available {
  color: var(--status-approved);
}

.status.borrowed {
  color: var(--status-pending);
}
</style>
