<template>
  <div class="coupons-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">&larr;</button>
      <h2>我的优惠券</h2>
      <span class="header-count" v-if="!loading">{{ list.length }} 张</span>
    </div>

    <div v-if="loading" class="loading-box">
      <div class="skeleton" v-for="i in 3" :key="i">
        <div class="sk-avatar"></div>
        <div class="sk-lines">
          <div class="sk-line w60"></div>
          <div class="sk-line w40"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-box">
      <div class="error-icon">!</div>
      <p>加载失败：{{ error }}</p>
      <button class="retry-btn" @click="fetchData">重新加载</button>
    </div>

    <div v-else-if="list.length === 0" class="empty-box">
      <div class="empty-icon">🎫</div>
      <p class="empty-title">还没有优惠券</p>
      <p class="empty-desc">去积分商城用积分兑换优惠券吧</p>
      <button class="go-btn" @click="$router.push('/points-mall')">前往积分商城</button>
    </div>

    <div v-else class="coupon-list">
      <div v-for="item in list" :key="item.id"
        class="coupon-card" :class="{ used: item.status === 'used' || item.status === 'expired' }">
        <div class="coupon-left">
          <span class="coupon-type">{{ item.product?.category === 'voucher' ? '券' : '券' }}</span>
        </div>
        <div class="coupon-body">
          <b class="coupon-name">{{ item.product?.name || '优惠券' }}</b>
          <span class="coupon-cost">{{ item.points_used || item.product?.points_required || 0 }} 积分兑换</span>
        </div>
        <div class="coupon-right">
          <span class="coupon-status" :class="item.status">{{ statusMap[item.status] || item.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pointsAPI } from '@/services/api'

const loading = ref(true)
const error = ref('')
const list = ref<any[]>([])

const statusMap: Record<string, string> = {
  pending: '待发放',
  shipped: '已发放',
  completed: '已使用',
  used: '已使用',
  cancelled: '已取消',
  expired: '已过期'
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res: any = await pointsAPI.getMyExchanges({ pageSize: 100 })
    const all = res.data?.list || []
    list.value = all.filter((r: any) => {
      const cat = r.product?.category
      return cat === 'coupon' || cat === 'voucher'
    })
  } catch (e: any) {
    error.value = e.message || '网络错误'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.coupons-page {
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
  display: flex; align-items: center; gap: 14px;
  background: var(--white);
  padding: 16px;
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
}

.sk-avatar {
  width: 48px; height: 48px;
  background: var(--border-light);
  border-radius: 10px;
  animation: pulse 1.5s infinite;
}

.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }

.sk-line {
  height: 12px;
  background: var(--border-light);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.w60 { width: 60%; }
.w40 { width: 40%; }

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

.coupon-list { display: flex; flex-direction: column; gap: 10px; }

.coupon-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
  transition: all 0.2s;
}

.coupon-card:hover { box-shadow: var(--shadow-card-hover); }

.coupon-card.used { opacity: 0.5; }

.coupon-left {
  flex-shrink: 0;
}

.coupon-type {
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: var(--ink);
  color: var(--white);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.coupon-body { flex: 1; min-width: 0; }

.coupon-name {
  display: block;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.coupon-cost {
  font-size: 12px;
  color: var(--text-light);
}

.coupon-right { flex-shrink: 0; }

.coupon-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.coupon-status.pending { background: #fef3c7; color: #92400e; }
.coupon-status.shipped { background: #dbeafe; color: #1e40af; }
.coupon-status.completed, .coupon-status.used { background: #d1fae5; color: #065f46; }
.coupon-status.cancelled, .coupon-status.expired { background: #f3f4f6; color: #6b7280; }
</style>
