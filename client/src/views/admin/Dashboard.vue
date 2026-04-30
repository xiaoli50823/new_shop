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
          <span>{{ item.icon }}</span>
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

    <!-- 第二行：转化漏斗 + 销售趋势 -->
    <div class="row-two">
      <div class="card funnel-card">
        <div class="card-header">
          <h3>转化漏斗</h3>
        </div>
        <div class="funnel-body" v-loading="loading.funnel">
          <div
            v-for="(step, idx) in funnelSteps"
            :key="idx"
            class="funnel-step"
          >
            <div class="funnel-bar-wrapper">
              <div
                class="funnel-bar"
                :style="{
                  width: step.percent + '%',
                  background: funnelColors[idx] || '#1890FF'
                }"
              >
                <span class="funnel-value">{{ step.value.toLocaleString() }}</span>
              </div>
            </div>
            <div class="funnel-label">
              <span class="funnel-name">{{ step.label }}</span>
              <span class="funnel-rate">{{ step.percent }}%</span>
            </div>
            <div v-if="idx < funnelSteps.length - 1" class="funnel-convert">
              转化率 {{ step.convertRate }}%
            </div>
          </div>
        </div>
      </div>
      <div class="card trend-card">
        <div class="card-header">
          <h3>最近7天销售趋势</h3>
        </div>
        <div class="trend-body" v-loading="loading.salesTrend">
          <div class="chart-container">
            <div class="chart-y-axis">
              <div v-for="label in yAxisLabels" :key="label" class="y-label">{{ label }}</div>
            </div>
            <div class="chart-area">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="none" class="trend-svg">
                <!-- 网格线 -->
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
                <!-- 渐变区域 -->
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1890FF" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#1890FF" stop-opacity="0.02" />
                  </linearGradient>
                </defs>
                <polygon :points="areaPoints" fill="url(#areaGradient)" />
                <!-- 折线 -->
                <polyline
                  :points="linePoints"
                  fill="none"
                  stroke="#1890FF"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- 数据点 -->
                <circle
                  v-for="(pt, idx) in dataPoints"
                  :key="'dot-' + idx"
                  :cx="pt.x"
                  :cy="pt.y"
                  r="4"
                  fill="#fff"
                  stroke="#1890FF"
                  stroke-width="2"
                />
              </svg>
              <div class="chart-x-axis">
                <div v-for="label in salesTrendData.labels" :key="label" class="x-label">{{ label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：奖池监控表格 -->
    <div class="card monitor-card">
      <div class="card-header">
        <h3>奖池监控</h3>
      </div>
      <el-table
        :data="prizeMonitorData"
        stripe
        border
        v-loading="loading.prizeMonitor"
        style="width: 100%"
      >
        <el-table-column prop="name" label="盲盒名称" min-width="160" />
        <el-table-column label="隐藏款爆出率" width="160">
          <template #default="{ row }">
            <span :class="{ 'rate-warning': row.hiddenRate > row.expectedRate }">
              {{ row.hiddenRate }}%
            </span>
            <span class="expected-rate"> (预期 {{ row.expectedRate }}%)</span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'"
              size="small"
            >
              {{ row.riskLevel === 'high' ? '高' : row.riskLevel === 'medium' ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalDraws" label="总抽盒次数" width="120" />
        <el-table-column prop="hiddenCount" label="隐藏款产出" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewMonitorDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 第四行：最近订单 + 热门用户 -->
    <div class="row-four">
      <div class="card recent-orders-card">
        <div class="card-header">
          <h3>最近订单</h3>
          <el-button type="primary" link @click="$router.push('/admin/order')">查看全部</el-button>
        </div>
        <div class="order-list" v-loading="loading.recentOrders">
          <div v-for="order in recentOrders" :key="order.id" class="order-item">
            <div class="order-info">
              <span class="order-id">{{ order.orderNo }}</span>
              <el-tag :type="getOrderStatusType(order.status)" size="small">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
            </div>
            <div class="order-meta">
              <span class="order-user">{{ order.username }}</span>
              <span class="order-amount">¥{{ order.amount }}</span>
              <span class="order-time">{{ order.createdAt }}</span>
            </div>
          </div>
          <el-empty v-if="!loading.recentOrders && recentOrders.length === 0" description="暂无订单" :image-size="60" />
        </div>
      </div>
      <div class="card hot-users-card">
        <div class="card-header">
          <h3>热门用户</h3>
          <el-button type="primary" link @click="$router.push('/admin/user')">查看全部</el-button>
        </div>
        <div class="user-list" v-loading="loading.hotUsers">
          <div v-for="(user, idx) in hotUsers" :key="user.id" class="user-item">
            <div class="user-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-stats">VIP{{ user.vipLevel }} · {{ user.drawCount }}次抽盒</div>
            </div>
            <div class="user-amount">¥{{ user.totalSpend }}</div>
          </div>
          <el-empty v-if="!loading.hotUsers && hotUsers.length === 0" description="暂无数据" :image-size="60" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../../services/api'

// 加载状态
const loading = reactive({
  overview: false,
  funnel: false,
  salesTrend: false,
  prizeMonitor: false,
  recentOrders: false,
  hotUsers: false
})

// 核心指标
const overviewData = ref({
  gmv: 0,
  drawCount: 0,
  newUsers: 0,
  activeUsers: 0,
  pointsConsumed: 0,
  gmvTrend: 12.5,
  drawTrend: 8.3,
  newUsersTrend: 5.7,
  activeUsersTrend: 3.2,
  pointsTrend: 15.8
})

const animatedValues = reactive<Record<string, number>>({
  gmv: 0,
  drawCount: 0,
  newUsers: 0,
  activeUsers: 0,
  pointsConsumed: 0
})

const metricCards = computed(() => [
  { key: 'gmv', title: '今日GMV', icon: '💰', prefix: '¥', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', trendUp: overviewData.value.gmvTrend >= 0, trendValue: Math.abs(overviewData.value.gmvTrend) },
  { key: 'drawCount', title: '抽盒次数', icon: '🎰', prefix: '', bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', trendUp: overviewData.value.drawTrend >= 0, trendValue: Math.abs(overviewData.value.drawTrend) },
  { key: 'newUsers', title: '新增用户', icon: '👥', prefix: '', bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', trendUp: overviewData.value.newUsersTrend >= 0, trendValue: Math.abs(overviewData.value.newUsersTrend) },
  { key: 'activeUsers', title: '活跃用户', icon: '🔥', prefix: '', bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', trendUp: overviewData.value.activeUsersTrend >= 0, trendValue: Math.abs(overviewData.value.activeUsersTrend) },
  { key: 'pointsConsumed', title: '消耗积分', icon: '⭐', prefix: '', bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', trendUp: overviewData.value.pointsTrend >= 0, trendValue: Math.abs(overviewData.value.pointsTrend) }
])

// 动画计数
const animateValue = (key: string, target: number) => {
  const duration = 1200
  const startTime = Date.now()
  const start = animatedValues[key] || 0
  const diff = target - start
  const tick = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedValues[key] = Math.round(start + diff * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// 转化漏斗
const funnelSteps = ref<Array<{ label: string; value: number; percent: number; convertRate: number }>>([])
const funnelColors = ['#1890FF', '#36CFC9', '#52C41A', '#FAAD14']

// 销售趋势
const chartWidth = 600
const chartHeight = 200

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

// 奖池监控
const prizeMonitorData = ref<Array<{
  id: string; name: string; hiddenRate: number; expectedRate: number;
  riskLevel: string; totalDraws: number; hiddenCount: number
}>>([])

// 最近订单
const recentOrders = ref<Array<{
  id: string; orderNo: string; username: string; status: string;
  amount: number; createdAt: string
}>>([])

// 热门用户
const hotUsers = ref<Array<{
  id: string; username: string; vipLevel: number;
  drawCount: number; totalSpend: number
}>>([])

const getOrderStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', paid: '', shipping: 'info', completed: 'success', cancelled: 'danger' }
  return (map[status] || '') as any
}

const getOrderStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待支付', paid: '已支付', shipping: '配送中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

// 加载数据
const loadOverview = async () => {
  loading.overview = true
  try {
    const res: any = await api.get('/dashboard/overview')
    const data = res?.data || res || {}
    overviewData.value = {
      gmv: data.gmv ?? 128500,
      drawCount: data.drawCount ?? 3250,
      newUsers: data.newUsers ?? 458,
      activeUsers: data.activeUsers ?? 1250,
      pointsConsumed: data.pointsConsumed ?? 8500,
      gmvTrend: data.gmvTrend ?? 12.5,
      drawTrend: data.drawTrend ?? 8.3,
      newUsersTrend: data.newUsersTrend ?? 5.7,
      activeUsersTrend: data.activeUsersTrend ?? 3.2,
      pointsTrend: data.pointsTrend ?? 15.8
    }
    animateValue('gmv', overviewData.value.gmv)
    animateValue('drawCount', overviewData.value.drawCount)
    animateValue('newUsers', overviewData.value.newUsers)
    animateValue('activeUsers', overviewData.value.activeUsers)
    animateValue('pointsConsumed', overviewData.value.pointsConsumed)
  } catch (e) {
    // 使用默认数据
    overviewData.value = { gmv: 128500, drawCount: 3250, newUsers: 458, activeUsers: 1250, pointsConsumed: 8500, gmvTrend: 12.5, drawTrend: 8.3, newUsersTrend: 5.7, activeUsersTrend: 3.2, pointsTrend: 15.8 }
    animateValue('gmv', 128500)
    animateValue('drawCount', 3250)
    animateValue('newUsers', 458)
    animateValue('activeUsers', 1250)
    animateValue('pointsConsumed', 8500)
  } finally {
    loading.overview = false
  }
}

const loadFunnel = async () => {
  loading.funnel = true
  try {
    const res: any = await api.get('/dashboard/funnel')
    const data = res?.data || res || {}
    const steps = data.steps || [
      { label: '访问', value: 10000 },
      { label: '详情', value: 6000 },
      { label: '支付', value: 3000 },
      { label: '复购', value: 1500 }
    ]
    const maxVal = steps[0]?.value || 1
    funnelSteps.value = steps.map((s: any, i: number) => ({
      label: s.label,
      value: s.value,
      percent: Math.round((s.value / maxVal) * 100),
      convertRate: i > 0 ? Math.round((s.value / steps[i - 1].value) * 100) : 100
    }))
  } catch {
    const steps = [
      { label: '访问', value: 10000 },
      { label: '详情', value: 6000 },
      { label: '支付', value: 3000 },
      { label: '复购', value: 1500 }
    ]
    funnelSteps.value = steps.map((s, i) => ({
      label: s.label,
      value: s.value,
      percent: Math.round((s.value / 10000) * 100),
      convertRate: i > 0 ? Math.round((s.value / steps[i - 1].value) * 100) : 100
    }))
  } finally {
    loading.funnel = false
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

const loadPrizeMonitor = async () => {
  loading.prizeMonitor = true
  try {
    const res: any = await api.get('/dashboard/prize-monitor')
    const data = res?.data || res || []
    prizeMonitorData.value = Array.isArray(data) ? data : data.list || [
      { id: '1', name: '海贼王一番赏', hiddenRate: 1.2, expectedRate: 1.0, riskLevel: 'medium', totalDraws: 1200, hiddenCount: 14 },
      { id: '2', name: '火影忍者一番赏', hiddenRate: 0.8, expectedRate: 1.0, riskLevel: 'low', totalDraws: 850, hiddenCount: 7 },
      { id: '3', name: '潮玩盲盒', hiddenRate: 2.5, expectedRate: 2.0, riskLevel: 'high', totalDraws: 1500, hiddenCount: 38 },
      { id: '4', name: '美妆盲盒', hiddenRate: 1.5, expectedRate: 1.5, riskLevel: 'low', totalDraws: 980, hiddenCount: 15 },
      { id: '5', name: '3C数码盲盒', hiddenRate: 0.5, expectedRate: 0.5, riskLevel: 'low', totalDraws: 750, hiddenCount: 4 }
    ]
  } catch {
    prizeMonitorData.value = [
      { id: '1', name: '海贼王一番赏', hiddenRate: 1.2, expectedRate: 1.0, riskLevel: 'medium', totalDraws: 1200, hiddenCount: 14 },
      { id: '2', name: '火影忍者一番赏', hiddenRate: 0.8, expectedRate: 1.0, riskLevel: 'low', totalDraws: 850, hiddenCount: 7 },
      { id: '3', name: '潮玩盲盒', hiddenRate: 2.5, expectedRate: 2.0, riskLevel: 'high', totalDraws: 1500, hiddenCount: 38 },
      { id: '4', name: '美妆盲盒', hiddenRate: 1.5, expectedRate: 1.5, riskLevel: 'low', totalDraws: 980, hiddenCount: 15 },
      { id: '5', name: '3C数码盲盒', hiddenRate: 0.5, expectedRate: 0.5, riskLevel: 'low', totalDraws: 750, hiddenCount: 4 }
    ]
  } finally {
    loading.prizeMonitor = false
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
      { id: '1', orderNo: 'ORD20260430001', username: '小明', status: 'pending', amount: 250, createdAt: '2026-04-30 10:30' },
      { id: '2', orderNo: 'ORD20260430002', username: '小红', status: 'paid', amount: 199, createdAt: '2026-04-30 09:15' },
      { id: '3', orderNo: 'ORD20260429003', username: '小刚', status: 'shipping', amount: 50, createdAt: '2026-04-29 16:45' },
      { id: '4', orderNo: 'ORD20260429004', username: '小美', status: 'completed', amount: 399, createdAt: '2026-04-29 14:20' },
      { id: '5', orderNo: 'ORD20260428005', username: '小强', status: 'cancelled', amount: 69, createdAt: '2026-04-28 11:00' }
    ]
  } finally {
    loading.recentOrders = false
  }
}

const loadHotUsers = async () => {
  loading.hotUsers = true
  try {
    const res: any = await api.get('/dashboard/hot-users')
    const data = res?.data || res || []
    hotUsers.value = (Array.isArray(data) ? data : data.list || []).slice(0, 5)
    if (!hotUsers.value.length) throw new Error('empty')
  } catch {
    hotUsers.value = [
      { id: '1', username: '小红', vipLevel: 5, drawCount: 320, totalSpend: 15800 },
      { id: '2', username: '小明', vipLevel: 3, drawCount: 215, totalSpend: 10750 },
      { id: '3', username: '小美', vipLevel: 4, drawCount: 180, totalSpend: 8900 },
      { id: '4', username: '小刚', vipLevel: 2, drawCount: 120, totalSpend: 5600 },
      { id: '5', username: '小强', vipLevel: 1, drawCount: 85, totalSpend: 3200 }
    ]
  } finally {
    loading.hotUsers = false
  }
}

const viewMonitorDetail = (row: any) => {
  ElMessage.info(`查看盲盒「${row.name}」的详细监控数据`)
}

onMounted(() => {
  loadOverview()
  loadFunnel()
  loadSalesTrend()
  loadPrizeMonitor()
  loadRecentOrders()
  loadHotUsers()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用 */
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 指标卡片 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.metric-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.25s, box-shadow 0.25s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.metric-body {
  flex: 1;
  min-width: 0;
}

.metric-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
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
  color: #C0C4CC;
}

/* 第二行 */
.row-two {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
}

/* 漏斗 */
.funnel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.funnel-step {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.funnel-bar-wrapper {
  width: 100%;
  height: 36px;
  background: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;
}

.funnel-bar {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 0.8s ease;
  min-width: 60px;
}

.funnel-value {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.funnel-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.funnel-rate {
  color: #1890FF;
  font-weight: 500;
}

.funnel-convert {
  font-size: 11px;
  color: #C0C4CC;
  text-align: center;
}

/* 趋势图 */
.trend-body {
  height: 280px;
}

.chart-container {
  display: flex;
  height: 100%;
  gap: 8px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  text-align: right;
  padding: 8px 0 24px 0;
}

.y-label {
  font-size: 11px;
  color: #C0C4CC;
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

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
}

.x-label {
  font-size: 11px;
  color: #909399;
}

/* 奖池监控 */
.rate-warning {
  color: #FF4D4F;
  font-weight: 600;
}

.expected-rate {
  font-size: 12px;
  color: #C0C4CC;
}

/* 第四行 */
.row-four {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 最近订单 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  transition: background 0.2s;
}

.order-item:hover {
  background: #f0f9ff;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.order-id {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.order-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.order-amount {
  color: #FF4D4F;
  font-weight: 600;
}

/* 热门用户 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #fafafa;
}

.user-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  flex-shrink: 0;
}

.user-rank.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #fff;
}

.user-rank.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: #fff;
}

.user-rank.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  color: #fff;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-stats {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.user-amount {
  font-size: 15px;
  font-weight: 600;
  color: #FF4D4F;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
  .row-two,
  .row-four {
    grid-template-columns: 1fr;
  }
}
</style>
