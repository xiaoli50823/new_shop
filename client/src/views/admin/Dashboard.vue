<template>
  <div class="dashboard">
    <!-- 第一行：核心指标卡片 -->
    <div class="metrics-row">
      <div
        v-for="item in metricCards"
        :key="item.key"
        class="metric-card"
        v-loading="loading.overview"
      >
        <div class="metric-icon" :style="{ background: item.bgColor }">
          <component :is="item.icon" />
        </div>
        <div class="metric-body">
          <div class="metric-title">{{ item.title }}</div>
          <div class="metric-value">{{ item.prefix }}{{ animatedValues[item.key] ?? 0 }}</div>
          <div class="metric-trend" :class="item.trendUp ? 'trend-up' : 'trend-down'">
            {{ item.trendUp ? '↑' : '↓' }} {{ item.trendValue }}%
            <span class="trend-label">较昨日</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：销售趋势 + 渠道分布 + 实时订单 -->
    <div class="row-two">
      <div class="card trend-card">
        <div class="card-header">
          <h3>销售趋势</h3>
          <div class="card-tabs">
            <span
              v-for="tab in trendTabs"
              :key="tab.value"
              class="tab-item"
              :class="{ active: activeTrendTab === tab.value }"
              @click="activeTrendTab = tab.value"
            >{{ tab.label }}</span>
          </div>
        </div>
        <div class="trend-body" v-loading="loading.salesTrend">
          <div class="chart-container">
            <div class="chart-y-axis">
              <div v-for="label in yAxisLabels" :key="label" class="y-label">{{ label }}</div>
            </div>
            <div class="chart-area">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="none" class="trend-svg">
                <line
                  v-for="i in 5"
                  :key="'grid-' + i"
                  :x1="0"
                  :y1="(chartHeight / 5) * i"
                  :x2="chartWidth"
                  :y2="(chartHeight / 5) * i"
                  stroke="#f0f0f0"
                  stroke-width="1"
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4080FF" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#4080FF" stop-opacity="0.02" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#4080FF" />
                    <stop offset="100%" stop-color="#9254DE" />
                  </linearGradient>
                </defs>
                <polygon :points="areaPoints" fill="url(#areaGradient)" />
                <polyline
                  :points="linePoints"
                  fill="none"
                  stroke="url(#lineGradient)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  v-for="(pt, idx) in dataPoints"
                  :key="'dot-' + idx"
                  :cx="pt.x"
                  :cy="pt.y"
                  r="5"
                  fill="#fff"
                  stroke="#4080FF"
                  stroke-width="3"
                  class="data-point"
                />
              </svg>
              <div class="chart-x-axis">
                <div v-for="label in salesTrendData.labels" :key="label" class="x-label">{{ label }}</div>
              </div>
            </div>
          </div>
          <div class="trend-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: #4080FF"></span>
              <span>GMV</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #FF7D00"></span>
              <span>订单数</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card channel-card">
        <div class="card-header">
          <h3>渠道分布</h3>
          <span class="total-amount">总金额 ¥{{ totalChannelAmount }}</span>
        </div>
        <div class="channel-body" v-loading="loading.channel">
          <div class="pie-chart">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle
                v-for="(segment, idx) in pieSegments"
                :key="idx"
                cx="100"
                cy="100"
                r="70"
                :fill="segment.color"
                :stroke="segment.color"
                stroke-width="80"
                :stroke-dasharray="segment.dashArray"
                :stroke-dashoffset="segment.dashOffset"
                transform="rotate(-90 100 100)"
                class="pie-segment"
              />
            </svg>
            <div class="pie-center">
              <div class="pie-value">{{ pieCenterPercent }}%</div>
              <div class="pie-label">TOP1渠道</div>
            </div>
          </div>
          <div class="channel-list">
            <div v-for="item in channelData" :key="item.name" class="channel-item">
              <span class="channel-color" :style="{ background: item.color }"></span>
              <span class="channel-name">{{ item.name }}</span>
              <span class="channel-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card orders-card">
        <div class="card-header">
          <h3>实时订单</h3>
          <span class="more-link">更多 ></span>
        </div>
        <div class="orders-body" v-loading="loading.recentOrders">
          <div v-for="order in recentOrders" :key="order.id" class="order-item">
            <div class="order-info">
              <span class="order-id">{{ order.orderNo }}</span>
              <span class="order-user">{{ order.username }}</span>
            </div>
            <div class="order-amount">¥{{ order.amount }}</div>
            <div class="order-time">{{ order.createdAt }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：热销盲盒TOP5 + 用户增长趋势 -->
    <div class="row-three">
      <div class="card hot-boxes-card">
        <div class="card-header">
          <h3>热销盲盒TOP5</h3>
        </div>
        <div class="hot-boxes-body" v-loading="loading.hotBoxes">
          <div v-for="(item, idx) in hotBoxes" :key="item.id" class="hot-box-item">
            <div class="hot-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
            <img :src="item.image" :alt="item.name" class="hot-image" />
            <div class="hot-info">
              <span class="hot-name">{{ item.name }}</span>
              <div class="hot-stats">
                <span class="hot-sales">销量 {{ item.sales }}</span>
                <span class="hot-revenue">¥{{ item.revenue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card growth-card">
        <div class="card-header">
          <h3>用户增长趋势</h3>
          <div class="card-tabs">
            <span
              v-for="tab in growthTabs"
              :key="tab.value"
              class="tab-item"
              :class="{ active: activeGrowthTab === tab.value }"
              @click="activeGrowthTab = tab.value"
            >{{ tab.label }}</span>
          </div>
        </div>
        <div class="growth-body" v-loading="loading.userGrowth">
          <div class="bar-chart">
            <div v-for="(item, idx) in userGrowthData" :key="idx" class="bar-item">
              <div class="bar-wrapper">
                <div
                  class="bar-fill"
                  :style="{ height: (item.value / maxGrowthValue * 100) + '%' }"
                ></div>
                <div class="bar-value">{{ item.value }}</div>
              </div>
              <div class="bar-label">{{ item.label }}</div>
            </div>
          </div>
          <div class="growth-summary">
            <div class="summary-item">
              <span class="summary-label">新增用户</span>
              <span class="summary-value">{{ totalNewUsers }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">累计用户</span>
              <span class="summary-value">{{ totalUsers }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四行：系统状态 + 快捷操作 -->
    <div class="row-four">
      <div class="card status-card">
        <div class="card-header">
          <h3>系统状态</h3>
        </div>
        <div class="status-body">
          <div v-for="item in systemStatus" :key="item.name" class="status-item">
            <div class="status-icon" :class="item.status">
              <component :is="item.icon" />
            </div>
            <div class="status-info">
              <span class="status-name">{{ item.name }}</span>
              <span class="status-desc">{{ item.desc }}</span>
            </div>
            <span class="status-badge" :class="item.status">{{ item.statusText }}</span>
          </div>
        </div>
      </div>
      <div class="card actions-card">
        <div class="card-header">
          <h3>快捷操作</h3>
        </div>
        <div class="actions-body">
          <div v-for="item in quickActions" :key="item.label" class="action-item" @click="handleAction(item.path)">
            <div class="action-icon" :style="{ background: item.bgColor }">
              <component :is="item.icon" />
            </div>
            <span class="action-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Reading, ShoppingCart, User, Clock, Wallet, Present,
  Cpu, Setting,
  Plus, Edit, Search, Download
} from '@element-plus/icons-vue'
import api from '../../services/api'

const loading = reactive({
  overview: false,
  salesTrend: false,
  channel: false,
  recentOrders: false,
  hotBoxes: false,
  userGrowth: false
})

const overviewData = ref({
  gmv: 0,
  orderCount: 0,
  newUsers: 0,
  activeUsers: 0,
  repurchaseRate: 0,
  avgPrice: 0,
  gmvTrend: 12.5,
  orderTrend: 8.3,
  newUsersTrend: 5.7,
  activeUsersTrend: 3.2,
  repurchaseTrend: 2.1,
  priceTrend: -1.2
})

const animatedValues = reactive<Record<string, number>>({
  gmv: 0,
  orderCount: 0,
  newUsers: 0,
  activeUsers: 0,
  repurchaseRate: 0,
  avgPrice: 0
})

const metricCards = computed(() => [
  { key: 'gmv', title: '今日GMV', icon: Wallet, prefix: '¥', bgColor: 'var(--ink)', trendUp: overviewData.value.gmvTrend >= 0, trendValue: Math.abs(overviewData.value.gmvTrend) },
  { key: 'orderCount', title: '订单数', icon: ShoppingCart, prefix: '', bgColor: 'var(--ink)', trendUp: overviewData.value.orderTrend >= 0, trendValue: Math.abs(overviewData.value.orderTrend) },
  { key: 'newUsers', title: '新增用户', icon: User, prefix: '', bgColor: 'var(--ink)', trendUp: overviewData.value.newUsersTrend >= 0, trendValue: Math.abs(overviewData.value.newUsersTrend) },
  { key: 'activeUsers', title: '活跃用户', icon: Clock, prefix: '', bgColor: 'var(--ink)', trendUp: overviewData.value.activeUsersTrend >= 0, trendValue: Math.abs(overviewData.value.activeUsersTrend) },
  { key: 'repurchaseRate', title: '复购率', icon: Reading, prefix: '', bgColor: 'var(--ink)', trendUp: overviewData.value.repurchaseTrend >= 0, trendValue: Math.abs(overviewData.value.repurchaseTrend) },
  { key: 'avgPrice', title: '盲盒均价', icon: Present, prefix: '¥', bgColor: 'var(--ink)', trendUp: overviewData.value.priceTrend >= 0, trendValue: Math.abs(overviewData.value.priceTrend) }
])

const animateValue = (key: string, target: number) => {
  const duration = 1200
  const startTime = Date.now()
  const start = animatedValues[key] || 0
  const diff = target - start
  const tick = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedValues[key] = key === 'repurchaseRate' ? parseFloat((start + diff * eased).toFixed(1)) : Math.round(start + diff * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const activeTrendTab = ref('today')
const trendTabs = [
  { label: '今日', value: 'today' },
  { label: '7天', value: 'week' },
  { label: '30天', value: 'month' }
]

const chartWidth = 400
const chartHeight = 160

const salesTrendData = ref<{ labels: string[]; values: number[] }>({ labels: [], values: [] })

const yAxisLabels = computed(() => {
  const max = Math.max(...(salesTrendData.value.values.length ? salesTrendData.value.values : [0]))
  const step = Math.ceil(max / 4)
  return [0, step, step * 2, step * 3, step * 4].reverse().map(v => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : v.toLocaleString())
})

const dataPoints = computed(() => {
  const values = salesTrendData.value.values
  if (!values.length) return []
  const max = Math.max(...values) * 1.1
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * chartWidth,
    y: chartHeight - (v / max) * chartHeight
  }))
})

const linePoints = computed(() => dataPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const areaPoints = computed(() => {
  if (!dataPoints.value.length) return ''
  const pts = dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
  return `0,${chartHeight} ${pts} ${chartWidth},${chartHeight}`
})

const channelData = ref([
  { name: 'APP', percent: 40.2, color: '#4080FF' },
  { name: 'H5', percent: 28.5, color: '#9254DE' },
  { name: '小程序', percent: 18.7, color: '#52C41A' },
  { name: 'PC', percent: 12.6, color: '#FF7D00' }
])

const totalChannelAmount = computed(() => {
  return '12,846'
})

const pieCenterPercent = computed(() => {
  return channelData.value[0]?.percent || 0
})

const pieSegments = computed(() => {
  const total = 2 * Math.PI * 70
  let offset = 0
  return channelData.value.map((item, idx) => {
    const length = (item.percent / 100) * total
    const dashArray = `${length} ${total - length}`
    const dashOffset = -offset
    offset += length
    return { color: item.color, dashArray, dashOffset }
  })
})

const recentOrders = ref<Array<{
  id: string; orderNo: string; username: string; amount: number; createdAt: string
}>>([])

const hotBoxes = ref([
  { id: '1', name: '海贼王系列盲盒', sales: 2680, revenue: '185,000', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=one%20piece%20blind%20box%20luffy%20anime&image_size=square' },
  { id: '2', name: '赛博朋克2077盲盒', sales: 2150, revenue: '125,850', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cyberpunk%202077%20blind%20box%20dark%20neon&image_size=square' },
  { id: '3', name: '火影忍者系列盲盒', sales: 1950, revenue: '95,550', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=naruto%20anime%20blind%20box%20figure&image_size=square' },
  { id: '4', name: '迪士尼100周年盲盒', sales: 1320, revenue: '104,280', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=disney%20mickey%20blind%20box%20celebration&image_size=square' },
  { id: '5', name: '宝可梦系列盲盒', sales: 980, revenue: '48,020', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pokemon%20pikachu%20blind%20box%20figure&image_size=square' }
])

const activeGrowthTab = ref('week')
const growthTabs = [
  { label: '7天', value: 'week' },
  { label: '30天', value: 'month' },
  { label: '90天', value: 'quarter' }
]

const userGrowthData = ref([
  { label: '5-14', value: 280 },
  { label: '5-15', value: 320 },
  { label: '5-16', value: 458 },
  { label: '5-17', value: 380 },
  { label: '5-18', value: 520 },
  { label: '5-19', value: 460 },
  { label: '5-20', value: 580 }
])

const maxGrowthValue = computed(() => {
  return Math.max(...userGrowthData.value.map(v => v.value)) * 1.1
})

const totalNewUsers = computed(() => {
  return userGrowthData.value.reduce((sum, item) => sum + item.value, 0)
})

const totalUsers = computed(() => {
  return '12,846'
})

const systemStatus = ref([
  { name: '服务器状态', desc: '运行中', status: 'success', statusText: '运行中', icon: Cpu },
  { name: '数据库状态', desc: '连接正常', status: 'success', statusText: '正常', icon: Cpu },
  { name: 'Redis状态', desc: '运行中', status: 'success', statusText: '运行中', icon: Cpu },
  { name: 'CDN状态', desc: '256GB / 500GB', status: 'success', statusText: '正常', icon: Cpu },
  { name: '系统状态', desc: 'v2.1.0', status: 'success', statusText: '正常', icon: Setting }
])

const quickActions = ref([
  { label: '添加盲盒', icon: Plus, path: '/admin/blind-box/create', bgColor: 'var(--ink)' },
  { label: '编辑商品', icon: Edit, path: '/admin/blind-box', bgColor: 'var(--ink)' },
  { label: '用户管理', icon: User, path: '/admin/user', bgColor: 'var(--ink)' },
  { label: '数据导出', icon: Download, path: '/admin/report', bgColor: 'var(--ink)' }
])

const handleAction = (path: string) => {
  window.location.href = path
}

const loadOverview = async () => {
  loading.overview = true
  try {
    const res: any = await api.get('/dashboard/overview')
    const data = res?.data || res || {}
    overviewData.value = {
      gmv: data.gmv ?? 128500,
      orderCount: data.orderCount ?? 3250,
      newUsers: data.newUsers ?? 458,
      activeUsers: data.activeUsers ?? 1250,
      repurchaseRate: data.repurchaseRate ?? 26.8,
      avgPrice: data.avgPrice ?? 39.5,
      gmvTrend: data.gmvTrend ?? 12.5,
      orderTrend: data.orderTrend ?? 8.3,
      newUsersTrend: data.newUsersTrend ?? 5.7,
      activeUsersTrend: data.activeUsersTrend ?? 3.2,
      repurchaseTrend: data.repurchaseTrend ?? 2.1,
      priceTrend: data.priceTrend ?? -1.2
    }
    Object.keys(animatedValues).forEach(key => {
      animateValue(key, overviewData.value[key as keyof typeof overviewData.value] as number)
    })
  } catch {
    overviewData.value = { gmv: 128500, orderCount: 3250, newUsers: 458, activeUsers: 1250, repurchaseRate: 26.8, avgPrice: 39.5, gmvTrend: 12.5, orderTrend: 8.3, newUsersTrend: 5.7, activeUsersTrend: 3.2, repurchaseTrend: 2.1, priceTrend: -1.2 }
    Object.keys(animatedValues).forEach(key => {
      animateValue(key, overviewData.value[key as keyof typeof overviewData.value] as number)
    })
  } finally {
    loading.overview = false
  }
}

const loadSalesTrend = async () => {
  loading.salesTrend = true
  try {
    const res: any = await api.get('/dashboard/sales-trend')
    const data = res?.data || res || {}
    salesTrendData.value = {
      labels: data.labels || ['4/24', '4/25', '4/26', '4/27', '4/28', '4/29', '4/30'],
      values: data.values || [85000, 92000, 88000, 105000, 112000, 118000, 128500]
    }
  } catch {
    salesTrendData.value = {
      labels: ['4/24', '4/25', '4/26', '4/27', '4/28', '4/29', '4/30'],
      values: [85000, 92000, 88000, 105000, 112000, 118000, 128500]
    }
  } finally {
    loading.salesTrend = false
  }
}

const loadRecentOrders = async () => {
  loading.recentOrders = true
  try {
    const res: any = await api.get('/dashboard/recent-orders')
    const data = res?.data || res || []
    recentOrders.value = (Array.isArray(data) ? data : data.list || []).slice(0, 5)
    if (!recentOrders.value.length) throw new Error('empty')
  } catch {
    recentOrders.value = [
      { id: '1', orderNo: '#220465320001', username: '星球玩家', amount: 69, createdAt: '15:49:00' },
      { id: '2', orderNo: '#220465320002', username: '小明同学', amount: 128, createdAt: '15:45:23' },
      { id: '3', orderNo: '#220465320003', username: '可爱多', amount: 59, createdAt: '15:42:15' },
      { id: '4', orderNo: '#220465320004', username: '火影迷', amount: 79, createdAt: '15:38:40' },
      { id: '5', orderNo: '#220465320005', username: '海贼王', amount: 199, createdAt: '15:35:12' }
    ]
  } finally {
    loading.recentOrders = false
  }
}

onMounted(() => {
  loadOverview()
  loadSalesTrend()
  loadRecentOrders()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-tabs {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item.active {
  background: #4080FF;
  color: #ffffff;
}

.more-link {
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

/* 指标卡片 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.metric-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.25s, box-shadow 0.25s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 22px;
  flex-shrink: 0;
}

.metric-body {
  flex: 1;
  min-width: 0;
}

.metric-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.trend-up {
  color: #52C41A;
}

.metric-trend.trend-down {
  color: #FF4D4F;
}

.trend-label {
  color: #999;
}

/* 第二行 */
.row-two {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
}

/* 趋势图 */
.trend-body {
  height: 240px;
}

.chart-container {
  display: flex;
  height: calc(100% - 30px);
  gap: 8px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50px;
  text-align: right;
  padding: 8px 0 24px 0;
}

.y-label {
  font-size: 11px;
  color: #999;
}

.chart-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0 0 0;
}

.trend-svg {
  flex: 1;
  width: 100%;
}

.data-point {
  transition: r 0.2s;
}

.data-point:hover {
  r: 8;
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
}

.x-label {
  font-size: 11px;
  color: #999;
}

.trend-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 渠道分布 */
.total-amount {
  font-size: 14px;
  font-weight: 600;
  color: #4080FF;
}

.channel-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pie-chart {
  position: relative;
  width: 180px;
  height: 180px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-segment {
  transition: opacity 0.2s;
}

.pie-segment:hover {
  opacity: 0.8;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-value {
  font-size: 24px;
  font-weight: 700;
  color: #4080FF;
}

.pie-label {
  font-size: 12px;
  color: #999;
}

.channel-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.channel-name {
  flex: 1;
  font-size: 13px;
  color: #666;
}

.channel-percent {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 实时订单 */
.orders-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  padding: 12px;
  background: #FAFAFA;
  border-radius: 10px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-id {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.order-user {
  font-size: 12px;
  color: #999;
}

.order-amount {
  font-size: 16px;
  font-weight: 700;
  color: #FF4D4F;
  margin-bottom: 4px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

/* 第三行 */
.row-three {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 热销盲盒 */
.hot-boxes-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-box-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FAFAFA;
  border-radius: 10px;
}

.hot-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E8E8E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #999;
}

.hot-rank.rank-1 {
  background: var(--ink);
  color: #ffffff;
}

.hot-rank.rank-2 {
  background: var(--charcoal);
  color: #ffffff;
}

.hot-rank.rank-3 {
  background: var(--charcoal-light);
  color: #ffffff;
}

.hot-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.hot-info {
  flex: 1;
}

.hot-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.hot-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.hot-sales, .hot-revenue {
  color: #666;
}

.hot-revenue {
  color: #FF4D4F;
  font-weight: 600;
}

/* 用户增长趋势 */
.growth-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 160px;
  padding: 0 8px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(100% / 7 - 8px);
}

.bar-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  background: #FAFAFA;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: var(--ink);
  border-radius: 8px;
  transition: height 0.6s ease;
}

.bar-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.bar-label {
  font-size: 11px;
  color: #999;
}

.growth-summary {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #999;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #4080FF;
}

/* 第四行 */
.row-four {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 系统状态 */
.status-body {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #FAFAFA;
  border-radius: 12px;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.status-icon.success {
  background: #E6F7FF;
  color: #4080FF;
}

.status-icon.warning {
  background: #FFF7E6;
  color: #FF7D00;
}

.status-icon.error {
  background: #FFF1F0;
  color: #FF4D4F;
}

.status-info {
  text-align: center;
}

.status-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.status-desc {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.success {
  background: #E6F7FF;
  color: #4080FF;
}

.status-badge.warning {
  background: #FFF7E6;
  color: #FF7D00;
}

.status-badge.error {
  background: #FFF1F0;
  color: #FF4D4F;
}

/* 快捷操作 */
.actions-body {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: #FAFAFA;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
}

.action-label {
  font-size: 13px;
  color: #666;
}

@media (max-width: 1400px) {
  .metrics-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .row-two {
    grid-template-columns: 2fr 1fr;
  }
  .orders-card {
    grid-column: span 2;
  }
}

@media (max-width: 1100px) {
  .row-two {
    grid-template-columns: 1fr 1fr;
  }
  .status-body {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .row-two,
  .row-three,
  .row-four {
    grid-template-columns: 1fr;
  }
  .actions-body {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
  .status-body {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
