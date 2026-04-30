<template>
  <div class="personal-page">
    <!-- 用户头像区 -->
    <div class="profile-header">
      <div class="profile-bg"></div>
      <div class="profile-content">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar || '/default-avatar.png'" class="avatar" alt="avatar" />
          <div class="vip-badge" v-if="userStore.vipLevel > 0">VIP{{ userStore.vipLevel }}</div>
        </div>
        <h2 class="username">{{ userStore.username }}</h2>
        <span class="user-id">ID: {{ userStore.userInfo?.id || '---' }}</span>
      </div>
    </div>

    <!-- 资产卡片 -->
    <div class="asset-card">
      <div class="asset-item" @click="goRecharge">
        <span class="asset-value">{{ userStore.coins }}</span>
        <span class="asset-label">盲盒币</span>
        <span class="asset-btn">充值</span>
      </div>
      <div class="asset-divider"></div>
      <div class="asset-item">
        <span class="asset-value">{{ userStore.points }}</span>
        <span class="asset-label">积分</span>
        <span class="asset-btn">兑换</span>
      </div>
      <div class="asset-divider"></div>
      <div class="asset-item" @click="showCoupons = true">
        <span class="asset-value">{{ couponCount }}</span>
        <span class="asset-label">优惠券</span>
        <span class="asset-btn">查看</span>
      </div>
    </div>

    <!-- 每日签到 -->
    <div class="checkin-card" @click="handleCheckIn">
      <div class="checkin-left">
        <span class="checkin-icon">📅</span>
        <div class="checkin-info">
          <span class="checkin-title">每日签到</span>
          <span class="checkin-days">已连续签到 {{ checkInDays }} 天</span>
        </div>
      </div>
      <el-button
        type="primary"
        round
        size="small"
        :disabled="isCheckedIn"
      >
        {{ isCheckedIn ? '已签到' : '签到' }}
      </el-button>
    </div>

    <!-- 订单管理 -->
    <div class="order-section">
      <div class="section-header">
        <h3>📋 订单管理</h3>
        <span class="section-more" @click="activeOrderTab = 'all'">全部 ></span>
      </div>
      <div class="order-tabs">
        <div
          v-for="tab in orderTabs"
          :key="tab.value"
          class="order-tab"
          :class="{ active: activeOrderTab === tab.value }"
          @click="activeOrderTab = tab.value"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>
      <div class="order-list" v-loading="orderLoading">
        <div
          v-for="order in orderList"
          :key="order.id"
          class="order-card"
          @click="goOrderDetail(order.id)"
        >
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo || order.id }}</span>
            <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
          </div>
          <div class="order-body">
            <img :src="order.image || order.coverImage || '/placeholder.png'" class="order-img" />
            <div class="order-info">
              <p class="order-name">{{ order.name || order.blindBoxName }}</p>
              <span class="order-time">{{ formatDate(order.createdAt, 'YYYY-MM-DD HH:mm') }}</span>
            </div>
            <span class="order-price">¥{{ formatPrice(order.amount || order.price) }}</span>
          </div>
        </div>
        <el-empty v-if="!orderLoading && orderList.length === 0" description="暂无订单" :image-size="80" />
      </div>
    </div>

    <!-- 会员成长 -->
    <div class="vip-card">
      <div class="vip-header">
        <span class="vip-icon">👑</span>
        <div class="vip-info">
          <span class="vip-level">VIP {{ userStore.vipLevel }}</span>
          <div class="vip-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: vipProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ userStore.userInfo?.vipExp || 0 }}/{{ userStore.userInfo?.vipNextLevelExp || 1000 }}</span>
          </div>
        </div>
      </div>
      <div class="vip-privileges">
        <span class="privilege">🎁 专属折扣</span>
        <span class="privilege">🚀 优先发货</span>
        <span class="privilege">💎 限定奖品</span>
      </div>
    </div>

    <!-- 邀请好友 -->
    <div class="invite-card">
      <div class="invite-content">
        <h4>🎉 邀请好友</h4>
        <p>邀请好友注册，双方各得50盲盒币</p>
      </div>
      <el-button type="primary" round size="small" @click="copyInviteLink">复制链接</el-button>
    </div>

    <!-- 设置列表 -->
    <div class="settings-list">
      <div class="settings-item" @click="goAddress">
        <span class="settings-icon">📍</span>
        <span class="settings-label">收货地址</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item" @click="goBoxCabinet">
        <span class="settings-icon">📦</span>
        <span class="settings-label">我的盒柜</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item">
        <span class="settings-icon">🔒</span>
        <span class="settings-label">账号安全</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item">
        <span class="settings-icon">🛡️</span>
        <span class="settings-label">隐私设置</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item">
        <span class="settings-icon">ℹ️</span>
        <span class="settings-label">关于我们</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item">
        <span class="settings-icon">💬</span>
        <span class="settings-label">联系客服</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="settings-item logout" @click="handleLogout">
        <span class="settings-icon">🚪</span>
        <span class="settings-label">退出登录</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 底部安全距离 -->
    <div class="bottom-safe"></div>

    <!-- 优惠券弹窗 -->
    <el-dialog v-model="showCoupons" title="我的优惠券" width="90%">
      <div class="coupon-list">
        <div v-for="coupon in coupons" :key="coupon.id" class="coupon-item">
          <div class="coupon-left">
            <span class="coupon-value">{{ coupon.value }}</span>
            <span class="coupon-unit">{{ coupon.type === 'discount' ? '折' : '元' }}</span>
          </div>
          <div class="coupon-right">
            <p class="coupon-name">{{ coupon.name }}</p>
            <span class="coupon-condition">满{{ coupon.minAmount }}可用</span>
            <span class="coupon-expire">{{ formatDate(coupon.expireAt, 'YYYY-MM-DD') }}到期</span>
          </div>
        </div>
        <el-empty v-if="coupons.length === 0" description="暂无优惠券" :image-size="60" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { userAPI, orderAPI } from '@/services/api'
