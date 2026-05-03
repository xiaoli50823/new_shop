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
          <el-icon><TrendCharts /></el-icon>
          <template #title>数据大盘</template>
        </el-menu-item>
        <el-menu-item index="/admin/blind-box">
          <el-icon><Box /></el-icon>
          <template #title>盲盒管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/prizes">
          <el-icon><Present /></el-icon>
          <template #title>奖品管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/order">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/revenue">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>营收报表</template>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
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
            <Expand v-if="isCollapsed" />
            <Fold v-else />
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
  await passwordFormRef.value.validate((valid: boolean) => {
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

.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100vh;
  background: var(--ink);
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
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.logo-text {
  overflow: hidden;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.logo-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 16px 8px;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.25s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: var(--ink) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(64, 128, 255, 0.4);
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 10px;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.topbar {
  height: 64px;
  min-height: 64px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 99;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 22px;
  cursor: pointer;
  color: #666666;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #4080FF;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #F5F7FA;
  border-radius: 20px;
  padding: 8px 16px;
  gap: 10px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #333;
  width: 180px;
}

.search-box input::placeholder {
  color: #999;
}

.search-box .el-icon {
  color: #999;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 25px;
  transition: all 0.2s;
}

.admin-info:hover {
  background: #F5F7FA;
}

.admin-avatar {
  background: var(--ink);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.admin-name {
  font-size: 14px;
  color: #333333;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #F5F7FA;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
