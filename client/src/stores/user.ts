import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/services/api'
import router from '@/router'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  coins?: number
  points?: number
  vipLevel?: number
  vipExp?: number
  vipNextLevelExp?: number
  couponCount?: number
  checkInDays?: number
  isCheckedIn?: boolean
  inviteCode?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '游客')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const coins = computed(() => userInfo.value?.coins || 0)
  const points = computed(() => userInfo.value?.points || 0)
  const vipLevel = computed(() => userInfo.value?.vipLevel || 0)

  // Actions
  async function login(email: string, password: string) {
    try {
      const res = await authAPI.login({ email, password })
      const data = res.data || res
      token.value = data.token || ''
      localStorage.setItem('token', token.value)
      await fetchUserInfo()
      ElMessage.success('登录成功')
      router.push('/')
      return true
    } catch (error: any) {
      // Error already handled by interceptor
      return false
    }
  }

  async function register(data: { username: string; email: string; password: string; phone?: string }) {
    try {
      const res = await authAPI.register(data)
      const result = res.data || res
      if (result.token) {
        token.value = result.token
        localStorage.setItem('token', token.value)
        await fetchUserInfo()
      }
      ElMessage.success('注册成功')
      router.push('/')
      return true
    } catch (error: any) {
      return false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await authAPI.getMe()
      userInfo.value = res.data || res
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    } catch (error) {
      // Token invalid, clear
      logout()
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  // Initialize from localStorage
  function init() {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      try {
        userInfo.value = JSON.parse(saved)
      } catch {}
    }
    if (token.value) {
      fetchUserInfo()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    avatar,
    coins,
    points,
    vipLevel,
    login,
    register,
    fetchUserInfo,
    logout,
    init
  }
})
