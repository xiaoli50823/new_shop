<template>
  <div class="home-page">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="header-top">
        <div class="user-info" @click="goPersonal">
          <img :src="userStore.avatar || '/default-avatar.png'" class="avatar" alt="avatar" />
          <div class="greeting">
            <span class="hi">Hi, {{ userStore.username }}</span>
            <div class="balance-row" v-if="userStore.isLoggedIn">
              <span class="balance-item">
                <el-icon><Coin /></el-icon>
                {{ userStore.coins }}
              </span>
              <span class="balance-item">
                <el-icon><Star /></el-icon>
                {{ userStore.points }}
              </span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-icon :size="22" @click="goSearch"><Search /></el-icon>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar" @click="goSearch">
        <el-icon><Search /></el-icon>
        <span>搜索你想要的盲盒...</span>
      </div>
    </div>

    <!-- 轮播海报 -->
    <div class="banner-section">
      <el-carousel height="140px" :interval="4000" indicator-position="none" arrow="never">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ background: banner.bg }">
            <div class="banner-content">
              <h3>{{ banner.title }}</h3>
              <p>{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div
        v-for="cat in categories"
        :key="cat.name"
        class="category-item"
        @click="goCategory(cat.name)"
      >
        <div class="category-icon" :style="{ background: cat.bg }">
          <span>{{ cat.emoji }}</span>
        </div>
        <span class="category-label">{{ cat.name }}</span>
      </div>
    </div>

    <!-- 热门推荐 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔥</span> 热门推荐
        </h2>
        <span class="section-more" @click="goDiscover">查看更多 ></span>
      </div>
      <div v-loading="loading" class="blind-box-grid">
        <BlindBoxCard
          v-for="item in blindBoxList"
          :key="item.id"
          :box="item"
        />
        <el-empty v-if="!loading && blindBoxList.length === 0" description="暂无推荐盲盒" />
      </div>
    </div>

    <!-- 跑马灯播报 -->
    <div class="marquee-section" v-if="marqueeList.length > 0">
      <div class="marquee-header">
        <el-icon><Bell /></el-icon>
        <span>中奖播报</span>
      </div>
      <div class="marquee-wrapper">
        <div class="marquee-content" ref="marqueeRef">
          <span v-for="(item, index) in marqueeList" :key="index" class="marquee-item">
            🎉 {{ item.username }} 抽到了 <b>{{ item.prizeName }}</b>
          </span>
        </div>
      </div>
    </div>

    <!-- 底部安全距离 -->
    <div class="bottom-safe"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Bell, Coin, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { blindBoxAPI } from '@/services/api'
import BlindBoxCard from '@/components/BlindBoxCard.vue'

const router = useRouter()
const userStore = useUserStore()

// 轮播海报数据
const banners = ref([
  { title: '新用户福利', subtitle: '首抽立减10元', bg: 'linear-gradient(135deg, #FF6B9D, #FF8E53)' },
  { title: '限时活动', subtitle: '五连抽必得稀有', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { title: '会员日', subtitle: '积分翻倍活动', bg: 'linear-gradient(135deg, #2ED573, #7ED56F)' }
])

// 分类导航
const categories = ref([
  { name: '一番赏', emoji: '🎯', bg: 'linear-gradient(135deg, #FF6B9D, #FF8E53)' },
  { name: '无限盲盒', emoji: '🎁', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: '哈希盲盒', emoji: '🎲', bg: 'linear-gradient(135deg, #2ED573, #7ED56F)' },
  { name: '全部', emoji: '📦', bg: 'linear-gradient(135deg, #FFA502, #FFD700)' }
])

// 盲盒列表
const blindBoxList = ref<any[]>([])
const loading = ref(false)

// 跑马灯
const marqueeList = ref<any[]>([])
const marqueeRef = ref<HTMLElement | null>(null)
let marqueeTimer: number | null = null

// 获取盲盒推荐列表
const fetchBlindBoxes = async () => {
  loading.value = true
  try {
    const res = await blindBoxAPI.getList({ page: 1, pageSize: 10, sort: 'hot' })
    blindBoxList.value = res.data?.list || res.data || res.list || []
  } catch {
    blindBoxList.value = []
  } finally {
    loading.value = false
  }
}

// 获取中奖播报
const fetchMarquee = async () => {
  try {
    const res = await blindBoxAPI.getList({ page: 1, pageSize: 20 })
    // 用抽盒记录来模拟中奖播报
    const list = res.data?.list || res.data || []
    marqueeList.value = list.slice(0, 8).map((item: any, i: number) => ({
      username: `用户${String(i + 1).padStart(4, '0')}`,
      prizeName: item.name || '神秘奖品'
    }))
    if (marqueeList.value.length === 0) {
      marqueeList.value = [
        { username: '用户0088', prizeName: '限量版手办' },
        { username: '用户0123', prizeName: '隐藏款盲盒' },
        { username: '用户0456', prizeName: '稀有公仔' }
      ]
    }
  } catch {
    marqueeList.value = [
      { username: '用户0088', prizeName: '限量版手办' },
      { username: '用户0123', prizeName: '隐藏款盲盒' },
      { username: '用户0456', prizeName: '稀有公仔' }
    ]
  }
}

const goSearch = () => {
  router.push('/search')
}

const goPersonal = () => {
  if (userStore.isLoggedIn) {
    router.push('/personal')
  } else {
    router.push('/login')
  }
}

const goCategory = (name: string) => {
  router.push({ path: '/discover', query: { category: name } })
}

const goDiscover = () => {
  router.push('/discover')
}

onMounted(() => {
  fetchBlindBoxes()
  fetchMarquee()
})

onUnmounted(() => {
  if (marqueeTimer) {
    clearInterval(marqueeTimer)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 70px;
}

/* Header */
.header {
  padding: 16px 16px 0;
  background: linear-gradient(180deg, #FFE4EE 0%, var(--bg-pink) 100%);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.2);
}

.greeting {
  display: flex;
  flex-direction: column;
}

.hi {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.balance-row {
  display: flex;
  gap: 12px;
  margin-top: 2px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--text-secondary);
}

.balance-item .el-icon {
  color: var(--warning);
}

.header-actions {
  display: flex;
  gap: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FFFFFF;
  border-radius: var(--radius-btn);
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.search-bar:active {
  box-shadow: 0 2px 12px rgba(255, 107, 157, 0.15);
}

.search-bar .el-icon {
  color: var(--text-light);
  font-size: 18px;
}

.search-bar span {
  color: var(--text-light);
  font-size: 14px;
}

/* Banner */
.banner-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.banner-section :deep(.el-carousel__item) {
  border-radius: var(--radius-card);
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-radius: var(--radius-card);
}

.banner-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.banner-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

/* 分类导航 */
.category-nav {
  display: flex;
  justify-content: space-around;
  padding: 0 16px;
  margin-bottom: 24px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:active {
  transform: scale(0.92);
}

.category-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Section */
.section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.title-icon {
  font-size: 18px;
}

.section-more {
  font-size: 12px;
  color: var(--text-light);
  cursor: pointer;
}

/* 盲盒网格 */
.blind-box-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  min-height: 200px;
}

/* 跑马灯 */
.marquee-section {
  margin: 20px 16px;
  padding: 12px 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.marquee-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-pink);
}

.marquee-wrapper {
  overflow: hidden;
  height: 20px;
}

.marquee-content {
  display: flex;
  animation: marquee-scroll 20s linear infinite;
  white-space: nowrap;
}

.marquee-item {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 40px;
  flex-shrink: 0;
}

.marquee-item b {
  color: var(--primary-pink);
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.bottom-safe {
  height: 20px;
}
</style>
