<template>
  <div class="personal-page">
    <div class="personal-header">
      <div class="header-content">
        <div class="avatar-mark">U</div>
        <div class="header-info">
          <h2 class="username">星球玩家</h2>
          <div class="level-row">
            <span class="level-badge">Lv.6</span>
            <span class="exp-text">经验值 11296 / 200000</span>
          </div>
        </div>
        <button class="settings-btn" @click="goSettings">设置</button>
      </div>
      <div class="asset-row">
        <div class="asset-item" @click="recharge('balance')">
          <span class="asset-value">&yen;0.00</span>
          <span class="asset-label">余额</span>
        </div>
        <div class="asset-divider"></div>
        <div class="asset-item" @click="goPointsMall">
          <span class="asset-value">{{ stats.points || 0 }}</span>
          <span class="asset-label">积分</span>
        </div>
        <div class="asset-divider"></div>
        <div class="asset-item" @click="recharge('blindBoxCoin')">
          <span class="asset-value">{{ stats.blindBoxCoin || 0 }}</span>
          <span class="asset-label">盲盒币</span>
        </div>
      </div>
    </div>

    <div class="personal-body">
      <div class="body-left">
        <div class="card function-grid">
          <div
            v-for="entry in entries"
            :key="entry.label"
            class="func-item"
            @click="entry.action"
          >
            <div class="func-label">{{ entry.label }}</div>
            <div class="func-sub">{{ entry.sub }}</div>
          </div>
        </div>

        <div class="card section-card">
          <h3 class="section-title">我的订单</h3>
          <div class="order-types">
            <div
              v-for="item in orderTypes"
              :key="item.label"
              class="order-type"
              @click="goToEntry('orders', item.status)"
            >
              <span class="order-type-label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="card section-card">
          <h3 class="section-title">更多服务</h3>
          <div class="service-list">
            <div
              v-for="item in services"
              :key="item.label"
              class="service-item"
              @click="item.action"
            >
              <span class="service-label">{{ item.label }}</span>
              <span class="service-arrow">&rsaquo;</span>
            </div>
          </div>
        </div>

        <div class="logout-area">
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>

      <div class="body-right">
        <div class="card vip-card">
          <h3>VIP 俱乐部</h3>
          <p>开通VIP享专属折扣、优先发货</p>
          <button class="vip-btn">立即开通</button>
        </div>

        <div class="card activity-card">
          <div class="activity-header">
            <h3>活动中心</h3>
            <span class="activity-more">更多 &rsaquo;</span>
          </div>
          <div class="activity-list">
            <div
              v-for="(act, i) in activities"
              :key="i"
              class="activity-item"
            >
              <span class="activity-title">{{ act.title }}</span>
              <span class="activity-status" :class="{ active: act.active }">
                {{ act.active ? '进行中' : act.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="card help-card">
          <h3>帮助与客服</h3>
          <div class="help-list">
            <div
              v-for="item in helpItems"
              :key="item.label"
              class="help-item"
            >
              <span class="help-label">{{ item.label }}</span>
              <span class="help-arrow">&rsaquo;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
  points: 200, blindBoxCoin: 50, balance: '0.00', drawCount: 10
})

const entries = ref([
  { label: '我的订单', sub: '查看订单详情', action: () => goToEntry('orders') },
  { label: '我的盒柜', sub: '管理已抽奖品', action: () => router.push('/box-cabinet') },
  { label: '优惠券', sub: '查看可用优惠券', action: () => goToEntry('coupons') },
  { label: '收货地址', sub: '管理收货地址', action: () => goToEntry('address') },
  { label: '积分商城', sub: '兑换积分好礼', action: () => router.push('/points-mall') },
  { label: '每日签到', sub: '签到领取积分', action: () => router.push('/check-in') }
])

const orderTypes = ref([
  { label: '全部', status: '' },
  { label: '待付款', status: 'pending' },
  { label: '待发货', status: 'paid' },
  { label: '已发货', status: 'shipped' },
  { label: '已完成', status: 'completed' }
])

