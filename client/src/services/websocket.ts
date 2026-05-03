import { io, Socket } from 'socket.io-client'
import { ElMessage } from 'element-plus'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('WebSocket已连接')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080'
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket连接成功')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket断开连接:', reason)
      if (reason === 'io server disconnect') {
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('WebSocket重连失败，请刷新页面')
        ElMessage.error('实时连接失败，部分功能可能无法正常使用')
      }
    })

    this.socket.on('user-data-updated', (data) => {
      console.log('📊 用户数据更新:', data)
      this.emit('user-data-updated', data)
    })

    this.socket.on('points-changed', (data) => {
      console.log('💎 积分变化:', data)
      this.emit('points-changed', data)
      ElMessage.success(`积分更新: ${data.points} (${data.reason})`)
    })

    this.socket.on('coin-changed', (data) => {
      console.log('💰 盲盒币变化:', data)
      this.emit('coin-changed', data)
      ElMessage.success(`盲盒币更新: ${data.coin} (${data.reason})`)
    })

    this.socket.on('check-in-success', (data) => {
      console.log('✅ 签到成功:', data)
      this.emit('check-in-success', data)
      ElMessage.success(`签到成功！获得 ${data.points_earned} 积分`)
    })

    this.socket.on('exchange-success', (data) => {
      console.log('🎁 兑换成功:', data)
      this.emit('exchange-success', data)
      ElMessage.success(`兑换成功！消耗 ${data.pointsUsed} 积分`)
    })

    this.socket.on('user-data-changed', (data) => {
      console.log('👥 用户数据变化（管理员）:', data)
      this.emit('user-data-changed', data)
    })

    this.socket.on('user-points-changed', (data) => {
      console.log('💎 用户积分变化（管理员）:', data)
      this.emit('user-points-changed', data)
    })

    this.socket.on('user-coin-changed', (data) => {
      console.log('💰 用户盲盒币变化（管理员）:', data)
      this.emit('user-coin-changed', data)
    })

    this.socket.on('user-check-in', (data) => {
      console.log('✅ 用户签到（管理员）:', data)
      this.emit('user-check-in', data)
    })

    this.socket.on('user-exchange', (data) => {
      console.log('🎁 用户兑换（管理员）:', data)
      this.emit('user-exchange', data)
    })
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('🔌 WebSocket已断开')
    }
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const wsService = new WebSocketService()
