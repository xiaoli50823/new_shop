<template>
  <div class="admin">
    <!-- 左侧导航菜单 -->
    <div class="sidebar">
      <div class="logo">
        <h1 class="logo-text">盲盒管理系统</h1>
        <span class="logo-sub">BLIND BOX MANAGE</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item index="/admin/dashboard">
          <span>数据大盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/blind-box">
          <span>盲盒管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/order">
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧工作区 -->
    <div class="main-content">
      <!-- 顶部状态栏 -->
      <div class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleSidebar">
            菜单
          </el-button>
          <span class="breadcrumb">{{ breadcrumb }}</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <span>{{ adminName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToPersonal">个人中心</el-dropdown-item>
                <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 管理员名称
const adminName = ref('管理员')

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 面包屑
const breadcrumb = computed(() => {
  const path = route.path
  if (path === '/admin/dashboard') return '数据大盘'
  if (path === '/admin/blind-box') return '盲盒管理'
  if (path === '/admin/order') return '订单管理'
  if (path === '/admin/user') return '用户管理'
  return ''
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 菜单选择处理
const handleMenuSelect = (key: string) => {
  router.push(key)
}

// 个人中心
const goToPersonal = () => {
  ElMessage.success('功能开发中')
}

// 修改密码
const changePassword = () => {
  ElMessage.success('功能开发中')
}

// 退出登录
const logout = () => {
  ElMessage.success('功能开发中')
}
</script>

<style scoped>
.admin {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #F5F6F8;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: white;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.logo-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
}

.logo.collapsed .logo-text,
.logo.collapsed .logo-sub {
  display: none;
}

/* 菜单 */
.el-menu-vertical-demo {
  background: transparent;
  border-right: none;
  flex: 1;
}

.el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  height: 60px;
  line-height: 60px;
  margin: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
  padding-left: 24px !important;
}

.el-menu-item:hover {
  background: rgba(0, 188, 212, 0.2) !important;
  color: #00BCD4 !important;
}

.el-menu-item.is-active {
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
}

.el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 12px;
}

/* 右侧工作区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #F5F6F8;
}

/* 顶部状态栏 */
.header {
  height: 60px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background: #f0f9ff;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #00BCD4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .content {
    padding: 20px;
  }
  
  .header {
    padding: 0 20px;
  }
}

/* 滚动条样式 */
.content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content::-webkit-scrollbar-track {
  background: #F8F9FA;
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  border-radius: 4px;
  opacity: 0.6;
}

.content::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}
</style>