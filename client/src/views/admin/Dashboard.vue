<template>
  <div class="dashboard">
    <!-- 核心指标 -->
    <div class="metrics">
      <div class="metric-item">
        <div class="metric-header">
          <h3>今日GMV</h3>
          <span class="trend up">+12.5%</span>
        </div>
        <div class="metric-value">¥{{ metrics.gmv }}</div>
        <div class="metric-desc">较昨日增长12.5%</div>
      </div>
      <div class="metric-item">
        <div class="metric-header">
          <h3>抽盒次数</h3>
          <span class="trend up">+8.3%</span>
        </div>
        <div class="metric-value">{{ metrics.drawCount }}</div>
        <div class="metric-desc">较昨日增长8.3%</div>
      </div>
      <div class="metric-item">
        <div class="metric-header">
          <h3>新增用户</h3>
          <span class="trend up">+5.7%</span>
        </div>
        <div class="metric-value">{{ metrics.newUsers }}</div>
        <div class="metric-desc">较昨日增长5.7%</div>
      </div>
      <div class="metric-item">
        <div class="metric-header">
          <h3>活跃用户</h3>
          <span class="trend up">+3.2%</span>
        </div>
        <div class="metric-value">{{ metrics.activeUsers }}</div>
        <div class="metric-desc">较昨日增长3.2%</div>
      </div>
      <div class="metric-item">
        <div class="metric-header">
          <h3>消耗积分</h3>
          <span class="trend up">+15.8%</span>
        </div>
        <div class="metric-value">{{ metrics.pointsConsumed }}</div>
        <div class="metric-desc">较昨日增长15.8%</div>
      </div>
    </div>

    <!-- 转化漏斗 -->
    <div class="funnel-section">
      <h2 class="section-title">转化漏斗</h2>
      <div class="funnel-chart">
        <canvas ref="funnelCanvas"></canvas>
      </div>
    </div>

    <!-- 奖池监控 -->
    <div class="prize-monitor">
      <h2 class="section-title">奖池监控</h2>
      <div class="prize-table">
        <el-table :data="prizeData" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="盲盒名称"></el-table-column>
          <el-table-column prop="hiddenRate" label="隐藏款爆出率" width="150">
            <template #default="scope">
              <div class="rate-info">
                <span :class="scope.row.hiddenRate > scope.row.expectedRate ? 'rate-high' : 'rate-normal'">{{ scope.row.hiddenRate }}%</span>
                <span class="expected-rate">预期: {{ scope.row.expectedRate }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="riskLevel" label="风险等级" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.riskLevel === 'high' ? 'danger' : scope.row.riskLevel === 'medium' ? 'warning' : 'success'">
                {{ scope.row.riskLevel === 'high' ? '高' : scope.row.riskLevel === 'medium' ? '中' : '低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalDraws" label="总抽盒次数" width="120"></el-table-column>
          <el-table-column prop="hiddenCount" label="隐藏款产出" width="120"></el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewDetails(scope.row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 销售趋势 -->
    <div class="sales-trend">
      <h2 class="section-title">销售趋势</h2>
      <div class="trend-chart">
        <canvas ref="trendCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 核心指标数据
const metrics = ref({
  gmv: 128500,
  drawCount: 3250,
  newUsers: 458,
  activeUsers: 1250,
  pointsConsumed: 8500
})

// 奖池监控数据
const prizeData = ref([
  {
    id: 1,
    name: '海贼王一番赏',
    hiddenRate: 1.2,
    expectedRate: 1.0,
    riskLevel: 'medium',
    totalDraws: 1200,
    hiddenCount: 14
  },
  {
    id: 2,
    name: '火影忍者一番赏',
    hiddenRate: 0.8,
    expectedRate: 1.0,
    riskLevel: 'low',
    totalDraws: 850,
    hiddenCount: 7
  },
  {
    id: 3,
    name: '潮玩盲盒',
    hiddenRate: 2.5,
    expectedRate: 2.0,
    riskLevel: 'high',
    totalDraws: 1500,
    hiddenCount: 38
  },
  {
    id: 4,
    name: '美妆盲盒',
    hiddenRate: 1.5,
    expectedRate: 1.5,
    riskLevel: 'low',
    totalDraws: 980,
    hiddenCount: 15
  },
  {
    id: 5,
    name: '3C数码盲盒',
    hiddenRate: 0.5,
    expectedRate: 0.5,
    riskLevel: 'low',
    totalDraws: 750,
    hiddenCount: 4
  }
])

// 转化漏斗数据
const funnelData = ref({
  labels: ['访问', '详情', '支付', '复购'],
  data: [10000, 6000, 3000, 1500]
})

// 销售趋势数据
const trendData = ref({
  labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
  data: [85000, 92000, 88000, 105000, 112000, 118000, 128500]
})

// 漏斗图表
const funnelCanvas = ref<HTMLCanvasElement>()

// 趋势图表
const trendCanvas = ref<HTMLCanvasElement>()

// 查看详情
const viewDetails = (id: number) => {
  ElMessage.info(`查看盲盒ID: ${id}的详细信息`)
}

// 绘制漏斗图
const drawFunnelChart = () => {
  if (!funnelCanvas.value) return
  
  const ctx = funnelCanvas.value.getContext('2d')
  if (!ctx) return
  
  const width = funnelCanvas.value.width
  const height = funnelCanvas.value.height
  const data = funnelData.value.data
  const labels = funnelData.value.labels
  
  ctx.clearRect(0, 0, width, height)
  
  const maxValue = Math.max(...data)
  const segmentHeight = height / data.length
  
  data.forEach((value, index) => {
    const segmentWidth = (value / maxValue) * width
    const x = (width - segmentWidth) / 2
    const y = index * segmentHeight
    
    // 绘制矩形
    ctx.fillStyle = `rgba(64, 158, 255, ${0.8 - index * 0.15})`
    ctx.fillRect(x, y, segmentWidth, segmentHeight - 5)
    
    // 绘制标签
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${labels[index]}: ${value}`, width / 2, y + segmentHeight / 2 + 5)
  })
}

// 绘制趋势图
const drawTrendChart = () => {
  if (!trendCanvas.value) return
  
  const ctx = trendCanvas.value.getContext('2d')
  if (!ctx) return
  
  const width = trendCanvas.value.width
  const height = trendCanvas.value.height
  const data = trendData.value.data
  const labels = trendData.value.labels
  
  ctx.clearRect(0, 0, width, height)
  
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const valueRange = maxValue - minValue
  
  // 绘制坐标轴
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(50, 10)
  ctx.lineTo(50, height - 50)
  ctx.lineTo(width - 10, height - 50)
  ctx.stroke()
  
  // 绘制数据点和连线
  ctx.strokeStyle = '#409EFF'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = 50 + (width - 60) * (index / (data.length - 1))
    const y = height - 50 - ((value - minValue) / valueRange) * (height - 60)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    
    // 绘制数据点
    ctx.fillStyle = '#409EFF'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // 绘制标签
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(labels[index], x, height - 30)
    
    // 绘制数值
    ctx.fillText(`${value}`, x, y - 10)
  })
  
  ctx.stroke()
}

// 页面加载时绘制图表
onMounted(() => {
  // 设置画布尺寸
  if (funnelCanvas.value) {
    funnelCanvas.value.width = 800
    funnelCanvas.value.height = 400
    drawFunnelChart()
  }
  
  if (trendCanvas.value) {
    trendCanvas.value.width = 800
    trendCanvas.value.height = 400
    drawTrendChart()
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (funnelCanvas.value) {
      funnelCanvas.value.width = funnelCanvas.value.offsetWidth
      drawFunnelChart()
    }
    
    if (trendCanvas.value) {
      trendCanvas.value.width = trendCanvas.value.offsetWidth
      drawTrendChart()
    }
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.metric-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-header h3 {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.trend {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.trend.up {
  background-color: #f0f9eb;
  color: #67C23A;
}

.trend.down {
  background-color: #fef0f0;
  color: #F56C6C;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.metric-desc {
  font-size: 12px;
  color: #909399;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.funnel-section,
.prize-monitor,
.sales-trend {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.funnel-chart,
.trend-chart {
  width: 100%;
  height: 400px;
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rate-high {
  color: #F56C6C;
  font-weight: bold;
}

.rate-normal {
  color: #67C23A;
  font-weight: bold;
}

.expected-rate {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .metrics {
    grid-template-columns: 1fr;
  }
  
  .funnel-chart,
  .trend-chart {
    height: 300px;
  }
}
</style>