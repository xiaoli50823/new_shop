<template>
  <div class="tab-bar safe-bottom">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="switchTab(tab.path)"
    >
      <el-icon :size="22">
        <component :is="tab.icon" />
      </el-icon>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Compass, Box, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const tabs = computed(() => [
  { path: '/', label: '首页', icon: HomeFilled },
  { path: '/discover', label: '发现', icon: Compass },
  { path: '/box-cabinet', label: '盒柜', icon: Box },
  { path: '/personal', label: '我的', icon: User }
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
  display: none;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  background: var(--white);
  border-top: 1px solid var(--border);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: color 0.2s;
  color: var(--text-light);
}

.tab-item.active {
  color: var(--ink);
}

.tab-label {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 400;
  letter-spacing: 0.3px;
}

.tab-item.active .tab-label {
  font-weight: 500;
}

@media (max-width: 1200px) {
  .tab-bar {
    display: flex;
  }
}
</style>
