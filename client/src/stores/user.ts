import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/services/api'
import { wsService } from '@/services/websocket'
import router from '@/router'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  blindBoxCoin?: number
  points?: number
  vipLevel?: number
  vipExp?: number
  vipNextLevelExp?: number
  couponCount?: number
  checkInDays?: number
  isCheckedIn?: boolean
  inviteCode?: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '游客')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const coins = computed(() => userInfo.value?.blindBoxCoin || 0)
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
      initWebSocket()
      ElMessage.success('登录成功')
      
      const redirect = router.currentRoute.value.query.redirect as string
      if (redirect) {
        router.push(redirect)
      } else if (userInfo.value?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
      return true
    } catch (error: any) {
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
    wsService.disconnect()
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
      initWebSocket()
    }
  }

  function initWebSocket() {
    if (token.value) {
      wsService.connect(token.value)
      
      wsService.on('user-data-updated', (data: any) => {
        if (userInfo.value && data.id === userInfo.value.id) {
          userInfo.value = { ...userInfo.value, ...data }
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        }
      })

      wsService.on('points-changed', (data: any) => {
        if (userInfo.value) {
          userInfo.value.points = data.points
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        }
      })

      wsService.on('coin-changed', (data: any) => {
        if (userInfo.value) {
          userInfo.value.blindBoxCoin = data.coin
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        }
      })

      wsService.on('check-in-success', (data: any) => {
        if (userInfo.value) {
          userInfo.value.checkInDays = data.check_in_days
          userInfo.value.points = data.total_points
          userInfo.value.isCheckedIn = true
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        }
      })
    }
  }

  async function checkIn() {
    if (!userInfo.value) return
    try {
      const res = await userAPI.checkIn(userInfo.value.id)
      const data = res.data || res
      if (data.success) {
        ElMessage.success('签到成功')
        if (userInfo.value.checkInDays !== undefined) {
          userInfo.value.checkInDays = data.checkInDays || userInfo.value.checkInDays + 1
        }
        if (userInfo.value.points !== undefined && data.points) {
          userInfo.value.points += data.points
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    } catch (error) {
      ElMessage.error('签到失败')
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
    init,
    initWebSocket,
    checkIn
  }
})
