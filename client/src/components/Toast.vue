<script setup>
import { useToast } from '../composables/useToast';

const { toastList } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <div
        v-for="t in toastList"
        :key="t.id"
        class="toast"
        :class="`toast-${t.type}`"
      >
        {{ t.message }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast {
  padding: 12px 24px;
  background: #4a3f35;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.2);
  font-size: 14px;
  animation: slideDown 0.3s ease;
  pointer-events: auto;
}

.toast-success {
  background: #5a8a5a;
}

.toast-error {
  background: #a86464;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
