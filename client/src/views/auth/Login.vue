<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">BLIND BOX PLANET</div>
        <h1 class="logo-title">盲盒星球</h1>
        <p class="logo-subtitle">开启你的惊喜之旅</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Message /></el-icon>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              autocomplete="email"
            />
          </div>
        </div>
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Lock /></el-icon>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
            <el-icon class="eye-icon" @click="showPassword = !showPassword">
              <View v-if="showPassword" />
              <Hide v-else />
            </el-icon>
          </div>
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div class="form-footer">
          <span @click="goRegister">还没有账号？<b>立即注册</b></span>
        </div>
      </div>

      <!-- 第三方登录 -->
      <div class="third-party">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="third-icons">
          <div class="third-icon wechat" @click="thirdPartyLogin('wechat')">
            <span>微</span>
          </div>
          <div class="third-icon qq" @click="thirdPartyLogin('qq')">
            <span>Q</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!form.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return
  }
  loading.value = true
  try {
    await userStore.login(form.email, form.password)
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}

const thirdPartyLogin = (type: string) => {
  ElMessage.info(`${type === 'wechat' ? '微信' : 'QQ'}登录功能开发中`)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 380px;
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.logo-title {
  font-size: 28px;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 6px;
}

.logo-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 表单 */
.login-form {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 30px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #F8F9FA;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--ink);
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(58, 80, 104, 0.1);
}

.input-wrapper .el-icon {
  color: var(--text-light);
  font-size: 18px;
  flex-shrink: 0;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: #C0C4CC;
}

.eye-icon {
  cursor: pointer;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--ink);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover {
  opacity: 0.85;
}

.login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
}

.form-footer b {
  color: var(--ink);
}

/* 第三方登录 */
.third-party {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.third-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.third-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.third-icon:active {
  transform: scale(0.9);
}

.third-icon span {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
}

.wechat {
  background: #07C160;
}

.qq {
  background: #12B7F5;
}
</style>
