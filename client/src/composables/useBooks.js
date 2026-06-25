import { ref } from 'vue';
import { bookApi, filterApi } from '../api';

export function useBooks() {
  const books = ref([]);
  const buildings = ref(['全部']);
  const categories = ref(['全部']);
  const loading = ref(false);

  async function fetchFilters() {
    try {
      const [bRes, cRes] = await Promise.all([
        filterApi.buildings(),
        filterApi.categories(),
      ]);
      buildings.value = ['全部', ...bRes.buildings];
      categories.value = ['全部', ...cRes.categories];
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchBooks(query = {}) {
    loading.value = true;
    try {
      const { building, category, keyword } = query;
      const params = {};
      if (building && building !== '全部') params.building = building;
      if (category && category !== '全部') params.category = category;
      if (keyword && keyword.trim()) params.keyword = keyword.trim();
      const res = await bookApi.list(params);
      books.value = res.books;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    books,
    buildings,
    categories,
    loading,
    fetchFilters,
    fetchBooks,
  };
}
