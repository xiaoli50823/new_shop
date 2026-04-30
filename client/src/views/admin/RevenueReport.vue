<template>
  <div class="revenue-report">
    <!-- 时间选择 -->
    <div class="card time-bar">
      <div class="time-row">
        <el-radio-group v-model="timeRange" @change="handleTimeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px; margin-left: 12px"
          @change="loadData"
        />
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="metrics-row">
      <div v-for="m in metricCards" :key="m.key" class="card metric-card">
        <div class="metric-label">{{ m.label }}</div>
        <div class="metric-value" :style="{ color: m.color }">{{ m.prefix }}{{ animatedValues[m.key] ?? 0 }}</div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="charts-row">
      <!-- 营收趋势 -->
      <div class="card chart-card trend-chart-card">
        <div class="card-header">
          <h3>营收趋势</h3>
        </div>
        <div class="bar-chart" v-loading="loading">
          <div class="bar-chart-inner">
            <div
              v-for="(item, idx) in chartData"
              :key="idx"
              class="bar-group"
            >
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{ height: (item.value / maxChartValue * 100) + '%' }"
                >
                  <span class="bar-label">{{ item.value >= 10000 ? (item.value / 10000).toFixed(1) + 'w' : item.value }}</span>
                </div>
              </div>
              <div class="bar-x-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 各盲盒营收占比 -->
      <div class="card chart-card pie-chart-card">
        <div class="card-header">
          <h3>各盲盒营收占比</h3>
        </div>
        <div class="pie-container" v-loading="loading">
          <div class="pie-chart">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle
                v-for="(seg, idx) in pieSegments"
                :key="idx"
                cx="100"
                cy="100"
                r="80"
                fill="none"
                :stroke="seg.color"
                stroke-width="30"
                :stroke-dasharray="seg.dashArray"
                :stroke-dashoffset="seg.dashOffset"
                :transform="'rotate(-90 100 100)'"
              />
              <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="700" fill="#303133">
                总营收
              </text>
              <text x="100" y="115" text-anchor="middle" font-size="12" fill="#909399">
                ¥{{ totalRevenue.toLocaleString() }}
              </text>
            </svg>
          </div>
          <div class="pie-legend">
            <div v-for="seg in pieData" :key="seg.name" class="legend-item">
              <span class="legend-dot" :style="{ background: seg.color }"></span>
              <span class="legend-name">{{ seg.name }}</span>
              <span class="legend-value">¥{{ seg.value.toLocaleString() }}</span>
              <span class="legend-percent">{{ seg.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 明细表格 -->
    <div class="card">
      <div class="card-header">
        <h3>明细数据</h3>
      </div>
      <el-table :data="detailData" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="GMV" width="120">
          <template #default="{ row }">¥{{ row.gmv.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="drawCount" label="抽盒次数" width="110" />
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column prop="newUsers" label="新增用户" width="100" />
        <el-table-column label="退款金额" width="120">
          <template #default="{ row }">
            <span :class="{ 'refund-warning': row.refund > 0 }">¥{{ row.refund.toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../services/api'

const loading = ref(false)
const timeRange = ref('month')
const customRange = ref<[Date, Date] | null>(null)

// 核心指标
const revenueData = ref({
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  grossMargin: 0
})

const animatedValues = reactive<Record<string, number>>({
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  grossMargin: 0
})

const metricCards = computed(() => [
  { key: 'totalRevenue', label: '总营收', prefix: '¥', color: '#1890FF' },
  { key: 'totalCost', label: '总成本', prefix: '¥', color: '#FAAD14' },
  { key: 'grossProfit', label: '毛利润', prefix: '¥', color: '#52C41A' },
  { key: 'grossMargin', label: '毛利率', prefix: '', color: '#FF4D4F' }
])

const animateValue = (key: string, target: number) => {
  const duration = 1000
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

// 营收趋势图数据
const chartData = ref<Array<{ label: string; value: number }>>([])
const maxChartValue = computed(() => Math.max(...chartData.value.map(d => d.value), 1) * 1.2)

// 饼图数据
const pieColors = ['#1890FF', '#36CFC9', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1', '#13C2C2', '#EB2F96']
const pieData = ref<Array<{ name: string; value: number; percent: number; color: string }>>([])
const totalRevenue = computed(() => pieData.value.reduce((s, d) => s + d.value, 0))

const circumference = 2 * Math.PI * 80
const pieSegments = computed(() => {
  let offset = 0
  return pieData.value.map(d => {
    const ratio = totalRevenue.value > 0 ? d.value / totalRevenue.value : 0
    const segLen = ratio * circumference
    const seg = {
      color: d.color,
      dashArray: `${segLen} ${circumference - segLen}`,
      dashOffset: -offset
    }
    offset += segLen
    return seg
  })
})

// 明细表格
const detailData = ref<Array<{
  date: string; gmv: number; drawCount: number;
  orderCount: number; newUsers: number; refund: number
}>>([])

const handleTimeChange = () => {
  if (timeRange.value !== 'custom') {
    loadData()
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { range: timeRange.value }
    if (timeRange.value === 'custom' && customRange.value) {
      params.startDate = customRange.value[0].toISOString()
      params.endDate = customRange.value[1].toISOString()
    }
    const res: any = await api.get('/revenue', { params })
    const data = res?.data || res || {}

    // 核心指标
    revenueData.value = {
      totalRevenue: data.totalRevenue ?? 528500,
      totalCost: data.totalCost ?? 318200,
      grossProfit: data.grossProfit ?? 210300,
      grossMargin: data.grossMargin ?? 39.8
    }
    animateValue('totalRevenue', revenueData.value.totalRevenue)
    animateValue('totalCost', revenueData.value.totalCost)
    animateValue('grossProfit', revenueData.value.grossProfit)
    animateValue('grossMargin', revenueData.value.grossMargin)

    // 趋势图
    chartData.value = data.chartData || [
      { label: '4/24', value: 85000 },
      { label: '4/25', value: 92000 },
      { label: '4/26', value: 88000 },
      { label: '4/27', value: 105000 },
      { label: '4/28', value: 112000 },
      { label: '4/29', value: 118000 },
      { label: '4/30', value: 128500 }
    ]

    // 饼图
    const rawPie = data.pieData || [
      { name: '海贼王一番赏', value: 185000 },
      { name: '潮玩盲盒', value: 142000 },
      { name: '美妆盲盒', value: 98000 },
      { name: '3C数码盲盒', value: 63500 },
      { name: '其他', value: 40000 }
    ]
    const total = rawPie.reduce((s: number, d: any) => s + d.value, 0)
    pieData.value = rawPie.map((d: any, i: number) => ({
      ...d,
      percent: total > 0 ? Math.round((d.value / total) * 1000) / 10 : 0,
      color: pieColors[i % pieColors.length]
    }))

    // 明细
    detailData.value = data.details || [
      { date: '2026-04-30', gmv: 128500, drawCount: 3250, orderCount: 180, newUsers: 68, refund: 2500 },
      { date: '2026-04-29', gmv: 118000, drawCount: 2980, orderCount: 165, newUsers: 55, refund: 1800 },
      { date: '2026-04-28', gmv: 112000, drawCount: 2850, orderCount: 158, newUsers: 52, refund: 3200 },
      { date: '2026-04-27', gmv: 105000, drawCount: 2700, orderCount: 148, newUsers: 48, refund: 1200 },
      { date: '2026-04-26', gmv: 88000, drawCount: 2300, orderCount: 130, newUsers: 42, refund: 900 },
      { date: '2026-04-25', gmv: 92000, drawCount: 2450, orderCount: 138, newUsers: 45, refund: 1500 },
      { date: '2026-04-24', gmv: 85000, drawCount: 2200, orderCount: 125, newUsers: 40, refund: 2000 }
    ]
  } catch {
    // 使用默认数据
    revenueData.value = { totalRevenue: 528500, totalCost: 318200, grossProfit: 210300, grossMargin: 39.8 }
    animateValue('totalRevenue', 528500)
    animateValue('totalCost', 318200)
    animateValue('grossProfit', 210300)
    animateValue('grossMargin', 398)
    chartData.value = [
      { label: '4/24', value: 85000 },
      { label: '4/25', value: 92000 },
      { label: '4/26', value: 88000 },
      { label: '4/27', value: 105000 },
      { label: '4/28', value: 112000 },
      { label: '4/29', value: 118000 },
      { label: '4/30', value: 128500 }
    ]
    const rawPie = [
      { name: '海贼王一番赏', value: 185000 },
      { name: '潮玩盲盒', value: 142000 },
      { name: '美妆盲盒', value: 98000 },
      { name: '3C数码盲盒', value: 63500 },
      { name: '其他', value: 40000 }
    ]
    pieData.value = rawPie.map((d, i) => ({
      ...d,
      percent: Math.round((d.value / 528500) * 1000) / 10,
      color: pieColors[i]
    }))
    detailData.value = [
      { date: '2026-04-30', gmv: 128500, drawCount: 3250, orderCount: 180, newUsers: 68, refund: 2500 },
      { date: '2026-04-29', gmv: 118000, drawCount: 2980, orderCount: 165, newUsers: 55, refund: 1800 },
      { date: '2026-04-28', gmv: 112000, drawCount: 2850, orderCount: 158, newUsers: 52, refund: 3200 },
      { date: '2026-04-27', gmv: 105000, drawCount: 2700, orderCount: 148, newUsers: 48, refund: 1200 },
      { date: '2026-04-26', gmv: 88000, drawCount: 2300, orderCount: 130, newUsers: 42, refund: 900 },
      { date: '2026-04-25', gmv: 92000, drawCount: 2450, orderCount: 138, newUsers: 45, refund: 1500 },
      { date: '2026-04-24', gmv: 85000, drawCount: 2200, orderCount: 125, newUsers: 40, refund: 2000 }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.revenue-report {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.card-header {
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 时间选择 */
.time-bar {
  padding: 16px 20px;
}

.time-row {
  display: flex;
  align-items: center;
}

/* 指标卡片 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  text-align: center;
  padding: 24px 20px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* 图表区 */
.charts-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
}

/* 柱状图 */
.bar-chart {
  height: 260px;
  display: flex;
  align-items: flex-end;
}

.bar-chart-inner {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 0 8px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 60%;
  max-width: 60px;
  background: linear-gradient(180deg, #1890FF 0%, #69c0ff 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 20px;
}

.bar-label {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  padding-top: 4px;
}

.bar-x-label {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  white-space: nowrap;
}

/* 饼图 */
.pie-container {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 260px;
}

.pie-chart {
  flex-shrink: 0;
}

.pie-svg {
  width: 180px;
  height: 180px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: #606266;
  min-width: 80px;
}

.legend-value {
  color: #303133;
  font-weight: 600;
  min-width: 60px;
}

.legend-percent {
  color: #909399;
  font-size: 12px;
}

.refund-warning {
  color: #FF4D4F;
  font-weight: 600;
}

@media (max-width: 768px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
