import { ref } from 'vue';

const toastList = ref([]);
let toastId = 0;

export function useToast() {
  function show(message, type = 'info', duration = 2500) {
    const id = ++toastId;
    toastList.value.push({ id, message, type });
    setTimeout(() => {
      const idx = toastList.value.findIndex((t) => t.id === id);
      if (idx > -1) {
        toastList.value.splice(idx, 1);
      }
    }, duration);
  }

  function success(msg) {
    show(msg, 'success');
  }

  function error(msg) {
    show(msg, 'error');
  }

  function info(msg) {
    show(msg, 'info');
  }

  return {
    toastList,
    show,
    success,
    error,
    info,
  };
}
