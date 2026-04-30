<template>
  <div class="tab-bar safe-bottom">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="switchTab(tab.path)"
    >
      <div class="tab-icon-wrapper">
        <el-icon :size="24">
          <component :is="tab.icon" />
        </el-icon>
        <span v-if="tab.badge && tab.badge > 0" class="badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</span>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Compass, Box, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const tabs = computed(() => [
  { path: '/', label: '首页', icon: HomeFilled, badge: 0 },
  { path: '/discover', label: '发现', icon: Compass, badge: 0 },
  { path: '/box-cabinet', label: '盒柜', icon: Box, badge: 0 },
  { path: '/personal', label: '我的', icon: User, badge: 0 }
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const switchTab = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  background: #FFFFFF;
  border-top: 1px solid var(--border-color);
  z-index: 999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.tab-item:active {
  transform: scale(0.92);
}

.tab-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-item .el-icon {
  color: var(--text-light);
  transition: color 0.2s ease;
}

.tab-item.active .el-icon {
  color: var(--primary-pink);
}

.tab-label {
  font-size: 10px;
  color: var(--text-light);
  transition: color 0.2s ease;
  font-weight: 400;
}

.tab-item.active .tab-label {
  color: var(--primary-pink);
  font-weight: 500;
}

.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #FFFFFF;
  background: var(--danger);
  border-radius: 8px;
  font-weight: 500;
}
</style>
