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
      <div class="detail-stats">
        <span class="stat-item">
          <el-icon><ShoppingCart /></el-icon>
          已售 {{ formatCount(detail.sales || 0) }}
        </span>
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          收藏 {{ formatCount(detail.favorites || 0) }}
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
          <img :src="prize.image || '/placeholder.png'" :alt="prize.name" />
          <div class="prize-rarity">{{ getRarityLabel(prize.rarity) }}</div>
          <p class="prize-name">{{ prize.name }}</p>
        </div>
      </div>
    </div>

    <!-- 道具区 -->
    <div class="props-section" v-if="propsList.length > 0">
      <div class="section-header">
        <h3>道具</h3>
      </div>
      <div class="props-list">
        <div v-for="prop in propsList" :key="prop.id" class="prop-item">
          <div class="prop-icon">{{ prop.icon }}</div>
          <div class="prop-info">
            <span class="prop-name">{{ prop.name }}</span>
            <span class="prop-count">剩余 {{ prop.count }} 张</span>
          </div>
          <el-button size="small" round @click="useProp(prop)" :disabled="prop.count <= 0">
            使用
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar safe-bottom">
      <div class="action-buttons">
        <button class="action-btn single" @click="handleDraw(1, 'single')" :disabled="drawing">
          <span class="btn-label">单抽</span>
          <span class="btn-price">¥{{ formatPrice(detail.price) }}</span>
        </button>
        <button class="action-btn multi5" @click="handleDraw(5, 'multi5')" :disabled="drawing">
          <span class="btn-label">五连抽</span>
          <span class="btn-desc">必得稀有</span>
          <span class="btn-price">¥{{ formatPrice(detail.price * 5 * 0.9) }}</span>
        </button>
        <button class="action-btn multi10" @click="handleDraw(10, 'multi10')" :disabled="drawing">
          <span class="btn-label">十连抽</span>
          <span class="btn-price">¥{{ formatPrice(detail.price * 10 * 0.85) }}</span>
        </button>
      </div>
    </div>

    <!-- 抽盒结果弹窗 -->
    <el-dialog
      v-model="showResult"
      :show-close="false"
      width="90%"
      class="result-dialog"
      :close-on-click-modal="false"
    >
      <div class="result-content">
        <div class="result-header">
          <h3>🎉 恭喜获得</h3>
        </div>
        <div class="result-items">
          <div
            v-for="(item, index) in drawResults"
            :key="index"
            class="result-item"
            :class="{ 'show': showResultItems[index] }"
          >
            <img :src="item.image || '/placeholder.png'" :alt="item.name" />
            <div class="result-rarity" :class="getPrizeClass(item.rarity)">
              {{ getRarityLabel(item.rarity) }}
            </div>
            <p>{{ item.name }}</p>
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
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ShoppingCart, Star } from '@element-plus/icons-vue'
import { blindBoxAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { formatPrice, formatCount } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const drawing = ref(false)
const showResult = ref(false)
const drawResults = ref<any[]>([])
const showResultItems = ref<boolean[]>([])

const detail = ref<any>({})
const prizePool = ref<any[]>([])
const propsList = ref<any[]>([])

const goBack = () => {
  router.back()
}

const goBoxCabinet = () => {
  showResult.value = false
  router.push('/box-cabinet')
}

const getPrizeClass = (rarity: string) => {
  if (rarity === 'hidden' || rarity === 'legendary') return 'prize-legendary'
  if (rarity === 'rare' || rarity === 'epic') return 'prize-rare'
  return 'prize-common'
}

const getRarityLabel = (rarity: string) => {
  const map: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    hidden: '隐藏',
    legendary: '传说'
  }
  return map[rarity] || '普通'
}

const useProp = (prop: any) => {
  if (prop.count <= 0) {
    ElMessage.warning('道具数量不足')
    return
  }
  ElMessage.success(`使用了${prop.name}`)
  prop.count--
}

const handleDraw = async (count: number, type: string) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  drawing.value = true
  try {
    const id = route.params.id as string
    const res = await blindBoxAPI.draw(id, { count, type })
    const results = res.data?.items || res.data?.prizes || res.data || []
    drawResults.value = Array.isArray(results) ? results : [results]
    showResultItems.value = drawResults.value.map(() => false)
    showResult.value = true

    // 逐个展示结果（动画效果）
    drawResults.value.forEach((_, index) => {
      setTimeout(() => {
        showResultItems.value[index] = true
      }, (index + 1) * 300)
    })

    // 刷新用户信息
    userStore.fetchUserInfo()
  } catch {
    // Error handled by interceptor
  } finally {
    drawing.value = false
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await blindBoxAPI.getById(id)
    const data = res.data || res
    detail.value = { ...data, coverImage: data.cover_image || data.coverImage || data.image }
    prizePool.value = data.prizes || data.items || data.pool || []
    propsList.value = data.props || data.tools || []
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
  background: var(--bg-pink);
  padding-bottom: 80px;
}

/* 封面图 */
.detail-cover {
  position: relative;
  width: 100%;
  height: 300px;
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
  display: flex;
  justify-content: space-between;
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
  color: var(--danger);
  flex-shrink: 0;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
}

.price-value {
  font-size: 24px;
  font-weight: 800;
}

.price-unit {
  font-size: 12px;
  color: var(--text-light);
  margin-left: 2px;
}

.detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
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

.stat-item .el-icon {
  font-size: 14px;
}

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

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.prize-count {
  font-size: 12px;
  color: var(--text-light);
}

.prize-pool-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.prize-card {
  flex-shrink: 0;
  width: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
}

.prize-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.prize-rarity {
  text-align: center;
  font-size: 10px;
  padding: 4px 0;
  font-weight: 600;
}

.prize-common .prize-rarity {
  color: #999;
  background: #F5F5F5;
}

.prize-rare .prize-rarity {
  color: #667eea;
  background: #E8ECFF;
}

.prize-legendary .prize-rarity {
  color: #FFD700;
  background: #FFF8E1;
}

.prize-name {
  font-size: 11px;
  padding: 6px 8px;
  text-align: center;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 道具区 */
.props-section {
  background: #FFFFFF;
  margin-top: 10px;
  padding: 16px;
}

.props-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #FFF5F7;
  border-radius: 12px;
}

.prop-icon {
  font-size: 28px;
}

.prop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.prop-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.prop-count {
  font-size: 12px;
  color: var(--text-light);
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
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
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
  transition: all 0.2s;
  font-family: inherit;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.single {
  background: var(--ink);
  color: #FFFFFF;
}

.multi5 {
  background: var(--ink);
  color: #FFFFFF;
}

.multi10 {
  background: var(--charcoal);
  color: #FFFFFF;
}

.btn-label {
  font-size: 14px;
  font-weight: 600;
}

.btn-desc {
  font-size: 10px;
  opacity: 0.85;
}

.btn-price {
  font-size: 16px;
  font-weight: 800;
}

/* 抽盒结果弹窗 */
.result-dialog :deep(.el-dialog) {
  border-radius: var(--radius-card);
  overflow: hidden;
}

.result-content {
  text-align: center;
}

.result-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-pink);
  margin-bottom: 16px;
}

.result-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.result-item {
  width: 100px;
  opacity: 0;
  transform: scale(0.5) rotateY(180deg);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-item.show {
  opacity: 1;
  transform: scale(1) rotateY(0);
}

.result-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 6px;
}

.result-rarity {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 4px;
}

.result-item p {
  font-size: 12px;
  color: var(--text-secondary);
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.result-actions .el-button {
  min-width: 120px;
  border-radius: var(--radius-btn);
}
</style>