import { formatDate, formatPrice } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 签到
const isCheckedIn = ref(false)
const checkInDays = ref(0)

// 优惠券
const showCoupons = ref(false)
const coupons = ref<any[]>([])
const couponCount = computed(() => coupons.value.length)

// 订单
const activeOrderTab = ref('all')
const orderLoading = ref(false)
const orderList = ref<any[]>([])

const orderTabs = [
  { label: '全部', value: 'all', icon: '📋' },
  { label: '待支付', value: 'pending', icon: '💰' },
  { label: '配送中', value: 'shipping', icon: '🚚' },
  { label: '已完成', value: 'completed', icon: '✅' }
]

// VIP 进度
const vipProgress = computed(() => {
  const exp = userStore.userInfo?.vipExp || 0
  const next = userStore.userInfo?.vipNextLevelExp || 1000
  return Math.min((exp / next) * 100, 100)
})

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'status-pending',
    paid: 'status-paid',
    shipping: 'status-shipping',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return map[status] || ''
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const handleCheckIn = async () => {
  if (isCheckedIn.value) {
    ElMessage.info('今日已签到')
    return
  }
  if (!userStore.userInfo?.id) return
  try {
    await userAPI.checkIn(userStore.userInfo.id)
    isCheckedIn.value = true
    checkInDays.value++
    ElMessage.success(`签到成功！连续签到${checkInDays.value}天`)
    userStore.fetchUserInfo()
  } catch {}
}

const fetchOrders = async () => {
  orderLoading.value = true
  try {
    const params: any = { page: 1, pageSize: 10 }
    if (activeOrderTab.value !== 'all') params.status = activeOrderTab.value
    const res = await orderAPI.getList(params)
    orderList.value = res.data?.list || res.data || res.list || []
  } catch {
    orderList.value = []
  } finally {
    orderLoading.value = false
  }
}

const fetchCoupons = async () => {
  if (!userStore.userInfo?.id) return
  try {
    const res = await userAPI.getCoupons(userStore.userInfo.id)
    coupons.value = res.data?.list || res.data || res.list || []
  } catch {
    coupons.value = []
  }
}

const copyInviteLink = () => {
  const code = userStore.userInfo?.inviteCode || ''
  const link = `${window.location.origin}/register?invite=${code}`
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('邀请链接已复制')
  }).catch(() => {
    ElMessage.info('邀请码：' + code)
  })
}

const goRecharge = () => router.push('/recharge')
const goAddress = () => router.push('/address')
const goBoxCabinet = () => router.push('/box-cabinet')
const goOrderDetail = (id: number) => router.push(`/order/${id}`)

