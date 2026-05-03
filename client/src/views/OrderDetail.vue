<template>
  <div class="order-detail-page" v-loading="loading">
    <!-- 顶部状态 -->
    <div class="status-section" :class="getStatusBgClass(order.status)">
      <div class="status-content">
        <span class="status-icon">{{ getStatusIcon(order.status) }}</span>
        <h2 class="status-text">{{ getStatusLabel(order.status) }}</h2>
        <p class="status-desc">{{ getStatusDesc(order.status) }}</p>
      </div>
    </div>

    <!-- 收货信息 -->
    <div class="info-card" v-if="order.address">
      <div class="card-header">
        <el-icon><Location /></el-icon>
        <span>收货信息</span>
      </div>
      <div class="address-info">
        <div class="address-user">
          <span class="address-name">{{ order.address.name }}</span>
          <span class="address-phone">{{ formatPhone(order.address.phone) }}</span>
        </div>
        <p class="address-detail">
          {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
        </p>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="info-card">
      <div class="card-header">
        <el-icon><ShoppingCart /></el-icon>
        <span>商品信息</span>
      </div>
      <div class="product-info">
        <img :src="order.image || order.coverImage || '/placeholder.png'" class="product-img" />
        <div class="product-detail">
          <h4 class="product-name">{{ order.name || order.blindBoxName }}</h4>
          <p class="product-desc">{{ order.description || '' }}</p>
          <div class="product-price-row">
            <span class="product-price">¥{{ formatPrice(order.amount || order.price) }}</span>
            <span class="product-qty">x{{ order.quantity || 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 物流信息 -->
    <div class="info-card" v-if="order.status === 'shipping' || order.status === 'completed'">
      <div class="card-header">
        <el-icon><Van /></el-icon>
        <span>物流信息</span>
      </div>
      <div class="shipping-info">
        <div class="shipping-row">
          <span class="shipping-label">物流公司</span>
          <span class="shipping-value">{{ order.expressCompany || '顺丰速运' }}</span>
        </div>
        <div class="shipping-row">
          <span class="shipping-label">物流单号</span>
          <span class="shipping-value shipping-no">{{ order.trackingNo || '暂无' }}</span>
        </div>
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="info-card">
      <div class="card-header">
        <el-icon><Document /></el-icon>
        <span>订单信息</span>
      </div>
      <div class="order-info">
        <div class="info-row">
          <span class="info-label">订单编号</span>
          <span class="info-value">{{ order.orderNo || order.id }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">下单时间</span>
          <span class="info-value">{{ formatDate(order.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">支付方式</span>
          <span class="info-value">{{ order.payMethod || '盲盒币' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">商品金额</span>
          <span class="info-value">¥{{ formatPrice(order.amount || order.price) }}</span>
        </div>
        <div class="info-row" v-if="order.shippingFee !== undefined">
          <span class="info-label">运费</span>
          <span class="info-value">{{ order.shippingFee > 0 ? '¥' + formatPrice(order.shippingFee) : '免运费' }}</span>
        </div>
        <div class="info-row total-row">
          <span class="info-label">实付款</span>
          <span class="info-value total-price">¥{{ formatPrice(order.totalAmount || order.amount || order.price) }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar safe-bottom">
      <template v-if="order.status === 'pending'">
        <el-button round @click="cancelOrder">取消订单</el-button>
        <el-button type="primary" round @click="payOrder">立即支付</el-button>
      </template>
      <template v-else-if="order.status === 'shipping'">
        <el-button type="primary" round @click="confirmReceive">确认收货</el-button>
      </template>
      <template v-else-if="order.status === 'completed'">
        <el-button round @click="goBack">返回</el-button>
        <el-button type="primary" round @click="buyAgain">再次购买</el-button>
      </template>
      <template v-else>
        <el-button round @click="goBack">返回</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Location, ShoppingCart, Van, Document } from '@element-plus/icons-vue'
import { orderAPI } from '@/services/api'
import { formatDate, formatPrice, formatPhone } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref<any>({})

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付', paid: '已支付', shipping: '配送中', completed: '已完成', cancelled: '已取消'
  }
  return map[status] || '未知'
}

const getStatusIcon = (status: string) => {
  const map: Record<string, string> = {
    pending: '💰', paid: '✅', shipping: '🚚', completed: '🎉', cancelled: '❌'
  }
  return map[status] || '📋'
}

const getStatusDesc = (status: string) => {
  const map: Record<string, string> = {
    pending: '请尽快完成支付', paid: '商家正在准备发货', shipping: '商品正在配送中', completed: '感谢您的购买', cancelled: '订单已取消'
  }
  return map[status] || ''
}

const getStatusBgClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-pending', paid: 'bg-paid', shipping: 'bg-shipping', completed: 'bg-completed', cancelled: 'bg-cancelled'
  }
  return map[status] || ''
}

const fetchOrder = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await orderAPI.getById(id)
    order.value = res.data || res
  } catch {
    order.value = {}
  } finally {
    loading.value = false
  }
}

const payOrder = async () => {
  try {
    await ElMessageBox.confirm('确认支付该订单？', '支付确认')
    await orderAPI.updateStatus(order.value.id, 'paid')
    ElMessage.success('支付成功')
    fetchOrder()
  } catch {}
}

const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确认取消该订单？', '取消订单')
    await orderAPI.cancel(order.value.id)
    ElMessage.success('订单已取消')
    fetchOrder()
  } catch {}
}

const confirmReceive = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '确认收货')
    await orderAPI.updateStatus(order.value.id, 'completed')
    ElMessage.success('已确认收货')
    fetchOrder()
  } catch {}
}

const buyAgain = () => {
  if (order.value.blindBoxId) {
    router.push(`/blind-box/${order.value.blindBoxId}`)
  }
}

const goBack = () => router.back()

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 80px;
}

/* 状态区 */
.status-section {
  padding: 30px 16px 24px;
  color: #FFFFFF;
}

.bg-pending { background: var(--warning); color: #fff; }
.bg-paid { background: var(--ink); color: #fff; }
.bg-shipping { background: var(--ink); color: #fff; }
.bg-completed { background: var(--success); color: #fff; }
.bg-cancelled { background: var(--text-light); color: #fff; }

.status-content {
  text-align: center;
}

.status-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.status-text {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 13px;
  opacity: 0.9;
}

/* 信息卡片 */
.info-card {
  margin: 12px 16px 0;
  padding: 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-header .el-icon {
  color: var(--primary-pink);
}

/* 收货信息 */
.address-user {
  margin-bottom: 4px;
}

.address-name {
  font-size: 15px;
  font-weight: 600;
  margin-right: 10px;
}

.address-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

.address-detail {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 商品信息 */
.product-info {
  display: flex;
  gap: 12px;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-desc {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 8px;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--danger);
}

.product-qty {
  font-size: 13px;
  color: var(--text-light);
}

/* 物流信息 */
.shipping-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.shipping-row:last-child {
  border-bottom: none;
}

.shipping-label {
  font-size: 13px;
  color: var(--text-light);
}

.shipping-value {
  font-size: 13px;
  color: var(--text-primary);
}

.shipping-no {
  color: var(--primary-pink);
  font-weight: 500;
}

/* 订单信息 */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  color: var(--text-light);
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
}

.total-row {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  margin-top: 4px;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--danger);
}

/* 操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-bar .el-button {
  border-radius: var(--radius-btn);
  min-width: 100px;
}
</style>
