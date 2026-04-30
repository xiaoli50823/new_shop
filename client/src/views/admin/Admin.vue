<template>
  <div class="admin-layout">
    <!-- 左侧侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-area">
        <div class="logo-icon">📦</div>
        <div v-show="!isCollapsed" class="logo-text">
          <div class="logo-title">盲盒管理系统</div>
          <div class="logo-subtitle">BLIND BOX MANAGE</div>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        class="sidebar-menu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><component :is="'TrendCharts'" /></el-icon>
          <template #title>数据大盘</template>
        </el-menu-item>
        <el-menu-item index="/admin/blind-box">
          <el-icon><component :is="'Box'" /></el-icon>
          <template #title>盲盒管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/prizes">
          <el-icon><component :is="'Present'" /></el-icon>
          <template #title>奖品管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/order">
          <el-icon><component :is="'List'" /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon><component :is="'User'" /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/revenue">
          <el-icon><component :is="'DataAnalysis'" /></el-icon>
          <template #title>营收报表</template>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><component :is="'Setting'" /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧主区域 -->
    <div class="main-wrapper" :class="{ expanded: isCollapsed }">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <component :is="isCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentBreadcrumb }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="admin-info">
              <el-avatar :size="32" class="admin-avatar">管</el-avatar>
              <span class="admin-name">{{ adminName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="450px" destroy-on-close>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown, User, Lock, SwitchButton, Expand, Fold, TrendCharts, Box, Present, List, DataAnalysis, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(false)
const adminName = ref('管理员')
const showPasswordDialog = ref(false)
const passwordFormRef = ref<FormInstance>()

const activeMenu = computed(() => route.path)

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': '数据大盘',
  '/admin/blind-box': '盲盒管理',
  '/admin/prizes': '奖品管理',
  '/admin/order': '订单管理',
  '/admin/user': '用户管理',
  '/admin/revenue': '营收报表',
  '/admin/settings': '系统设置'
}

const currentBreadcrumb = computed(() => breadcrumbMap[route.path] || '数据大盘')

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleCommand = (cmd: string) => {
  switch (cmd) {
    case 'profile':
      router.push('/admin/user')
      break
    case 'password':
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      showPasswordDialog.value = true
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('adminInfo')
        ElMessage.success('已退出登录')
        router.push('/')
      }).catch(() => {})
      break
  }
}

const submitPassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功')
      showPasswordDialog.value = false
    }
  })
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  transition: width 0.3s ease, min-width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.logo-area {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.logo-text {
  overflow: hidden;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.logo-subtitle {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 8px 0;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 2px 8px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.25s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(24, 144, 255, 0.15) !important;
  color: #ffffff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: #1890FF !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.35);
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 8px;
}

/* 主区域 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 顶部栏 */
.topbar {
  height: 60px;
  min-height: 60px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 99;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #1890FF;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.admin-info:hover {
  background: #f5f7fa;
}

.admin-avatar {
  background: #1890FF;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.admin-name {
  font-size: 14px;
  color: #303133;
}

/* 内容区 */
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #F0F2F5;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
