<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 顶部 -->
      <div class="page-header">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <h2>创建账号</h2>
        <div></div>
      </div>

      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">🎁</div>
        <p class="logo-text">加入盲盒星球</p>
      </div>

      <!-- 注册表单 -->
      <div class="register-form">
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><User /></el-icon>
            <input v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
          </div>
        </div>
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Message /></el-icon>
            <input v-model="form.email" type="email" placeholder="请输入邮箱" autocomplete="email" />
          </div>
        </div>
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Lock /></el-icon>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码（至少6位）"
              autocomplete="new-password"
            />
            <el-icon class="eye-icon" @click="showPassword = !showPassword">
              <View v-if="showPassword" />
              <Hide v-else />
            </el-icon>
          </div>
        </div>
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Lock /></el-icon>
            <input
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请确认密码"
              autocomplete="new-password"
            />
          </div>
        </div>
        <div class="form-item">
          <div class="input-wrapper">
            <el-icon><Phone /></el-icon>
            <input v-model="form.phone" type="tel" placeholder="手机号（可选）" autocomplete="tel" />
          </div>
        </div>

        <button class="register-btn" @click="handleRegister" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <div class="form-footer">
          <span @click="goLogin">已有账号？<b>立即登录</b></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, User, Message, Lock, Phone, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
})
const showPassword = ref(false)
const loading = ref(false)

const goBack = () => router.back()
const goLogin = () => router.push('/login')

const handleRegister = async () => {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.email.trim()) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!form.password || form.password.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--primary-gradient);
  padding: 20px;
}

.register-container {
  max-width: 380px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFFFFF;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.logo-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.register-form {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 14px;
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
  border-color: var(--primary-pink);
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
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

.register-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-gradient);
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

.register-btn:active {
  transform: scale(0.98);
}

.register-btn:disabled {
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
  color: var(--primary-pink);
}
</style>
