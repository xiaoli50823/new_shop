<template>
  <div class="discover-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-bar" @click="goSearch">
        <el-icon><Search /></el-icon>
        <span>搜索你想要的盲盒...</span>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tags hide-scrollbar">
      <div
        v-for="cat in categories"
        :key="cat.value"
        class="tag-item"
        :class="{ active: activeCategory === cat.value }"
        @click="selectCategory(cat.value)"
      >
        {{ cat.label }}
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <span
          v-for="sort in sortOptions"
          :key="sort.value"
          class="filter-tab"
          :class="{ active: activeSort === sort.value }"
          @click="selectSort(sort.value)"
        >
          {{ sort.label }}
        </span>
      </div>
      <div class="filter-btn" @click="showFilter = true">
        <el-icon><Filter /></el-icon>
        <span>筛选</span>
      </div>
    </div>

    <!-- 瀑布流商品列表 -->
    <div v-loading="loading" class="waterfall-container">
      <div class="waterfall-column">
        <div
          v-for="(item, index) in leftColumn"
          :key="item.id"
          class="waterfall-item"
          @click="goDetail(item.id)"
        >
          <div class="item-cover">
            <img :src="item.coverImage || item.image || '/placeholder.svg'" :alt="item.name" />
            <div v-if="item.tag" class="item-tag" :class="getTagClass(item.tag)">{{ item.tag }}</div>
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-bottom">
              <span class="item-price">
                <span class="price-symbol">¥</span>{{ formatPrice(item.price) }}
              </span>
              <span class="item-sales" v-if="item.sales !== undefined">已售{{ formatCount(item.sales) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="waterfall-column">
        <div
          v-for="(item, index) in rightColumn"
          :key="item.id"
          class="waterfall-item"
          @click="goDetail(item.id)"
        >
          <div class="item-cover">
            <img :src="item.coverImage || item.image || '/placeholder.svg'" :alt="item.name" />
            <div v-if="item.tag" class="item-tag" :class="getTagClass(item.tag)">{{ item.tag }}</div>
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-bottom">
              <span class="item-price">
                <span class="price-symbol">¥</span>{{ formatPrice(item.price) }}
              </span>
              <span class="item-sales" v-if="item.sales !== undefined">已售{{ formatCount(item.sales) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && blindBoxList.length === 0" description="暂无相关盲盒" />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <span>加载更多</span>
    </div>
    <div v-if="!hasMore && blindBoxList.length > 0" class="no-more">
      <span>— 没有更多了 —</span>
    </div>

    <!-- 底部安全距离 -->
    <div class="bottom-safe"></div>

    <!-- 筛选弹窗 -->
    <el-drawer v-model="showFilter" direction="btt" size="50%" title="筛选">
      <div class="filter-content">
        <div class="filter-group">
          <h4>价格区间</h4>
          <div class="price-range">
            <el-input v-model.number="filterMinPrice" placeholder="最低价" type="number" />
            <span class="range-sep">—</span>
            <el-input v-model.number="filterMaxPrice" placeholder="最高价" type="number" />
          </div>
        </div>
        <div class="filter-group">
          <h4>类型</h4>
          <div class="type-tags">
            <span
              v-for="type in typeOptions"
              :key="type.value"
              class="type-tag"
              :class="{ active: filterType === type.value }"
              @click="filterType = filterType === type.value ? '' : type.value"
            >
              {{ type.label }}
            </span>
          </div>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="applyFilter">确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Filter } from '@element-plus/icons-vue'
import { blindBoxAPI } from '@/services/api'
import { formatPrice, formatCount } from '@/utils/format'

const router = useRouter()
const route = useRoute()

// 分类
const categories = ref<{ label: string; value: string }[]>([
  { label: '全部', value: '' }
])
const categoryMap = ref<Map<string, string>>(new Map())

onMounted(async () => {
  try {
    const res: any = await api.get('/categories')
    const cats = (res.data || []).map((c: any) => ({ label: c.name, value: c.value }))
    categories.value = [{ label: '全部', value: '' }, ...cats]
  } catch {
    // 使用默认
  }
})

// 排序
const sortOptions = [
  { label: '最新', value: 'newest' },
  { label: '最热', value: 'hot' },
  { label: '价格', value: 'price' }
]

// 类型
const typeOptions = [
  { label: '一番赏', value: 'ichiban' },
  { label: '无限盲盒', value: 'infinite' },
  { label: '哈希盲盒', value: 'hash' }
]

const activeCategory = ref('')
const activeSort = ref('newest')
const showFilter = ref(false)
const filterMinPrice = ref<number | undefined>(undefined)
const filterMaxPrice = ref<number | undefined>(undefined)
const filterType = ref('')

// 盲盒列表
const blindBoxList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)

// 瀑布流分列
const leftColumn = computed(() => {
  return blindBoxList.value.filter((_, i) => i % 2 === 0)
})

const rightColumn = computed(() => {
  return blindBoxList.value.filter((_, i) => i % 2 === 1)
})

// 获取列表
const fetchList = async (reset = false) => {
  if (reset) {
    page.value = 1
    blindBoxList.value = []
    hasMore.value = true
  }
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize,
      sort: activeSort.value
    }
    if (activeCategory.value) params.category = activeCategory.value
    if (filterMinPrice.value) params.minPrice = filterMinPrice.value
    if (filterMaxPrice.value) params.maxPrice = filterMaxPrice.value
    if (filterType.value) params.type = filterType.value
    if (route.query.keyword) params.keyword = route.query.keyword as string

    const res = await blindBoxAPI.getList(params)
    const list = res.data?.list || res.data || res.list || []
    if (reset) {
      blindBoxList.value = list
    } else {
      blindBoxList.value.push(...list)
    }
    hasMore.value = list.length >= pageSize
  } catch {
    if (reset) blindBoxList.value = []
  } finally {
    loading.value = false
  }
}

