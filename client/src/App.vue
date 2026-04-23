<template>
  <div id="app">
    <!-- 顶部导航栏（仅在用户端页面显示） -->
    <div v-if="showNavbar" class="navbar">
      <div class="nav-brand">
        <div class="logo-container">
          <h1 class="logo-main">盲盒星球</h1>
          <span class="logo-sub">BLIND BOX PLANET</span>
        </div>
      </div>
      <div class="nav-search">
        <input type="text" placeholder="搜索盲盒..." class="search-input" />
        <button class="search-btn">搜索</button>
      </div>
      <div class="nav-icons">
        <div class="nav-icon-item" @click="goToCart">
          <span class="icon-text">背包</span>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </div>
        <div class="nav-icon-item" @click="showNotifications">
          <span class="icon-text">通知</span>
          <span v-if="notifCount > 0" class="badge">{{ notifCount }}</span>
        </div>
      </div>
      <div class="nav-menu">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path }"
          @click="navigateTo(item.path)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 导航项
const navItems = ref([
  { path: '/', text: '首页' },
  { path: '/box-cabinet', text: '盒柜' },
  { path: '/personal', text: '我的' }
])

// 当前路径
const currentPath = ref(route.path)

// 购物车数量
const cartCount = ref(3)

// 通知数量
const notifCount = ref(5)

// 监听路由变化
watch(() => route.path, (newPath) => {
  currentPath.value = newPath
})

// 是否显示导航栏（不在管理端页面显示）
const showNavbar = computed(() => {
  return !route.path.startsWith('/admin')
})

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 跳转到购物车
const goToCart = () => {
  router.push('/box-cabinet')
}

// 显示通知
const showNotifications = () => {
  alert('暂无新通知')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Noto+Sans+SC:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', 'Inter', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F5F6F8;
  min-height: 100vh;
  color: #333333;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #FFFFFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-bottom: 3px solid #00BCD4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-main {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(58, 123, 213, 0.2));
  margin: 0;
  line-height: 1.2;
}

.logo-sub {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #666666;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav-search {
  flex: 1;
  max-width: 400px;
  margin: 0 30px;
  display: flex;
}

.search-input {
  flex: 1;
  height: 40px;
  background: #F8F9FA;
  border: 1px solid #E9ECEF;
  border-right: none;
  border-radius: 20px 0 0 20px;
  padding: 0 20px;
  color: #333;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.search-input:focus {
  background: #FFFFFF;
  border-color: #00d2ff;
  box-shadow: 0 0 0 3px rgba(0, 210, 255, 0.1);
}

.search-btn {
  height: 40px;
  padding: 0 25px;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  border: none;
  border-radius: 0 20px 20px 0;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
}

.nav-icons {
  display: flex;
  gap: 20px;
  margin-right: 30px;
}

.nav-icon-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 12px;
  transition: all 0.3s;
  background: #F8F9FA;
}

.nav-icon-item:hover {
  background: #E3F2FD;
  transform: translateY(-2px);
}

.icon-text {
  font-size: 12px;
  color: #666666;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(58, 123, 213, 0.4);
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  color: #666666;
  background: #F8F9FA;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  color: #3a7bd5;
  background: #E3F2FD;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(58, 123, 213, 0.2);
}

.nav-item.active {
  color: #FFFFFF;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
}

/* 内容区域 */
.content {
  padding-top: 90px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F8F9FA;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  border-radius: 4px;
  opacity: 0.6;
}

::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}
</style>