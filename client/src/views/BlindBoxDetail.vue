<template>
  <div class="detail-page" v-loading="loading">
    <!-- 顶部大图 -->
    <div class="detail-cover">
      <img :src="detail.coverImage || detail.image || '/placeholder.png'" :alt="detail.name" />
      <div class="cover-overlay">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </div>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="detail-info">
      <div class="info-header">
        <h1 class="detail-name">{{ detail.name }}</h1>
        <div class="detail-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ formatPrice(detail.price) }}</span>
          <span class="price-unit">/ 次</span>
        </div>
      </div>
      <p class="detail-desc">{{ detail.description || '快来试试手气吧！' }}</p>
      <div class="detail-tags">
        <span v-if="detail.tag" class="detail-tag">{{ detail.tagText || detail.tag }}</span>
        <span class="detail-tag type-tag">{{ typeLabel }}</span>
      </div>
      <div class="detail-stats">
        <span class="stat-item">
          <el-icon><ShoppingCart /></el-icon>
          已售 {{ formatCount(detail.sales || detail.total_draws || 0) }}
        </span>
        <span class="stat-item">
          <el-icon><Coin /></el-icon>
          库存 {{ detail.stock || 0 }}
        </span>
      </div>
    </div>

    <!-- 奖池展示 -->
    <div class="prize-pool-section">
      <div class="section-header">
        <h3>奖池展示</h3>
        <span class="prize-count">共 {{ prizePool.length }} 件</span>
      </div>
      <div class="prize-pool-scroll hide-scrollbar">
        <div
          v-for="prize in prizePool"
          :key="prize.id"
          class="prize-card"
          :class="getPrizeClass(prize.rarity)"
        >
          <div class="prize-img-wrap">
            <img :src="prize.image || '/placeholder.png'" :alt="prize.name" />
          </div>
          <div class="prize-rarity">{{ getRarityLabel(prize.rarity) }}</div>
          <p class="prize-name">{{ prize.name }}</p>
          <span class="prize-prob">概率 {{ prize.probability || 0 }}%</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar safe-bottom">
      <div v-if="allOutOfStock" class="sold-out-notice">奖品已全部售罄</div>
      <div v-else class="action-buttons">
        <button class="action-btn single" @click="handleDraw(1, 'single')" :disabled="drawing" :class="{ drawing: drawing && currentDrawType === 'single' }">
          <span class="btn-label">单抽</span>
          <span class="btn-price">¥{{ formatPrice(detail.price) }}</span>
        </button>
        <button class="action-btn multi5" @click="handleDraw(5, 'multi5')" :disabled="drawing" :class="{ drawing: drawing && currentDrawType === 'multi5' }">
          <span class="btn-label">五连抽</span>
          <span class="btn-desc">必得稀有</span>
          <span class="btn-price">¥{{ formatPrice(Math.floor(detail.price * 5 * 0.9 * 100) / 100) }}</span>
        </button>
        <button class="action-btn multi10" @click="handleDraw(10, 'multi10')" :disabled="drawing" :class="{ drawing: drawing && currentDrawType === 'multi10' }">
          <span class="btn-label">十连抽</span>
          <span class="btn-desc">双保底</span>
          <span class="btn-price">¥{{ formatPrice(Math.floor(detail.price * 10 * 0.85 * 100) / 100) }}</span>
        </button>
      </div>
    </div>

    <!-- 开盒动画遮罩 -->
    <transition name="box-fade">
      <div v-if="showBoxAnimation" class="box-animation-overlay" @click="skipToResult">
        <div class="box-animation-stage">
          <!-- 盲盒主体 -->
          <div class="mystery-box" :class="animationPhase">
            <div class="box-lid"></div>
            <div class="box-body">
              <div class="box-question">?</div>
            </div>
            <!-- 开盒闪光 -->
            <div v-if="animationPhase === 'opening'" class="opening-flash"></div>
          </div>
          <p class="box-animation-hint">{{ animationHint }}</p>
        </div>
        <!-- 彩带粒子（仅稀有款） -->
        <div v-if="hasRareResult" class="confetti-container">
          <div v-for="i in 40" :key="i" class="confetti-piece" :style="getConfettiStyle(i)"></div>
        </div>
      </div>
    </transition>

    <!-- 抽盒结果弹窗 -->
    <el-dialog
      v-model="showResult"
      :show-close="true"
      :width="drawResults.length > 1 ? '95%' : '85%'"
      class="result-dialog"
      :close-on-click-modal="true"
      @closed="onResultClosed"
    >
      <div class="result-content">
        <div class="result-glow" :class="{ 'rare-glow': hasRareResult }"></div>
        <div class="result-header">
          <h3>{{ drawResults.every(r => !r) ? '很遗憾' : '恭喜获得' }}</h3>
          <p v-if="drawResults.length > 1" class="result-count">
            共 {{ drawResults.length }} 次，命中 {{ drawResults.filter(r => !!r).length }} 件
          </p>
        </div>
        <div class="result-items" :class="{ 'multi-items': drawResults.length > 1 }">
          <div
            v-for="(item, index) in drawResults"
            :key="index"
            class="result-item"
            :class="{
              'revealed': showResultItems[index],
              'empty-item': !item,
              'rare-item': item && (item.rarity === 'rare' || item.rarity === 'super_rare'),
              'hidden-item': item && item.rarity === 'hidden'
            }"
          >
            <div class="result-card-inner">
              <div class="result-card-front">
                <div class="front-question">?</div>
              </div>
              <div v-if="item" class="result-card-back">
                <img :src="item.image || '/placeholder.png'" :alt="item.name" />
                <div class="result-rarity" :class="getPrizeClass(item.rarity)">
                  {{ getRarityLabel(item.rarity) }}
                </div>
                <p>{{ item.name }}</p>
              </div>
              <div v-else class="result-card-back empty-back">
                <div class="empty-icon">-</div>
                <p>未抽中</p>
              </div>
            </div>
          </div>
        </div>
        <div class="result-actions">
          <el-button round @click="showResult = false">继续抽盒</el-button>
          <el-button type="primary" round @click="goBoxCabinet">去盒柜查看</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ShoppingCart, Coin } from '@element-plus/icons-vue'
import { blindBoxAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { formatPrice, formatCount } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const drawing = ref(false)
const currentDrawType = ref('single')

// 开盒动画
const showBoxAnimation = ref(false)
const animationPhase = ref<'closed' | 'shaking' | 'opening' | 'opened'>('closed')
const animationHint = ref('')
const skipToResult = ref(false)

// 弹窗
const showResult = ref(false)
const drawResults = ref<any[]>([])
const showResultItems = ref<boolean[]>([])

const detail = ref<any>({})
const prizePool = ref<any[]>([])

const typeLabel = computed(() => {
  const map: Record<string, string> = { lottery: '一番赏', infinite: '无限盲盒', hash: '哈希盲盒' }
  return map[detail.value.type] || '盲盒'
})

const allOutOfStock = computed(() => {
  if (!prizePool.value.length) return false
  return prizePool.value.every((p: any) => (p.stock || 0) <= 0)
})

const hasRareResult = computed(() => {
  return drawResults.value.some(r => r && (r.rarity === 'rare' || r.rarity === 'super_rare' || r.rarity === 'hidden'))
})

const goBack = () => router.back()

const goBoxCabinet = () => {
  showResult.value = false
  router.push('/box-cabinet')
}

const getPrizeClass = (rarity: string) => {
  if (rarity === 'hidden' || rarity === 'legendary') return 'prize-hidden'
  if (rarity === 'rare' || rarity === 'super_rare' || rarity === 'epic') return 'prize-rare'
  return 'prize-common'
}

const getRarityLabel = (rarity: string) => {
  const map: Record<string, string> = {
    common: '普通', rare: '稀有', super_rare: '超稀有', epic: '史诗', hidden: '隐藏', legendary: '传说'
  }
  return map[rarity] || '普通'
}

const getConfettiStyle = (i: number) => {
  const colors = ['#ff6b9d', '#ffa940', '#52c41a', '#1890ff', '#722ed1', '#ffd700', '#13c2c2', '#f5222d']
  return {
    left: Math.random() * 100 + '%',
    backgroundColor: colors[i % colors.length],
    animationDelay: Math.random() * 2 + 's',
    animationDuration: (2 + Math.random() * 3) + 's',
    transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 1})`
  }
}

const runBoxAnimation = async () => {
  showBoxAnimation.value = true
  animationPhase.value = 'closed'

  await delay(300)
  animationPhase.value = 'shaking'
  animationHint.value = '摇晃盲盒中...'

  await delay(1200)
  animationPhase.value = 'opening'
  animationHint.value = '即将揭晓...'

  await delay(600)
  animationPhase.value = 'opened'
  animationHint.value = ''

  await delay(400)
  showBoxAnimation.value = false
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const handleDraw = async (count: number, type: string) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (drawing.value) return

  drawing.value = true
  currentDrawType.value = type
  drawResults.value = []

  try {
    const id = route.params.id as string
    const res = await blindBoxAPI.draw(id, { count, type })

    const data = res.data || res
    const results = data.results || data.items || data.prizes || data || []
    drawResults.value = Array.isArray(results) ? results : [results]

    // 开盒动画
    await runBoxAnimation()

    // 显示结果
    showResultItems.value = drawResults.value.map(() => false)
    showResult.value = true

    // 逐个翻转展示
    drawResults.value.forEach((_, index) => {
      setTimeout(() => {
        showResultItems.value[index] = true
      }, index * (count === 1 ? 200 : count <= 5 ? 250 : 180))
    })

    // 刷新用户信息
    userStore.fetchUserInfo()
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || '抽盒失败'
    ElMessage.error(msg)
  } finally {
    drawing.value = false
  }
}

const onResultClosed = () => {
  showResultItems.value = []
  drawResults.value = []
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await blindBoxAPI.getById(id)
    const data = res.data || res
    detail.value = {
      ...data,
      coverImage: data.cover_image || data.coverImage || data.image,
      sales: data.sales || data.total_draws || data.totalDraws
    }
    prizePool.value = data.prizes || data.pool || []
  } catch {
    detail.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--beige);
  padding-bottom: 90px;
}

/* 封面图 */
.detail-cover {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.back-btn:hover {
  transform: scale(1.1);
}

.back-btn .el-icon {
  font-size: 20px;
  color: var(--text-primary);
}

/* 商品信息 */
.detail-info {
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  padding: 20px 16px;
  position: relative;
  z-index: 1;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  margin-right: 12px;
}

.detail-price {
  display: flex;
  align-items: baseline;
  color: #e74c3c;
  flex-shrink: 0;
}

.price-symbol { font-size: 14px; font-weight: 600; }

.price-value { font-size: 24px; font-weight: 800; }

.price-unit {
  font-size: 12px;
  color: var(--text-light);
  margin-left: 2px;
}

.detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.detail-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-tag {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: var(--ink-subtle);
  color: var(--ink);
}

.type-tag {
  background: #f0f0f0;
  color: var(--text-secondary);
}

.detail-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-light);
}

.stat-item .el-icon { font-size: 14px; }

/* 奖池展示 */
.prize-pool-section {
  background: #FFFFFF;
  margin-top: 10px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3 { font-size: 16px; font-weight: 600; }

.prize-count { font-size: 12px; color: var(--text-light); }

.prize-pool-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.prize-card {
  flex-shrink: 0;
  width: 105px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}

.prize-card:hover {
  transform: translateY(-4px);
}

.prize-img-wrap {
  width: 100%;
  height: 100px;
  overflow: hidden;
  background: var(--beige);
}

.prize-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prize-rarity {
  text-align: center;
  font-size: 10px;
  padding: 3px 0;
  font-weight: 600;
}

.prize-common {
  border-color: #e8e8e8;
}

.prize-common .prize-rarity { color: #999; background: #f5f5f5; }

.prize-rare {
  border-color: #667eea;
}

.prize-rare .prize-rarity { color: #667eea; background: #e8ecff; }

.prize-hidden {
  border-color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.prize-hidden .prize-rarity { color: #b8860b; background: #fff8e1; }

.prize-name {
  font-size: 11px;
  padding: 6px 8px 2px;
  text-align: center;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prize-prob {
  display: block;
  text-align: center;
  font-size: 10px;
  color: var(--text-light);
  padding-bottom: 6px;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  background: #FFFFFF;
  padding: 10px 16px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 99;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.drawing {
  animation: btn-pulse 0.8s infinite;
}

.single { background: #3a5068; color: #FFFFFF; }

.multi5 {
  background: linear-gradient(135deg, #5b7da8 0%, #3a5068 100%);
  color: #FFFFFF;
}

.multi10 {
  background: linear-gradient(135deg, #7b5ea7 0%, #4a3670 100%);
  color: #FFFFFF;
}

.btn-label { font-size: 14px; font-weight: 600; }

.btn-desc { font-size: 10px; opacity: 0.85; }

.btn-price { font-size: 16px; font-weight: 800; }

@keyframes btn-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 售罄提示 */
.sold-out-notice {
  text-align: center;
  padding: 14px 0;
  color: var(--text-light);
  font-size: 15px;
  font-weight: 500;
}

/* ==================== 开盒动画遮罩 ==================== */
.box-animation-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.box-fade-enter-active { transition: opacity 0.3s; }
.box-fade-leave-active { transition: opacity 0.5s; }
.box-fade-enter-from, .box-fade-leave-to { opacity: 0; }

.box-animation-stage {
  text-align: center;
}

.mystery-box {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.box-lid {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 50px;
  background: linear-gradient(135deg, #d4943a 0%, #b8731f 100%);
  border-radius: 12px 12px 4px 4px;
  z-index: 3;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.box-body {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 120px;
  background: linear-gradient(135deg, #e8a84c 0%, #c88430 100%);
  border-radius: 4px 4px 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.box-question {
  font-size: 56px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.opening-flash {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  animation: flash-burst 0.6s ease-out forwards;
  z-index: 10;
  pointer-events: none;
}

@keyframes flash-burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
}

/* 摇晃阶段 */
.mystery-box.shaking {
  animation: box-shake 0.3s ease-in-out 4;
}

.mystery-box.shaking .box-lid {
  animation: lid-rattle 0.15s ease-in-out 8;
}

@keyframes box-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-8px) rotate(-3deg); }
  75% { transform: translateX(8px) rotate(3deg); }
}

@keyframes lid-rattle {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

/* 开盒阶段 */
.mystery-box.opening .box-lid {
  transform: translateX(-50%) translateY(-80px) rotate(-15deg);
  opacity: 0;
}

/* 开盒完成阶段 */
.mystery-box.opened .box-body {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
}

.box-animation-hint {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
  margin-top: 24px;
  text-align: center;
}

/* ==================== 彩带粒子 ==================== */
.confetti-container {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    top: -20px;
    opacity: 1;
    transform: rotate(0) translateX(0);
  }
  100% {
    top: 110vh;
    opacity: 0;
    transform: rotate(720deg) translateX(80px);
  }
}

/* ==================== 结果弹窗 ==================== */
.result-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #fdf8f0 0%, #ffffff 100%);
}

.result-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 12px 20px 0;
  border-bottom: none;
}

.result-content {
  text-align: center;
  position: relative;
}

.result-glow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 150px;
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.result-glow.rare-glow {
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.2) 0%, rgba(255, 150, 50, 0.08) 40%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.result-header {
  padding: 8px 0 12px;
}

.result-header h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.result-count {
  font-size: 13px;
  color: var(--text-light);
}

.result-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.result-items.multi-items {
  gap: 8px;
}

.result-item {
  width: 100px;
  perspective: 800px;
}

.result-items.multi-items .result-item {
  width: 78px;
}

.result-card-inner {
  position: relative;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
}

.result-item.revealed .result-card-inner {
  transform: rotateY(180deg);
}

.result-card-front,
.result-card-back {
  width: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.result-card-front {
  aspect-ratio: 1;
  background: linear-gradient(135deg, #3a5068 0%, #2a3a50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0; left: 0;
}

.front-question {
  font-size: 36px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
}

.result-card-back {
  background: #FFFFFF;
  transform: rotateY(180deg);
}

.result-card-back img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.result-rarity {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin: 6px 0 2px;
}

.result-card-back p {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 0 6px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 稀有款卡片特效 */
.result-item.rare-item .result-card-back {
  box-shadow: 0 0 12px rgba(102, 126, 234, 0.3);
  border: 2px solid #667eea;
}

.result-item.hidden-item .result-card-back {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  border: 2px solid #ffd700;
  animation: hidden-shine 2s ease-in-out infinite;
}

@keyframes hidden-shine {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 35px rgba(255, 215, 0, 0.7); }
}

/* 抽空卡片 */
.result-item.empty-item .result-card-back {
  background: #f5f5f5;
  border: 2px dashed #d0d0d0;
  box-shadow: none;
}

.empty-back {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.empty-icon {
  font-size: 28px;
  color: #ccc;
  font-weight: 300;
  margin-bottom: 4px;
}

.empty-back p {
  font-size: 12px;
  color: #bbb;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-bottom: 4px;
}

.result-actions .el-button {
  min-width: 120px;
  border-radius: 20px;
}

@media (max-width: 500px) {
  .result-item { width: 85px; }
  .result-items.multi-items .result-item { width: 65px; }
}
</style>
