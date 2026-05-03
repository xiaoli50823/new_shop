<template>
  <div class="cart-page">
    <div class="cart-header">
      <h1>购物车</h1>
      <span v-if="cartList.length > 0" class="cart-count">共 {{ totalCount }} 件商品</span>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="cartList.length === 0" class="empty-state">
      <div class="empty-icon">Cart</div>
      <h2>购物车空空如也</h2>
      <p>快去挑选你喜欢的盲盒吧！</p>
      <button class="explore-btn" @click="goDiscover">去选购</button>
    </div>

    <div v-else class="cart-content">
      <div class="cart-list">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <img :src="item.blindBox.image" :alt="item.blindBox.name" class="item-image" />
          <div class="item-info">
            <h3>{{ item.blindBox.name }}</h3>
            <span class="item-price">¥{{ item.blindBox.price }}</span>
          </div>
          <div class="item-actions">
            <div class="quantity-control">
              <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item.id, item.quantity + 1)" :disabled="item.quantity >= item.blindBox.stock">+</button>
            </div>
            <span class="item-total">¥{{ (item.blindBox.price * item.quantity).toFixed(2) }}</span>
            <button class="delete-btn" @click="removeItem(item.id)">删除</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>商品总价</span>
          <span>¥{{ totalPrice }}</span>
        </div>
        <div class="summary-row">
          <span>优惠减免</span>
          <span class="discount">-¥{{ discount }}</span>
        </div>
        <div class="summary-row total">
          <span>实付金额</span>
          <span class="final-price">¥{{ finalPrice }}</span>
        </div>
        <button class="checkout-btn" @click="handleCheckout">
          立即结算
        </button>
        <button class="clear-btn" @click="clearCart">清空购物车</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()

const loading = ref(true)
const cartList = ref<any[]>([])
const discount = ref('0.00')

interface CartItem {
  id: number
  quantity: number
  blindBox: {
    id: number
    name: string
    price: number
    image: string
    stock: number
  }
}

const totalCount = computed(() => cartList.value.reduce((sum, item) => sum + item.quantity, 0))
const totalPrice = computed(() => cartList.value.reduce((sum, item) => sum + item.blindBox.price * item.quantity, 0).toFixed(2))
const finalPrice = computed(() => (parseFloat(totalPrice.value) - parseFloat(discount.value)).toFixed(2))

const fetchCart = async () => {
  try {
    loading.value = true
    const res = await axios.get('/api/cart', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.data.code === 200) {
      cartList.value = res.data.data.list
    }
  } catch (err: any) {
    if (err.response?.status === 401) {
      router.push('/login?redirect=/cart')
    } else {
      ElMessage.error('获取购物车失败')
    }
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (cartId: number, quantity: number) => {
  if (quantity < 1) return
  try {
    await axios.put(`/api/cart/${cartId}`, { quantity }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const item = cartList.value.find(i => i.id === cartId)
    if (item) item.quantity = quantity
  } catch (err) {
    ElMessage.error('更新数量失败')
  }
}

const removeItem = async (cartId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await axios.delete(`/api/cart/${cartId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    cartList.value = cartList.value.filter(i => i.id !== cartId)
    ElMessage.success('删除成功')
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await axios.delete('/api/cart', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    cartList.value = []
    ElMessage.success('清空成功')
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

const handleCheckout = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const selectedItems = cartList.value.filter(i => i.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  const total = selectedItems.reduce((sum: number, i: any) => {
    return sum + parseFloat(i.blindBox.price || i.blind_box?.price || 0) * (i.quantity || 1)
  }, 0)

  const items = selectedItems.map((i: any) => ({
    blind_box_id: i.blindBox?.id || i.blind_box?.id,
    name: i.blindBox?.name || i.blind_box?.name,
    image: i.blindBox?.image || i.blind_box?.image,
    price: parseFloat(i.blindBox?.price || i.blind_box?.price || 0),
    quantity: i.quantity || 1
  }))

  try {
    const res: any = await axios.post('/api/orders', {
      type: 'purchase',
      total,
      items
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.data?.code === 201 || res.data?.code === 200) {
      ElMessage.success('订单创建成功')
      const orderData = res.data.data || res.data
      router.push(`/order/${orderData.id}`)
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '创建订单失败')
  }
}

const goDiscover = () => {
  router.push('/discover')
}

onMounted(() => {
  fetchCart()
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.cart-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.cart-header h1 {
  font-size: 28px;
  color: #1e293b;
  margin: 0;
}

.cart-count {
  font-size: 14px;
  color: #64748b;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #94a3b8;
  gap: 12px;
}

.loading-state .el-icon {
  font-size: 32px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background: white;
  border-radius: 24px;
}

.empty-icon {
  font-size: 80px;
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
  margin: 0 0 24px;
}

.explore-btn {
  padding: 12px 32px;
  background: var(--ink);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.explore-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(58, 80, 104, 0.3);
}

.cart-content {
  display: flex;
  gap: 24px;
}

.cart-list {
  flex: 1;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 8px;
}

.item-price {
  font-size: 18px;
  color: #ef4444;
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8fafc;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
  transition: all 0.2s ease;
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
  color: #1e293b;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  min-width: 80px;
  text-align: right;
}

.delete-btn {
  padding: 8px 16px;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #fef2f2;
}

.cart-summary {
  width: 360px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.discount {
  color: #10b981;
}

.final-price {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: var(--ink);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.25s ease;
}

.checkout-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 90, 0, 0.3);
}

.clear-btn {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}

.clear-btn:hover {
  color: #ef4444;
}
</style>
