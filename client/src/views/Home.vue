<template>
  <div class="home-container">
    <aside class="sidebar-left">
      <div class="logo-area">
        <div class="logo-mark">BB</div>
        <div class="logo-text">
          <h1>盲盒星球</h1>
          <p>BLIND BOX PLANET</p>
        </div>
      </div>
      <nav class="nav-menu">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path }"
          @click="goNav(item.path)"
        >
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-line"></span>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="header-top">
        <div class="search-wrapper">
          <input v-model="searchKeyword" type="text" placeholder="搜索盲盒、商品、系列..." class="search-input" @keyup.enter="handleSearch" />
        </div>
        <div class="header-right">
          <div class="currency-badges">
            <div class="points-badge">
              <span class="currency-value">{{ userPoints }}</span>
              <span class="currency-label">积分</span>
            </div>
            <div class="coin-badge">
              <span class="currency-value">{{ userCoins }}</span>
              <span class="currency-label">盲盒币</span>
            </div>
          </div>
          <button class="icon-btn" @click="goCabinet">盒柜</button>
          <button class="user-btn" @click="goPersonal">
            <span class="user-name">星球玩家</span>
            <span class="user-arrow">&rsaquo;</span>
          </button>
        </div>
      </header>

      <section class="banner-carousel">
        <div class="carousel-track">
          <div
            v-for="(banner, index) in banners"
            :key="index"
            class="carousel-item"
            :class="{ active: currentBanner === index }"
            :style="{ backgroundImage: banner.image ? `url(${banner.image})` : '' }"
          >
            <div class="banner-content">
              <span class="banner-tag">{{ banner.tag }}</span>
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.subtitle }}</p>
              <button class="banner-btn" @click="handleBannerClick(banner)">
                {{ banner.buttonText }}
                <span class="arrow">&rsaquo;</span>
              </button>
            </div>
          </div>
        </div>
        <div class="carousel-indicators">
          <button
            v-for="(_, index) in banners"
            :key="index"
            class="indicator"
            :class="{ active: currentBanner === index }"
            @click="currentBanner = index"
          ></button>
        </div>
      </section>

      <section class="hot-section">
        <div class="section-header">
          <h2>热门盲盒</h2>
          <button class="more-btn" @click="goDiscover">查看更多 &rsaquo;</button>
        </div>
        <div class="hot-grid">
          <div
            v-for="item in hotBoxes"
            :key="item.id"
            class="hot-card"
            @click="goDetail(item.id)"
          >
            <div class="hot-image-wrapper">
              <img :src="item.coverImage || item.image" :alt="item.name" />
              <span v-if="item.tag" class="hot-tag">{{ item.tag }}</span>
            </div>
            <h3 class="hot-name">{{ item.name }}</h3>
            <div class="hot-footer">
              <span class="hot-price">&yen;{{ item.price }}</span>
              <span class="hot-sales">已售{{ item.sales }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="category-section">
        <h2 class="section-title">盲盒专区</h2>
        <div class="category-tabs">
          <span
            v-for="cat in categories"
            :key="cat.value"
            class="category-tab"
            :class="{ active: activeCategory === cat.value }"
            @click="selectCategory(cat.value)"
          >{{ cat.label }}</span>
          <span class="category-more" @click="goDiscover">查看更多 &rsaquo;</span>
        </div>
        <div class="category-grid">
          <div
            v-for="item in categoryBoxes"
            :key="item.id"
            class="category-card"
            @click="goDetail(item.id)"
          >
            <img :src="item.coverImage || item.image" :alt="item.name" />
            <h3>{{ item.name }}</h3>
            <span class="category-price">&yen;{{ item.price }}</span>
          </div>
        </div>
      </section>
    </main>

    <aside class="sidebar-right">
      <div class="card personal-card">
        <div class="card-header">
          <div class="avatar-mark">U</div>
          <div class="user-info">
            <h3>星球玩家</h3>
            <span class="level-badge">Lv.6</span>
          </div>
        </div>
        <div class="exp-section">
          <div class="exp-label">
            <span>经验值</span>
            <span>11296 / 200000</span>
          </div>
          <div class="exp-bar">
            <div class="exp-fill"></div>
          </div>
        </div>
      </div>

      <div class="card sign-card" @click="goCheckIn">
        <h3>今日签到</h3>
        <p>连续签到 7 天 +50 积分</p>
        <div class="sign-action">立即签到 &rsaquo;</div>
      </div>

      <div class="card notice-card">
        <div class="notice-header">
          <h3>公告</h3>
          <span class="notice-more">更多 &rsaquo;</span>
        </div>
        <div class="notice-list">
          <div
            v-for="notice in notices"
            :key="notice.id"
            class="notice-item"
            @click="goNotice(notice.id)"
          >
            <span class="notice-title">{{ notice.title }}</span>
            <span class="notice-date">{{ notice.date }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { blindBoxAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchKeyword = ref('')
const activeCategory = ref('')
const currentBanner = ref(0)

const currentPath = computed(() => route.path)
const userPoints = computed(() => userStore.points || 0)
const userCoins = computed(() => userStore.coins || 0)

const banners = [
      { 
        tag: '热卖', 
        title: '赛博边际 · 义体迷行', 
        subtitle: '赛博朋克主题盲盒 · 义体改造人', 
        buttonText: '立即开盒',
        image: 'https://www.img2link.com/images/2026/05/04/61ab0675ad269e970a6e9b9c1d5fda01.png',
        link: '/blind-box/1'
      },
      { 
        tag: '新品', 
        title: '限定款潮玩手办', 
        subtitle: '设计师联名系列 · 今日首发', 
        buttonText: '立即开盒',
        image: 'https://images.unsplash.com/photo-1777216092678-ab3cac218f80?q=80&w=1599&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        link: '/hot'
      },
      { 
        tag: '限时', 
        title: '人气精选周边', 
        subtitle: '超多好物 · 等你来淘', 
        buttonText: '立即抢购',
        image: 'https://www.img2link.com/images/2026/05/04/41f98b85812d9b1b5e7fec762704350c.png',
        link: '/hot'
      }
    ]

let carouselTimer: ReturnType<typeof setInterval> | null = null

const startCarousel = () => {
  carouselTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.length
  }, 4000)
}

const stopCarousel = () => {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
}

const hotBoxes = ref<any[]>([])
const categoryBoxes = ref<any[]>([])
const loading = ref(false)

const fetchHotBoxes = async () => {
  try {
    const res = await blindBoxAPI.getHot(6)
    if (res.code === 200 && res.data) {
      hotBoxes.value = res.data.map((item: any) => ({
        id: item.id, name: item.name, price: item.price,
        sales: formatSales(item.sales), tag: item.tagText || '', image: item.image,
        coverImage: item.coverImage || item.image
      }))
    }
  } catch { /* silent */ }
}

const fetchCategoryBoxes = async () => {
  try {
    const category = activeCategory.value || 'all'
    const res = await blindBoxAPI.getByCategory(category, 12)
    if (res.code === 200 && res.data) {
      categoryBoxes.value = res.data.map((item: any) => ({
        id: item.id, name: item.name, price: item.price, image: item.image,
        coverImage: item.coverImage || item.image
      }))
    }
  } catch { /* silent */ }
}

const formatSales = (sales: number) => {
  if (sales >= 10000) return (sales / 10000).toFixed(1) + 'w'
  if (sales >= 1000) return (sales / 1000).toFixed(1) + 'k'
  return sales.toString()
}

onMounted(() => { startCarousel(); fetchHotBoxes(); fetchCategoryBoxes(); userStore.fetchUserInfo() })
onUnmounted(() => { stopCarousel() })

const navItems = [
  { path: '/', label: '首页' },
  { path: '/discover', label: '盲盒专区' },
  { path: '/hot', label: '热门周边' },
  { path: '/infinite', label: '无限盲盒' },
  { path: '/new', label: '新品上线' },
  { path: '/points-mall', label: '积分商城' }
]

const categories = [
  { label: '全部', value: '' },
  { label: '动漫系列', value: 'anime' },
  { label: '游戏系列', value: 'game' },
  { label: '潮玩手办', value: 'figure' },
  { label: '影视IP', value: 'movie' },
  { label: '设计师款', value: 'designer' },
  { label: '节日潮玩', value: 'holiday' }
]

const notices = [
  { id: 1, title: '海贼王系列全新上线', date: '05-20' },
  { id: 2, title: '赛博朋克2077补货通知', date: '05-18' },
  { id: 3, title: '端午节活动预告', date: '05-15' },
  { id: 4, title: '系统维护公告', date: '05-12' }
]

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } })
  }
}