const handleLogout = () => {
  userStore.logout()
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  isCheckedIn.value = userStore.userInfo?.isCheckedIn || false
  checkInDays.value = userStore.userInfo?.checkInDays || 0
  fetchOrders()
  fetchCoupons()
})
</script>

<style scoped>
.personal-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 70px;
}

/* 头像区 */
.profile-header {
  position: relative;
  padding: 40px 16px 20px;
  overflow: hidden;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: var(--primary-gradient);
  border-radius: 0 0 30px 30px;
}

.profile-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vip-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FFD700, #FFA502);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #FFFFFF;
}

.username {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 资产卡片 */
.asset-card {
  display: flex;
  align-items: center;
  margin: -10px 16px 16px;
  padding: 16px 0;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  position: relative;
  z-index: 2;
}

.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.asset-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.asset-label {
  font-size: 12px;
  color: var(--text-light);
  margin: 2px 0 4px;
}

.asset-btn {
  font-size: 11px;
  color: var(--primary-pink);
  font-weight: 500;
}

.asset-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* 签到 */
.checkin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 16px;
  padding: 14px 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}

.checkin-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkin-icon {
  font-size: 28px;
}

.checkin-title {
  font-size: 15px;
  font-weight: 600;
  display: block;
}

.checkin-days {
  font-size: 12px;
  color: var(--text-light);
}

/* 订单管理 */
.order-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.section-more {
  font-size: 12px;
  color: var(--text-light);
  cursor: pointer;
}

.order-tabs {
  display: flex;
  margin-bottom: 14px;
}

.order-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.order-tab .tab-icon {
  font-size: 20px;
}

.order-tab .tab-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.order-tab.active .tab-label {
  color: var(--primary-pink);
  font-weight: 600;
}

.order-list {
  min-height: 100px;
}

.order-card {
  padding: 12px;
  background: #FAFAFA;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.order-card:active {
  background: #F5F5F5;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-no {
  font-size: 12px;
  color: var(--text-light);
}

.order-status {
  font-size: 12px;
  font-weight: 600;
}

.status-pending { color: var(--warning); }
.status-paid { color: var(--primary-pink); }
.status-shipping { color: #667eea; }
.status-completed { color: var(--success); }
.status-cancelled { color: var(--text-light); }

.order-body {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.order-info {
  flex: 1;
  min-width: 0;
}

.order-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-time {
  font-size: 11px;
  color: var(--text-light);
}

.order-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--danger);
}

/* VIP */
.vip-card {
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #FFF8E1, #FFFFFF);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid #FFE082;
}

.vip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.vip-icon {
  font-size: 32px;
}

.vip-info {
  flex: 1;
}

.vip-level {
  font-size: 16px;
  font-weight: 700;
  color: #F57F17;
  display: block;
  margin-bottom: 6px;
}

.vip-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #F5F5F5;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA502);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--text-light);
  flex-shrink: 0;
}

.vip-privileges {
  display: flex;
  gap: 12px;
}

.privilege {
  font-size: 12px;
  color: #F57F17;
  padding: 4px 10px;
  background: rgba(255, 215, 0, 0.15);
  border-radius: 12px;
}

/* 邀请好友 */
.invite-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #FFE4EE, #FFFFFF);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.invite-content h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.invite-content p {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 设置列表 */
.settings-list {
  margin: 0 16px 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background: #FAFAFA;
}

.settings-icon {
  font-size: 20px;
}

.settings-label {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.settings-item .el-icon {
  color: var(--text-light);
  font-size: 16px;
}

.settings-item.logout .settings-label {
  color: var(--danger);
}

/* 优惠券弹窗 */
.coupon-list {
  max-height: 400px;
  overflow-y: auto;
}

.coupon-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: linear-gradient(135deg, #FFF5F7, #FFFFFF);
  border-radius: 12px;
  margin-bottom: 10px;
  border-left: 4px solid var(--primary-pink);
}

.coupon-left {
  display: flex;
  align-items: baseline;
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px dashed var(--border-color);
}

.coupon-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary-pink);
}

.coupon-unit {
  font-size: 14px;
  color: var(--primary-pink);
  margin-left: 2px;
}

.coupon-right {
  flex: 1;
}

.coupon-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  color: var(--text-light);
  display: block;
}

.coupon-expire {
  font-size: 11px;
  color: var(--text-light);
}

.bottom-safe {
  height: 20px;
}
</style>
