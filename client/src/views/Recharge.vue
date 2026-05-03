<template>
  <div class="recharge-page">
    <!-- 顶部 -->
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h2>充值中心</h2>
      <div></div>
    </div>

    <!-- 当前余额 -->
    <div class="balance-card">
      <span class="balance-label">当前盲盒币余额</span>
      <span class="balance-value">{{ userStore.coins }}</span>
    </div>

    <!-- 充值金额选择 -->
    <div class="recharge-section">
      <h3 class="section-title">选择充值金额</h3>
      <div class="amount-grid">
        <div
          v-for="item in presetAmounts"
          :key="item.amount"
          class="amount-card"
          :class="{ active: selectedAmount === item.amount, bonus: item.bonus > 0 }"
          @click="selectAmount(item.amount)"
        >
          <span class="amount-value">{{ item.amount }}</span>
          <span class="amount-unit">盲盒币</span>
          <span v-if="item.bonus > 0" class="amount-bonus">送{{ item.bonus }}</span>
        </div>
      </div>

      <!-- 自定义金额 -->
      <div class="custom-amount">
        <span class="custom-label">自定义金额</span>
        <div class="custom-input-wrapper">
          <span class="custom-prefix">¥</span>
          <input
            v-model.number="customAmount"
            type="number"
            placeholder="输入金额"
            min="1"
            @focus="selectedAmount = 0"
          />
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="pay-section">
      <h3 class="section-title">支付方式</h3>
      <div class="pay-methods">
        <div
          v-for="method in payMethods"
          :key="method.value"
          class="pay-method"
          :class="{ active: selectedPay === method.value }"
          @click="selectedPay = method.value"
        >
          <span class="pay-icon">{{ method.iconText }}</span>
          <span class="pay-name">{{ method.label }}</span>
          <el-icon v-if="selectedPay === method.value" class="check-icon"><CircleCheck /></el-icon>
        </div>
      </div>
    </div>

    <!-- 充值说明 -->
    <div class="notice-section">
      <h4>充值说明</h4>
      <ul>
        <li>盲盒币可用于抽盒、购买盲盒等消费</li>
        <li>盲盒币不可提现，不可转让</li>
        <li>充值后即时到账</li>
        <li>如有问题请联系客服</li>
      </ul>
    </div>

    <!-- 底部充值按钮 -->
    <div class="recharge-btn-wrapper safe-bottom">
      <button class="recharge-btn" @click="handleRecharge" :disabled="recharging || finalAmount <= 0">
        <span v-if="recharging" class="loading-spinner"></span>
        {{ recharging ? '充值中...' : `确认充值 ¥${finalAmount}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { rechargeAPI } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const selectedAmount = ref(0)
const customAmount = ref<number | undefined>(undefined)
const selectedPay = ref('wechat')
const recharging = ref(false)

// 预设金额
const presetAmounts = [
  { amount: 10, bonus: 0 },
  { amount: 30, bonus: 2 },
  { amount: 50, bonus: 5 },
  { amount: 100, bonus: 15 },
  { amount: 200, bonus: 40 },
  { amount: 500, bonus: 120 }
]

// 支付方式
const payMethods = [
  { label: '微信支付', value: 'wechat', iconText: 'W' },
  { label: '支付宝', value: 'alipay', iconText: 'A' },
  { label: '银行卡', value: 'bank', iconText: 'B' }
]

// 最终金额
const finalAmount = computed(() => {
  if (selectedAmount.value > 0) return selectedAmount.value
  if (customAmount.value && customAmount.value > 0) return customAmount.value
  return 0
})

const goBack = () => router.back()

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  customAmount.value = undefined
}

const handleRecharge = async () => {
  if (finalAmount.value <= 0) {
    ElMessage.warning('请选择或输入充值金额')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认充值 ${finalAmount.value} 盲盒币？`,
      '充值确认'
    )
  } catch {
    return
  }

  recharging.value = true
  try {
    await rechargeAPI.create({
      amount: finalAmount.value,
      payMethod: selectedPay.value
    })
    ElMessage.success('充值成功！')
    userStore.fetchUserInfo()
    router.back()
  } catch {} finally {
    recharging.value = false
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 90px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h2 {
  font-size: 17px;
  font-weight: 600;
}

.back-icon {
  font-size: 22px;
  cursor: pointer;
  color: var(--text-primary);
}

/* 余额 */
.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--primary-gradient);
  color: #FFFFFF;
}

.balance-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.balance-value {
  font-size: 36px;
  font-weight: 800;
}

/* 充值金额 */
.recharge-section {
  margin: 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--text-primary);
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.amount-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.amount-card:active {
  transform: scale(0.96);
}

.amount-card.active {
  border-color: var(--primary-pink);
  background: #FFF5F7;
}

.amount-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.amount-card.active .amount-value {
  color: var(--primary-pink);
}

.amount-unit {
  font-size: 11px;
  color: var(--text-light);
  margin-top: 2px;
}

.amount-bonus {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 2px 6px;
  background: var(--danger);
  color: #FFFFFF;
  font-size: 10px;
  border-radius: 8px;
  font-weight: 500;
}

/* 自定义金额 */
.custom-amount {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-label {
  font-size: 14px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.custom-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #F5F5F5;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.custom-input-wrapper:focus-within {
  border-color: var(--primary-pink);
  background: #FFFFFF;
}

.custom-prefix {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.custom-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
}

/* 支付方式 */
.pay-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-method.active {
  border-color: var(--primary-pink);
  background: #FFF5F7;
}

.pay-icon {
  font-size: 24px;
}

.pay-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.check-icon {
  color: var(--primary-pink);
  font-size: 20px;
}

/* 说明 */
.notice-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.notice-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.notice-section ul {
  list-style: none;
  padding: 0;
}

.notice-section li {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 2;
  padding-left: 14px;
  position: relative;
}

.notice-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-pink);
}

/* 充值按钮 */
.recharge-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  padding: 12px 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.recharge-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-gradient);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.recharge-btn:active {
  transform: scale(0.98);
}

.recharge-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
