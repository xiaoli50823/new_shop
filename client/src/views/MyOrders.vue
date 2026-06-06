<template>
  <div class="orders-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">&larr;</button>
      <h2>我的订单</h2>
      <span class="header-count" v-if="!loading">{{ total }} 笔</span>
    </div>

    <div v-if="loading" class="loading-box">
      <div class="skeleton" v-for="i in 3" :key="i">
        <div class="sk-row1"></div>
        <div class="sk-row2"></div>
        <div class="sk-row3"></div>
      </div>
    </div>

    <div v-else-if="error" class="error-box">
      <div class="error-icon">!</div>
      <p>加载失败：{{ error }}</p>
      <button class="retry-btn" @click="fetchData">重新加载</button>
    </div>

    <div v-else-if="list.length === 0" class="empty-box">
      <div class="empty-icon">📦</div>
      <p class="empty-title">还没有订单</p>
      <p class="empty-desc">去挑选喜欢的盲盒，开盒后即可生成订单</p>
      <button class="go-btn" @click="$router.push('/')">去逛逛</button>
    </div>

    <div v-else class="order-list">
      <div v-for="order in list" :key="order.id" class="order-card">
        <div class="order-head">
          <span class="order-no">{{ order.order_no }}</span>
          <span class="order-status" :class="order.status">{{ statusMap[order.status] || order.status }}</span>
        </div>

        <div class="order-items">
          <div v-for="item in (order.items || [])" :key="item.id" class="order-item">
            <div class="item-img-wrap">
              <img :src="item.image || '/placeholder.svg'" :alt="item.name" />
            </div>
            <span class="item-name">{{ item.name }}</span>
            <span class="item-qty">x{{ item.quantity || 1 }}</span>
            <span class="item-price">&yen;{{ Number(item.price || 0).toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-foot">
          <span class="order-total-label">合计</span>
          <span class="order-total-price">&yen;{{ Number(order.total || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderAPI } from '@/services/api'

const loading = ref(true)
const error = ref('')
const list = ref<any[]>([])
const total = ref(0)

const statusMap: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipping: '已发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res: any = await orderAPI.getMyOrders({ pageSize: 100 })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e: any) {
    error.value = e.message || '网络错误'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.orders-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: var(--beige);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  width: 36px; height: 36px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover { border-color: var(--ink); color: var(--ink); }

.page-header h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-count {
  font-size: 12px;
  color: var(--text-light);
  background: var(--ink-subtle);
  padding: 3px 10px;
  border-radius: 10px;
}

.loading-box { display: flex; flex-direction: column; gap: 12px; }

.skeleton {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--white);
  padding: 16px;
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
}

.sk-row1 { height: 14px; width: 50%; background: var(--border-light); border-radius: 4px; animation: pulse 1.5s infinite; }
.sk-row2 { height: 40px; width: 100%; background: var(--border-light); border-radius: 6px; animation: pulse 1.5s infinite; }
.sk-row3 { height: 14px; width: 30%; background: var(--border-light); border-radius: 4px; animation: pulse 1.5s infinite; align-self: flex-end; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.error-box, .empty-box {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 48px 24px;
  text-align: center;
}

.error-icon {
  width: 52px; height: 52px;
  margin: 0 auto 16px;
  background: #fef2f2;
  border: 2px solid #fecaca;
  color: var(--danger);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-light);
  margin: 0 0 20px;
}

.go-btn, .retry-btn {
  padding: 10px 28px;
  background: var(--ink);
  color: var(--white);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.go-btn:hover, .retry-btn:hover { background: var(--ink-light); }

.retry-btn { background: var(--white); color: var(--ink); border: 1px solid var(--ink); }

.order-list { display: flex; flex-direction: column; gap: 12px; }

.order-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.order-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.order-status.pending { background: #fef3c7; color: #92400e; }
.order-status.paid { background: #dbeafe; color: #1e40af; }
.order-status.shipping, .order-status.shipped { background: #ede9fe; color: #5b21b6; }
.order-status.completed { background: #d1fae5; color: #065f46; }
.order-status.cancelled { background: #f3f4f6; color: #6b7280; }

.order-items { display: flex; flex-direction: column; gap: 8px; }

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-img-wrap {
  width: 44px; height: 44px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--beige);
  flex-shrink: 0;
}

.item-img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover;
}

.item-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  font-size: 12px;
  color: var(--text-light);
}

.item-price {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

.order-total-label {
  font-size: 12px;
  color: var(--text-light);
}

.order-total-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