const services = ref([
  { label: '收藏夹', action: () => goToEntry('favorites') },
  { label: '浏览记录', action: () => goToEntry('history') },
  { label: '帮助中心', action: () => goToEntry('help') },
  { label: '关于我们', action: () => goToEntry('about') }
])

const activities = ref([
  { title: '新人首抽半价', active: true, status: '已结束' },
  { title: '端午盲盒狂欢', active: false, status: '已结束' },
  { title: '五一限定活动', active: false, status: '已结束' }
])

const helpItems = ref([
  { label: '常见问题' },
  { label: '联系客服' },
  { label: '意见反馈' },
  { label: '退款政策' }
])

const goToEntry = (entry: string, query?: string) => {
  const path = query ? `/${entry}?status=${query}` : `/${entry}`
  router.push(path)
}

const goSettings = () => router.push('/settings')
const goPointsMall = () => router.push('/points-mall')
const recharge = (type: string) => router.push('/recharge')
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => { /* fetch stats */ })
</script>

<style scoped>
.personal-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--beige);
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
}

.personal-header {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.avatar-mark {
  width: 56px; height: 56px;
  background: var(--ink);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  flex-shrink: 0;
}

.header-info { flex: 1; }

.username {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  padding: 2px 10px;
  background: var(--ink-subtle);
  color: var(--ink);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.exp-text { font-size: 12px; color: var(--text-light); }

.settings-btn {
  padding: 8px 18px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.settings-btn:hover { border-color: var(--ink); color: var(--ink); }

.asset-row {
  display: flex;
  align-items: center;
  background: var(--beige);
  border-radius: 10px;
  padding: 16px 0;
}

.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.asset-item:hover { opacity: 0.7; }

.asset-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.asset-label { font-size: 12px; color: var(--text-light); }

.asset-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

.personal-body {
  display: flex;
  gap: 20px;
}

.body-left { flex: 1; }

.body-right {
  width: 300px;
  flex-shrink: 0;
}

.card {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 20px;
  border: 1px solid var(--border);
  margin-bottom: 16px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  padding: 0;
  overflow: hidden;
}

.func-item {
  padding: 20px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.func-item::after {
  content: '';
  position: absolute;
  right: 0; bottom: 0;
  width: 1px; height: 100%;
  background: var(--border-light);
}

.func-item:hover { background: var(--beige); }

.func-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.func-sub { font-size: 11px; color: var(--text-light); }

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.order-types { display: flex; gap: 4px; }

.order-type {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.order-type:hover { background: var(--beige); color: var(--text-primary); }

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
  color: var(--text-secondary);
}

.service-item:last-child { border-bottom: none; }
.service-item:hover { color: var(--text-primary); }
.service-arrow { color: var(--text-light); font-size: 16px; }

.logout-area { padding: 20px 0; }

.logout-btn {
  width: 100%;
  padding: 12px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover { border-color: var(--danger); color: var(--danger); }

.vip-card {
  background: var(--ink);
  color: var(--white);
  border: none;
}

.vip-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
.vip-card p { font-size: 12px; opacity: 0.85; margin-bottom: 14px; }

.vip-btn {
  padding: 10px 24px;
  background: var(--white);
  color: var(--ink);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.vip-btn:hover { opacity: 0.9; }

.activity-header { display: flex; justify-content: space-between; margin-bottom: 14px; }
.activity-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.activity-more { font-size: 12px; color: var(--text-light); cursor: pointer; }
.activity-more:hover { color: var(--ink); }

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-item:last-child { border-bottom: none; }

.activity-status {
  font-size: 11px;
  color: var(--text-light);
}

.activity-status.active { color: var(--success); font-weight: 500; }

.help-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 14px; }

.help-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
}

.help-item:last-child { border-bottom: none; }
.help-item:hover { color: var(--text-primary); }
.help-arrow { color: var(--text-light); font-size: 16px; }

@media (max-width: 900px) {
  .personal-body { flex-direction: column; }
  .body-right { width: 100%; }
}

@media (max-width: 640px) {
  .function-grid { grid-template-columns: repeat(2, 1fr); }
  .order-types { flex-wrap: wrap; }
  .order-type { flex: none; width: 20%; }
}
</style>