const selectCategory = (value: string) => {
  activeCategory.value = value
  fetchList(true)
}

const selectSort = (value: string) => {
  activeSort.value = value
  fetchList(true)
}

const loadMore = () => {
  page.value++
  fetchList(false)
}

const resetFilter = () => {
  filterMinPrice.value = undefined
  filterMaxPrice.value = undefined
  filterType.value = ''
}

const applyFilter = () => {
  showFilter.value = false
  fetchList(true)
}

const getTagClass = (tag: string) => {
  if (tag === '热门' || tag === 'hot') return 'tag-hot'
  if (tag === '新品' || tag === 'new') return 'tag-new'
  if (tag === '限量' || tag === 'limited') return 'tag-limited'
  return 'tag-default'
}

const goSearch = () => {
  router.push('/search')
}

const goDetail = (id: number | string) => {
  router.push(`/blind-box/${id}`)
}

onMounted(() => {
  if (route.query.category) {
    const cat = categories.find(c => c.label === route.query.category || c.value === route.query.category)
    if (cat) activeCategory.value = cat.value
  }
  fetchList(true)
})
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  background: var(--beige);
  padding-bottom: 70px;
}

.search-header {
  padding: 12px 16px;
  background: var(--white);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FFFFFF;
  border-radius: var(--radius-btn);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.search-bar .el-icon {
  color: var(--text-light);
  font-size: 18px;
}

.search-bar span {
  color: var(--text-light);
  font-size: 14px;
}

/* 分类标签 */
.category-tags {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px;
  overflow-x: auto;
  white-space: nowrap;
}

.tag-item {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tag-item.active {
  background: var(--primary-gradient);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
}

.filter-tabs {
  display: flex;
  gap: 16px;
}

.filter-tab {
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.filter-tab.active {
  color: var(--primary-pink);
  font-weight: 600;
  border-bottom-color: var(--primary-pink);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

/* 瀑布流 */
.waterfall-container {
  display: flex;
  gap: 10px;
  padding: 0 12px;
  min-height: 300px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waterfall-item {
  background: #FFFFFF;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.2s;
}

.waterfall-item:active {
  transform: scale(0.97);
}

.item-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.item-cover img {
  width: 100%;
  display: block;
}

.item-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #FFFFFF;
}

.tag-hot { background: var(--ink); }
.tag-new { background: var(--ink); }
.tag-limited { background: var(--ink); }
.tag-default { background: var(--ink); }

.item-info {
  padding: 10px 12px 12px;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-price {
  color: var(--danger);
  font-size: 16px;
  font-weight: 700;
}

.price-symbol {
  font-size: 12px;
}

.item-sales {
  font-size: 11px;
  color: var(--text-light);
}

/* 加载更多 */
.load-more, .no-more {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: var(--text-light);
}

.load-more {
  cursor: pointer;
  color: var(--primary-pink);
}

.bottom-safe {
  height: 20px;
}

/* 筛选弹窗 */
.filter-content {
  padding: 16px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-range .el-input {
  flex: 1;
}

.range-sep {
  color: var(--text-light);
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-tag {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  background: #F5F5F5;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tag.active {
  background: var(--primary-gradient);
  color: #FFFFFF;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.filter-actions .el-button {
  flex: 1;
  border-radius: var(--radius-btn);
}
</style>