const goNav = (path: string) => router.push(path)
const goDiscover = () => router.push('/discover')
const goCheckIn = () => router.push('/check-in')
const goDetail = (id: number) => router.push(`/blind-box/${id}`)
const handleBannerClick = (banner: { link?: string }) => {
  if (banner.link) router.push(banner.link)
}
const goCabinet = () => router.push('/box-cabinet')
const goPersonal = () => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  router.push('/personal')
}
const goNotice = (id: number) => router.push(`/notice/${id}`)
const selectCategory = (value: string) => { activeCategory.value = value; fetchCategoryBoxes() }
</script>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background: var(--beige);
  font-family: 'Noto Sans SC', sans-serif;
}

.sidebar-left {
  width: 220px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0;
  height: 100vh;
  z-index: 100;
  border-right: 1px solid var(--border);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.logo-mark {
  width: 40px; height: 40px;
  background: var(--ink);
  color: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-text h1 {
  font-size: 17px; font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.logo-text p {
  font-size: 9px;
  color: var(--text-light);
  letter-spacing: 1px;
  margin: 2px 0 0;
}

.nav-menu { padding: 12px; }

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  font-size: 14px;
}

.nav-item:hover { background: var(--beige); color: var(--text-primary); }

.nav-item.active {
  background: var(--ink-subtle);
  color: var(--ink);
  font-weight: 500;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  margin-right: 300px;
  padding: 20px;
  min-height: 100vh;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--white);
  padding: 12px 20px;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: var(--beige);
  border-radius: 8px;
  padding: 10px 14px;
  width: 360px;
  border: 1px solid transparent;
  transition: border 0.2s;
}

.search-wrapper:focus-within { border-color: var(--ink); background: var(--white); }

.search-input {
  flex: 1; border: none; background: transparent;
  outline: none; font-size: 13px; color: var(--text-primary);
}

.search-input::placeholder { color: var(--text-light); }

.header-right { display: flex; align-items: center; gap: 14px; }

.currency-badges { display: flex; gap: 10px; }

.points-badge, .coin-badge {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid var(--border);
  background: var(--white);
}

.currency-value { font-weight: 600; color: var(--text-primary); }
.currency-label { font-size: 11px; color: var(--text-light); }

.icon-btn {
  padding: 8px 14px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.icon-btn:hover { border-color: var(--ink); color: var(--ink); }

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover { border-color: var(--ink); }

.user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.user-arrow { font-size: 16px; color: var(--text-light); }

.banner-carousel {
  position: relative;
  height: 220px;
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--ink);
}

.carousel-track { position: relative; width: 100%; height: 100%; }

.carousel-item {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  opacity: 0; visibility: hidden;
  transition: all 0.6s ease;
  background-size: cover;
  background-position: center;
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, rgba(58,80,104,0.9) 0%, rgba(58,80,104,0.6) 60%, rgba(58,80,104,0.3) 100%);
}

