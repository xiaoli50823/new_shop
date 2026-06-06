<template>
  <div class="page-content">
    <div class="page-header">
      <h1>新品上线</h1>
      <p>最新上架，抢先体验</p>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="cat in categories"
          :key="cat.value"
          class="filter-tab"
          :class="{ active: activeCategory === cat.value }"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </div>
      </div>
      <select v-model="sortType" class="sort-select" @change="fetchBoxes">
        <option value="newest">最新上架</option>
        <option value="price_asc">价格从低到高</option>
        <option value="price_desc">价格从高到低</option>
      </select>
    </div>

    <div v-loading="loading" class="products-grid">
      <div
        v-for="item in products"
        :key="item.id"
        class="product-card"
        @click="goDetail(item.id)"
      >
        <div class="product-image">
          <img :src="item.image || '/placeholder.svg'" :alt="item.name" />
          <span class="new-badge">NEW</span>
        </div>
        <div class="product-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <div class="product-footer">
            <span class="price">&yen;{{ item.price }}</span>
            <button class="try-btn">立即体验 &rsaquo;</button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && products.length === 0" description="暂无新品盲盒" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { blindBoxAPI } from '@/services/api'

const router = useRouter()
const loading = ref(false)
const products = ref<any[]>([])
const activeCategory = ref('')
const sortType = ref('newest')

const categories = [
  { label: '全部', value: '' },
  { label: '动漫系列', value: 'anime' },
  { label: '游戏系列', value: 'game' },
  { label: '潮玩手办', value: 'figure' },
  { label: '影视IP', value: 'movie' },
  { label: '设计师款', value: 'designer' }
]

const fetchBoxes = async () => {
  loading.value = true
  try {
    const res = await blindBoxAPI.getNew({
      category: activeCategory.value || undefined
    })
    if (res.code === 200 && res.data) {
      let list = res.data || []
      if (sortType.value === 'price_asc') list.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))
      else if (sortType.value === 'price_desc') list.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price))
      products.value = list
    }
  } catch { /* silent */ }
  finally { loading.value = false }
}

const selectCategory = (value: string) => { activeCategory.value = value; fetchBoxes() }
const goDetail = (id: number) => router.push(`/blind-box/${id}`)

onMounted(() => fetchBoxes())
</script>

<style scoped>
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: var(--beige);
}

.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 600; color: var(--text-primary); margin: 0 0 6px; }
.page-header p { font-size: 14px; color: var(--text-light); margin: 0; }

.filter-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 14px 20px;
  background: var(--white); border-radius: var(--radius-card);
  border: 1px solid var(--border);
}

.filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }

.filter-tab {
  padding: 8px 16px; border-radius: 6px;
  font-size: 13px; color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
  border: 1px solid var(--border); background: var(--white);
}

.filter-tab:hover { border-color: var(--ink); color: var(--ink); }
.filter-tab.active { background: var(--ink); color: var(--white); border-color: var(--ink); }

.sort-select {
  padding: 8px 16px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--white);
  font-size: 13px; color: var(--text-primary); outline: none; cursor: pointer;
}

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

.product-card {
  background: var(--white); border-radius: var(--radius-card);
  overflow: hidden; cursor: pointer; transition: all 0.2s;
  border: 1px solid var(--border);
}

.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card-hover); }

.product-image {
  position: relative; width: 100%; padding-top: 100%;
  overflow: hidden; background: var(--beige);
}

.product-image img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }

.new-badge {
  position: absolute; top: 8px; right: 8px;
  padding: 3px 10px; background: var(--ink);
  color: var(--white); font-size: 11px; border-radius: 3px; font-weight: 600;
}

.product-info { padding: 14px; }

.product-info h3 {
  font-size: 14px; font-weight: 500; color: var(--text-primary);
  margin: 0 0 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.product-info p {
  font-size: 12px; color: var(--text-light); margin: 0 0 12px;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; height: 32px;
}

.product-footer { display: flex; justify-content: space-between; align-items: center; }
.price { font-size: 16px; font-weight: 600; color: var(--charcoal); }

.try-btn {
  padding: 6px 16px; background: var(--ink); color: var(--white);
  border: none; border-radius: 6px; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: opacity 0.2s;
}

.try-btn:hover { opacity: 0.85; }
</style>
