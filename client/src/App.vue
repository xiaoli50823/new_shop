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

userStore.init()

const showTabBar = computed(() => {
  return route.meta.showTabBar === true
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');

:root {
  --ink: #3A5068;
  --ink-light: #5B7A9A;
  --ink-subtle: #E8EDF2;
  --charcoal: #4A4A4A;
  --charcoal-light: #8A8A8A;
  --beige: #FAFAF8;
  --beige-warm: #F5F3EF;
  --white: #FFFFFF;
  --text-primary: #2C2C2C;
  --text-secondary: #6B6B6B;
  --text-light: #9B9B9B;
  --border: #E8E8E6;
  --border-light: #F0F0EE;
  --danger: #C44D4D;
  --success: #5A8F6A;
  --warning: #B8833E;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.06);
  --radius-card: 12px;
  --radius-btn: 8px;
  --radius-sm: 6px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--beige);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  background: var(--beige);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #D0D0CE;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #B0B0AE;
}

:root {
  --el-color-primary: var(--ink);
  --el-color-primary-light-3: var(--ink-light);
  --el-color-primary-light-5: #8DAAC5;
  --el-color-primary-light-7: #C5D5E2;
  --el-color-primary-light-8: #DDE6EF;
  --el-color-primary-light-9: #EEF2F6;
  --el-color-primary-dark-2: #2C4056;
  --el-border-radius-base: 8px;
}

.el-button--primary {
  background: var(--ink) !important;
  border: none !important;
  border-radius: var(--radius-btn) !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px;
}

.el-button--primary:hover,
.el-button--primary:focus {
  background: var(--ink-light) !important;
}

.el-card {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border);
}

.el-dialog {
  border-radius: var(--radius-card);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
</style>
