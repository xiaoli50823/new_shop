<template>
  <div class="checkin-page">
    <div class="page-header">
      <h1>每日签到</h1>
      <div class="total-points">
        <span class="points-icon">P</span>
        <span>{{ totalPoints }} 积分</span>
      </div>
    </div>

    <div class="checkin-card">
      <div class="streak-info">
        <div class="streak-days">
          <span class="days-number">{{ checkInDays }}</span>
          <span class="days-label">连续签到</span>
        </div>
        <div class="today-reward">
          <span v-if="isCheckedIn">今日已签到</span>
          <span v-else>今日签到 +{{ todayReward }} 积分</span>
        </div>
      </div>

      <div class="reward-progress">
        <div
          v-for="day in 7"
          :key="day"
          class="reward-day"
          :class="{
            completed: checkInDays >= day,
            current: checkInDays + 1 === day && !isCheckedIn
          }"
        >
          <div class="day-circle">
            <span v-if="checkInDays >= day">✓</span>
            <span v-else>{{ day }}</span>
          </div>
          <span class="day-label">{{ day }}天</span>
          <span class="reward-amount">+{{ rewards[day] }}</span>
        </div>
      </div>

      <button
        class="checkin-btn"
        :class="{ disabled: isCheckedIn }"
        :disabled="isCheckedIn"
        @click="handleCheckIn"
      >
        {{ isCheckedIn ? '已签到' : '立即签到' }}
      </button>
    </div>

    <div class="calendar-section">
      <h2>签到日历</h2>
      <div class="calendar-grid">
        <div
          v-for="record in records"
          :key="record.date"
          class="calendar-day"
          :class="{ checked: record.isCheckedIn }"
        >
          <span class="day-date">{{ formatDate(record.date) }}</span>
          <span class="day-status">{{ record.isCheckedIn ? '✓' : '-' }}</span>
        </div>
      </div>
    </div>

    <div class="rules-section">
      <h2>签到规则</h2>
      <div class="rules-list">
        <p>1. 每日签到可获得积分奖励</p>
        <p>2. 连续签到7天可获得最高50积分</p>
        <p>3. 中断签到后，连续签到天数将重置</p>
        <p>4. 签到积分可用于积分商城兑换商品</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const isCheckedIn = ref(false)
const checkInDays = ref(0)
const todayReward = ref(10)
const totalPoints = ref(0)
const records = ref<any[]>([])

const rewards: Record<number, number> = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 40,
  7: 50
}

const fetchStatus = async () => {
  try {
    const res = await axios.get('/api/check-in/status', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.data.code === 200) {
      isCheckedIn.value = res.data.data.isCheckedIn
      checkInDays.value = res.data.data.checkInDays
      todayReward.value = res.data.data.todayReward
      totalPoints.value = res.data.data.totalPoints
    }
  } catch (err) {
    console.error('获取签到状态失败:', err)
  }
}

const fetchRecords = async () => {
  try {
    const res = await axios.get('/api/check-in/records', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.data.code === 200) {
      records.value = res.data.data.records
    }
  } catch (err) {
    console.error('获取签到记录失败:', err)
  }
}

const handleCheckIn = async () => {
  if (isCheckedIn.value) return

  try {
    const res = await axios.post('/api/check-in/check-in', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.data.code === 200) {
      isCheckedIn.value = true
      checkInDays.value = res.data.data.checkInDays
      totalPoints.value = res.data.data.totalPoints
      ElMessage.success(`签到成功！获得 ${res.data.data.reward} 积分`)
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '签到失败')
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  fetchStatus()
  fetchRecords()
})
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 40px;
}

.page-header {
  background: var(--ink);
  padding: 32px 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.total-points {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.points-icon {
  font-size: 24px;
}

.checkin-card {
  max-width: 600px;
  margin: -40px auto 24px;
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.streak-info {
  text-align: center;
  margin-bottom: 32px;
}

.streak-days {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.days-number {
  font-size: 64px;
  font-weight: 700;
  color: #10b981;
  line-height: 1;
}

.days-label {
  font-size: 16px;
  color: #64748b;
  margin-top: 8px;
}

.today-reward {
  margin-top: 16px;
  font-size: 18px;
  color: #f59e0b;
  font-weight: 600;
}

.reward-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 8px;
}

.reward-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.day-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.reward-day.completed .day-circle {
  background: #10b981;
  color: white;
}

.reward-day.current .day-circle {
  background: #f59e0b;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.day-label {
  font-size: 12px;
  color: #64748b;
}

.reward-amount {
  font-size: 11px;
  color: #10b981;
  font-weight: 600;
}

.checkin-btn {
  width: 100%;
  padding: 16px;
  background: var(--ink);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkin-btn:hover:not(.disabled) {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.checkin-btn.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.calendar-section,
.rules-section {
  max-width: 600px;
  margin: 0 auto 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.calendar-section h2,
.rules-section h2 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 4px;
  border-radius: 8px;
  background: #f8fafc;
}

.calendar-day.checked {
  background: #d1fae5;
}

.day-date {
  font-size: 12px;
  color: #64748b;
}

.day-status {
  font-size: 16px;
  font-weight: 600;
  color: #10b981;
  margin-top: 4px;
}

.rules-list p {
  font-size: 14px;
  color: #64748b;
  margin: 8px 0;
  line-height: 1.6;
}
</style>
