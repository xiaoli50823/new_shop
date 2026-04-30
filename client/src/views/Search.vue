<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-input-wrapper">
        <el-icon><Search /></el-icon>
        <input
          ref="searchInput"
          v-model="keyword"
          type="text"
          placeholder="搜索盲盒名称"
          @keyup.enter="doSearch"
          autofocus
        />
        <el-icon v-if="keyword" class="clear-icon" @click="clearKeyword"><CircleClose /></el-icon>
      </div>
      <span class="search-btn" @click="doSearch">搜索</span>
    </div>

    <!-- 搜索历史 -->
    <div v-if="!keyword && searchHistory.length > 0" class="history-section">
      <div class="section-header">
        <h4>搜索历史</h4>
        <el-icon class="clear-btn" @click="clearHistory"><Delete /></el-icon>
      </div>
      <div class="history-tags">
        <span
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @click="searchByTag(item)"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div v-if="!keyword" class="hot-section">
      <div class="section-header">
        <h4>🔥 热门搜索</h4>
      </div>
      <div class="hot-tags">
        <span
          v-for="(item, index) in hotKeywords"
          :key="index"
          class="hot-tag"
          @click="searchByTag(item)"
        >
          <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
          {{ item }}
        </span>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="keyword && searched" class="result-section">
      <div v-loading="loading" class="result-grid">
        <BlindBoxCard
          v-for="item in resultList"
          :key="item.id"
          :box="item"
        />
      </div>
      <el-empty v-if="!loading && resultList.length === 0" description="没有找到相关盲盒" />
    </div>

    <!-- 底部安全距离 -->
    <div class="bottom-safe"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Search, CircleClose, Delete } from '@element-plus/icons-vue'
import { blindBoxAPI } from '@/services/api'
import BlindBoxCard from '@/components/BlindBoxCard.vue'

const searchInput = ref<HTMLInputElement | null>(null)
const keyword = ref('')
const searched = ref(false)
const loading = ref(false)
const resultList = ref<any[]>([])

// 搜索历史
const searchHistory = ref<string[]>([])
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10

// 热门搜索
const hotKeywords = ref([
  '动漫手办', '泡泡玛特', '游戏周边', '美妆盲盒',
  '3C数码', '文具礼盒', '零食大礼包', '隐藏款'
])

const loadHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) searchHistory.value = JSON.parse(saved)
  } catch {}
}

const saveHistory = (keyword: string) => {
  const idx = searchHistory.value.indexOf(keyword)
  if (idx > -1) searchHistory.value.splice(idx, 1)
  searchHistory.value.unshift(keyword)
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
}

const clearKeyword = () => {
  keyword.value = ''
  searched.value = false
  resultList.value = []
}

const searchByTag = (tag: string) => {
  keyword.value = tag
  doSearch()
}

const doSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) return
  saveHistory(kw)
  searched.value = true
  loading.value = true
  try {
    const res = await blindBoxAPI.getList({ keyword: kw, page: 1, pageSize: 20 })
    resultList.value = res.data?.list || res.data || res.list || []
  } catch {
    resultList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
  nextTick(() => {
    searchInput.value?.focus()
  })
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg-pink);
}

/* 搜索栏 */
.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #F5F5F5;
  border-radius: var(--radius-btn);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.search-input-wrapper:focus-within {
  border-color: var(--primary-pink);
  background: #FFFFFF;
}

.search-input-wrapper .el-icon {
  color: var(--text-light);
  font-size: 18px;
  flex-shrink: 0;
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
}

.search-input-wrapper input::placeholder {
  color: #C0C4CC;
}

.clear-icon {
  cursor: pointer;
  color: var(--text-light) !important;
}

.search-btn {
  font-size: 14px;
  color: var(--primary-pink);
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

/* 历史 & 热搜 */
.history-section, .hot-section {
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.clear-btn {
  cursor: pointer;
  color: var(--text-light);
  font-size: 18px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  padding: 6px 14px;
  background: #FFFFFF;
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.history-tag:active {
  background: #FFF0F5;
}

.hot-tags {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hot-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.2s;
}

.hot-tag:active {
  color: var(--primary-pink);
}

.hot-tag:last-child {
  border-bottom: none;
}

.hot-rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-light);
  flex-shrink: 0;
}

.hot-rank.top {
  background: var(--primary-gradient);
  color: #FFFFFF;
}

/* 搜索结果 */
.result-section {
  padding: 12px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  min-height: 200px;
}

.bottom-safe {
  height: 20px;
}
</style>
