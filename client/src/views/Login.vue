<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">盲盒星球</h1>
        <p class="login-subtitle">BLIND BOX PLANET</p>
      </div>
      
      <div class="login-form">
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="loginForm.email" placeholder="请输入邮箱" type="email" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="registerForm.email" placeholder="请输入邮箱" type="email" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="registerForm.password" placeholder="请输入密码" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" placeholder="请确认密码" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="login-button" @click="handleRegister" :loading="loading">
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userAPI } from '../services/api'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度2-20位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loginFormRef = ref()
const registerFormRef = ref()

const handleLogin = async () => {
  if (loginFormRef.value) {
    await loginFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        try {
          const response = await userAPI.login(loginForm)
          const { user, token } = response
          
          // 存储token和用户信息
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          ElMessage.success('登录成功')
          router.push('/')
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '登录失败，请重试')
        } finally {
          loading.value = false
        }
      }
    })
  }
}

const handleRegister = async () => {
  if (registerFormRef.value) {
    await registerFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        try {
          const response = await userAPI.register(registerForm)
          const { user, token } = response
          
          // 存储token和用户信息
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          ElMessage.success('注册成功')
          router.push('/')
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '注册失败，请重试')
        } finally {
          loading.value = false
        }
      }
    })
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.login-subtitle {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-tabs {
  --el-tabs-header-height: 48px;
}

.login-tabs .el-tabs__header {
  margin-bottom: 25px;
}

.login-tabs .el-tabs__tab {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 20px;
}

.login-tabs .el-tabs__tab.is-active {
  color: #ffffff;
}

.login-tabs .el-tabs__active-bar {
  background-color: #ffffff;
  height: 3px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  border: none;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.login-button:hover {
  opacity: 0.9;
  box-shadow: 0 4px 16px rgba(58, 123, 213, 0.4);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.el-form-item__label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.el-input__wrapper {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.el-input__wrapper:hover {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.el-input__wrapper.is-focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.el-input__inner {
  color: #ffffff;
}

.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.el-checkbox__label {
  color: rgba(255, 255, 255, 0.8);
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #ffffff;
  border-color: #ffffff;
}

.el-checkbox__input.is-checked .el-checkbox__inner::after {
  border-color: #3a7bd5;
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 28px;
  }
  
  .login-button {
    height: 44px;
  }
}
</style>