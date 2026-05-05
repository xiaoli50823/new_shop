<template>
  <div class="points-mall-page">
    <div class="page-header">
      <div class="header-content">
        <h1>积分商城</h1>
        <div class="user-points">
          <span class="points-label">当前积分</span>
          <span class="points-value">{{ userPoints }}</span>
        </div>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="category-tab"
        :class="{ active: activeCategory === cat.value }"
        @click="activeCategory = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="productList.length === 0" class="empty-state">
      <div class="empty-icon">P</div>
      <h2>暂无商品</h2>
      <p>敬请期待更多好物</p>
    </div>

    <div v-else class="product-grid">
      <div
        v-for="product in productList"
        :key="product.id"
        class="product-card"
        @click="showExchangeDialog(product)"
      >
        <div class="product-image">
          <img :src="product.image || 'https://via.placeholder.com/200'" :alt="product.name" />
          <span v-if="product.stock <= 5 && product.stock > 0" class="stock-tip">仅剩{{ product.stock }}件</span>
          <span v-if="product.stock === 0" class="stock-tip sold-out">已售罄</span>
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-desc">{{ product.description || '精美礼品等你来兑' }}</p>
          <div class="product-footer">
            <span class="points-price">
              <i class="points-icon">P</i>
              {{ product.points_required }} 积分
            </span>
            <button class="exchange-btn" :disabled="product.stock === 0">
              {{ product.stock === 0 ? '已兑完' : '立即兑换' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="确认兑换" width="480px" class="exchange-dialog">
      <div v-if="selectedProduct" class="exchange-content">
        <div class="product-summary">
          <img :src="selectedProduct.image || 'https://via.placeholder.com/80'" :alt="selectedProduct.name" />
          <div class="summary-info">
            <h4>{{ selectedProduct.name }}</h4>
            <p>
              <i class="points-icon">P</i>
              {{ selectedProduct.points_required }} 积分 x {{ exchangeQuantity }}
            </p>
          </div>
        </div>

        <div class="exchange-form">
          <div class="form-item">
            <label>兑换数量</label>
            <div class="quantity-control">
              <button @click="exchangeQuantity > 1 && exchangeQuantity--" :disabled="exchangeQuantity <= 1">-</button>
              <span>{{ exchangeQuantity }}</span>
              <button @click="exchangeQuantity < selectedProduct.stock && exchangeQuantity < selectedProduct.exchange_limit && exchangeQuantity++" :disabled="exchangeQuantity >= selectedProduct.stock || exchangeQuantity >= selectedProduct.exchange_limit">+</button>
            </div>
          </div>

          <div class="points-summary">
            <span>消耗积分</span>
            <span class="total-points">
              <i class="points-icon">P</i>
              {{ selectedProduct.points_required * exchangeQuantity }}
            </span>
          </div>

          <div class="user-points-info">
            <span>当前积分</span>
            <span>{{ userPoints }} 积分</span>
          </div>

          <div class="form-item">
            <label>收货人</label>
            <el-input v-model="recipientName" placeholder="请输入收货人姓名" />
          </div>

          <div class="form-item">
            <label>联系电话</label>
            <el-input v-model="recipientPhone" placeholder="请输入联系电话" />
          </div>

          <div class="form-item">
            <label>收货地址</label>
            <el-input v-model="recipientAddress" type="textarea" placeholder="请输入收货地址" :rows="2" />
          </div>
        </div>
      </div>

      <template #footer>
        <button class="cancel-btn" @click="dialogVisible = false">取消</button>
        <button class="confirm-btn" @click="handleExchange" :disabled="userPoints < selectedProduct?.points_required * exchangeQuantity">
          确认兑换
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { pointsAPI, userProfileAPI } from '@/services/api'

const loading = ref(true)
const productList = ref<any[]>([])
const userPoints = ref(0)
const activeCategory = ref('')
const dialogVisible = ref(false)
const selectedProduct = ref<any>(null)
const exchangeQuantity = ref(1)
const recipientName = ref('')
const recipientPhone = ref('')
const recipientAddress = ref('')

const categories = [
  { label: '全部', value: '' },
  { label: '实物礼品', value: 'gift' },
  { label: '优惠券', value: 'coupon' },
  { label: '代金券', value: 'voucher' }
]

const fetchProducts = async () => {
  try {
    loading.value = true
    const params: any = {}
    if (activeCategory.value) params.category = activeCategory.value

    const res = await pointsAPI.getProducts(params)
    if (res.code === 200) {
      productList.value = res.data.list
    }
  } catch (err) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const fetchUserPoints = async () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const res = await userProfileAPI.getProfile()
      if (res.code === 200) {
        userPoints.value = res.data.user_info.points || 0
      }
    }
  } catch (err) {
    console.error('获取用户积分失败:', err)
  }
}

const showExchangeDialog = (product: any) => {
  if (product.stock === 0) {
    ElMessage.warning('该商品已售罄')
    return
  }
  selectedProduct.value = product
  exchangeQuantity.value = 1
  recipientName.value = ''
  recipientPhone.value = ''
  recipientAddress.value = ''
  dialogVisible.value = true
}

const handleExchange = async () => {
  if (!recipientName.value || !recipientPhone.value || !recipientAddress.value) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }

  try {
    const res = await pointsAPI.exchange({
      productId: selectedProduct.value.id,
      quantity: exchangeQuantity.value,
      recipientName: recipientName.value,
      recipientPhone: recipientPhone.value,
      recipientAddress: recipientAddress.value
    })

    if (res.code === 200) {
      ElMessage.success('兑换成功！')
      dialogVisible.value = false
      userPoints.value -= selectedProduct.value.points_required * exchangeQuantity.value
      fetchProducts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '兑换失败')
  }
}

onMounted(() => {
  fetchProducts()
  fetchUserPoints()
})
</script>

<style scoped>
.points-mall-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 40px;
}

.page-header {
  background: var(--ink);
  padding: 32px 24px;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 28px;
  margin: 0;
}

.user-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-label {
  font-size: 14px;
  opacity: 0.9;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
}

.category-tabs {
  max-width: 1200px;
  margin: 24px auto;
  display: flex;
  gap: 12px;
}

.category-tab {
  padding: 10px 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s ease;
}

.category-tab:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.category-tab.active {
  background: var(--ink);
  border-color: var(--ink);
  color: white;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #94a3b8;
}

.loading-state .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-icon {
  width: 60px; height: 60px;
  background: var(--ink-subtle);
  color: var(--ink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 20px;
  color: #1e293b;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
}

.product-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.25s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  background: #f8fafc;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-tip {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  border-radius: 12px;
}

.stock-tip.sold-out {
  background: #ef4444;
}

.product-info {
  padding: 16px;
}

.product-info h3 {
  font-size: 15px;
  color: #1e293b;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.points-icon {
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  background: var(--ink);
  color: #fff;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-right: 2px;
  vertical-align: middle;
}

.exchange-btn {
  padding: 8px 16px;
  background: var(--ink);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.exchange-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.exchange-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.exchange-content {
  padding: 0;
}

.product-summary {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.product-summary img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.summary-info h4 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 8px;
}

.summary-info p {
  font-size: 14px;
  color: var(--ink);
  font-weight: 600;
  margin: 0;
}

.exchange-form {
  padding: 0 16px 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: fit-content;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8fafc;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
}

.quantity-control button:hover:not(:disabled) {
  background: #e2e8f0;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control span {
  width: 50px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.points-summary,
.user-points-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.total-points {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.confirm-btn {
  background: var(--ink);
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
