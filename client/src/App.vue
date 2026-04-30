<template>
  <div id="app">
    <router-view />
    <BottomTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BottomTabBar from '@/components/BottomTabBar.vue'

const route = useRoute()
const userStore = useUserStore()

// 初始化用户状态
userStore.init()

// 判断是否显示底部导航栏
const showTabBar = computed(() => {
  return route.meta.showTabBar === true
})
</script>

<style>
/* ==================== 全局样式 ==================== */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

:root {
  --primary-pink: #FF6B9D;
  --primary-orange: #FF8E53;
  --primary-gradient: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
  --bg-pink: #FFF5F7;
  --bg-white: #FFFFFF;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #999999;
  --border-color: #F0F0F0;
  --shadow-card: 0 2px 12px rgba(255, 107, 157, 0.1);
  --shadow-card-hover: 0 4px 20px rgba(255, 107, 157, 0.2);
  --radius-card: 16px;
  --radius-btn: 24px;
  --radius-sm: 8px;
  --danger: #FF4757;
  --success: #2ED573;
  --warning: #FFA502;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--bg-pink);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-pink);
  max-width: 750px;
  margin: 0 auto;
  position: relative;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* Element Plus 主题覆盖 */
:root {
  --el-color-primary: #FF6B9D;
  --el-color-primary-light-3: #FF8DB5;
  --el-color-primary-light-5: #FFB0CC;
  --el-color-primary-light-7: #FFD3E3;
  --el-color-primary-light-8: #FFE4EE;
  --el-color-primary-light-9: #FFF0F5;
  --el-color-primary-dark-2: #E05580;
  --el-border-radius-base: 8px;
}

.el-button--primary {
  background: var(--primary-gradient) !important;
  border: none !important;
}

.el-button--primary:hover,
.el-button--primary:focus {
  opacity: 0.9;
}

/* 全局工具类 */
.text-gradient {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 隐藏滚动条但保留滚动 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