.carousel-item.active { opacity: 1; visibility: visible; }

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-tag {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(255,255,255,0.2);
  color: var(--white);
  font-size: 11px;
  border-radius: 3px;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.banner-content h2 {
  font-size: 32px; font-weight: 600;
  color: var(--white); margin: 0 0 6px;
}

.banner-content p {
  font-size: 15px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 18px;
}

.banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  background: var(--white);
  color: var(--ink);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.banner-btn:hover { opacity: 0.9; }

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 3;
}

.indicator {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  border: none; cursor: pointer;
  transition: all 0.2s;
}

.indicator.active { background: var(--white); width: 20px; border-radius: 4px; }

.hot-section { margin-bottom: 20px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 { font-size: 18px; font-weight: 600; color: var(--text-primary); }

.more-btn {
  color: var(--text-light);
  font-weight: 400;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
}

.more-btn:hover { color: var(--ink); }

.hot-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }

.hot-card {
  background: var(--white);
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
}

.hot-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card-hover); }

.hot-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: var(--beige);
}

.hot-image-wrapper img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}

.hot-tag {
  position: absolute;
  top: 8px; left: 8px;
  padding: 3px 10px;
  background: var(--ink);
  color: var(--white);
  font-size: 11px;
  border-radius: 3px;
  font-weight: 500;
}

.hot-name {
  padding: 10px 10px 4px;
  font-size: 13px; font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-footer {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
}

.hot-price { font-size: 15px; font-weight: 600; color: var(--charcoal); }

.hot-sales { font-size: 11px; color: var(--text-light); }

.category-section {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 20px;
  border: 1px solid var(--border);
}

.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }

.category-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }

.category-tab {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
  background: var(--white);
}

.category-tab:hover { border-color: var(--ink); color: var(--ink); }

.category-tab.active {
  background: var(--ink);
  color: var(--white);
  border-color: var(--ink);
}

.category-more {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
}

.category-more:hover { color: var(--ink); }

.category-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }

.category-card {
  background: var(--beige);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }

.category-card img { width: 100%; aspect-ratio: 1; object-fit: cover; }

.category-card h3 {
  padding: 8px 10px 2px;
  font-size: 12px; font-weight: 500;
  color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.category-price {
  display: block;
  padding: 0 10px 8px;
  font-size: 14px; font-weight: 600;
  color: var(--charcoal);
}

.sidebar-right {
  width: 300px;
  padding: 20px 14px;
  position: fixed;
  right: 0; top: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--beige-warm);
  border-left: 1px solid var(--border);
}

.card {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 16px;
  border: 1px solid var(--border);
  margin-bottom: 14px;
}

.personal-card { padding: 18px; }

.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

.avatar-mark {
  width: 46px; height: 46px;
  background: var(--ink);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.user-info h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }

.level-badge {
  padding: 2px 10px;
  background: var(--ink-subtle);
  color: var(--ink);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.exp-section { margin-top: 12px; }

.exp-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-light);
  margin-bottom: 6px;
}

.exp-bar {
  height: 4px;
  background: var(--beige);
  border-radius: 2px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  width: 5.6%;
  background: var(--ink);
  border-radius: 2px;
}

.sign-card {
  background: var(--ink);
  color: var(--white);
  cursor: pointer;
  border: none;
}

.sign-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.sign-card p { font-size: 12px; opacity: 0.8; margin-bottom: 12px; }

.sign-action {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
}

.sign-card:hover .sign-action { opacity: 1; }

.notice-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.notice-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.notice-more { font-size: 12px; color: var(--text-light); cursor: pointer; }
.notice-more:hover { color: var(--ink); }

.notice-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.notice-item:last-child { border-bottom: none; }
.notice-item:hover { color: var(--text-primary); }
.notice-date { font-size: 11px; color: var(--text-light); flex-shrink: 0; }

@media (max-width: 1440px) {
  .hot-grid, .category-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1280px) {
  .sidebar-right { display: none; }
  .main-content { margin-right: 0; }
}

@media (max-width: 1100px) {
  .sidebar-left { display: none; }
  .main-content { margin-left: 0; }
}

@media (max-width: 900px) {
  .hot-grid, .category-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 640px) {
  .hot-grid, .category-grid { grid-template-columns: repeat(2, 1fr); }
  .search-wrapper { width: 100%; }
  .header-top { flex-direction: column; gap: 12px; }
}
</style>
