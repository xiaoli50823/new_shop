<template>
  <div class="box-cabinet">
    <h1 class="page-title">我的盒柜</h1>
    
    <!-- 状态切换 -->
    <div class="status-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待发货" name="pending"></el-tab-pane>
        <el-tab-pane label="已发货" name="shipped"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 待发货商品 -->
    <div v-if="activeTab === 'pending'" class="product-list">
      <div v-for="(product, index) in pendingProducts" :key="product.id" class="product-item">
        <img :src="product.image" :alt="product.name" class="product-img">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="rarity" :class="product.rarity">
            {{ product.rarity === 'common' ? '普通款' : product.rarity === 'rare' ? '稀有款' : '隐藏款' }}
          </p>
          <p class="draw-time">抽中时间: {{ product.drawTime }}</p>
        </div>
        <div class="product-actions">
          <el-checkbox v-model="selectedProducts[product.id]"></el-checkbox>
          <el-button type="danger" size="small" @click="recycleProduct(product.id)">回收</el-button>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div class="batch-actions" v-if="pendingProducts.length > 0">
        <div class="select-all">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="batchShip">批量发货</el-button>
          <el-button type="danger" @click="batchRecycle">批量回收</el-button>
        </div>
      </div>
    </div>

    <!-- 已发货商品 -->
    <div v-else class="product-list">
      <div v-for="(product, index) in shippedProducts" :key="product.id" class="product-item">
        <img :src="product.image" :alt="product.name" class="product-img">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="rarity" :class="product.rarity">
            {{ product.rarity === 'common' ? '普通款' : product.rarity === 'rare' ? '稀有款' : '隐藏款' }}
          </p>
          <p class="draw-time">抽中时间: {{ product.drawTime }}</p>
          <p class="ship-time">发货时间: {{ product.shipTime }}</p>
          <p class="tracking-number">物流单号: {{ product.trackingNumber }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="(activeTab === 'pending' && pendingProducts.length === 0) || (activeTab === 'shipped' && shippedProducts.length === 0)" class="empty-state">
      <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20box%20cabinet%20illustration&image_size=square" alt="空盒柜">
      <p>{{ activeTab === 'pending' ? '暂无待发货商品' : '暂无已发货商品' }}</p>
      <el-button type="primary" @click="goToHome">去抽盒</el-button>
    </div>

    <!-- 回收确认弹窗 -->
    <el-dialog
      v-model="showRecycleDialog"
      title="确认回收"
      width="500px"
    >
      <p>您确定要回收选中的商品吗？</p>
      <p class="recycle-info">回收将获得原价80%的盲盒币，用于继续抽盒。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRecycleDialog = false">取消</el-button>
          <el-button type="danger" @click="confirmRecycle">确认回收</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货确认弹窗 -->
    <el-dialog
      v-model="showShipDialog"
      title="确认发货"
      width="500px"
    >
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="收货地址">
          <el-input v-model="shipForm.address" placeholder="请输入收货地址"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="shipForm.contact" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="shipForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮费">
          <p class="postage">¥{{ postage }}</p>
          <p class="postage-info">满3件包邮</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showShipDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 状态切换
const activeTab = ref('pending')

// 待发货商品
const pendingProducts = ref([
  {
    id: 1,
    name: '路飞手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=monkey%20d%20luffy%20figure&image_size=square',
    rarity: 'hidden',
    drawTime: '2026-04-17 10:30:00'
  },
  {
    id: 2,
    name: '索隆手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roronoa%20zoro%20figure&image_size=square',
    rarity: 'rare',
    drawTime: '2026-04-17 09:15:00'
  },
  {
    id: 3,
    name: '乔巴手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chopper%20figure&image_size=square',
    rarity: 'common',
    drawTime: '2026-04-16 18:45:00'
  }
])

// 已发货商品
const shippedProducts = ref([
  {
    id: 4,
    name: '娜美手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nami%20figure&image_size=square',
    rarity: 'rare',
    drawTime: '2026-04-15 14:20:00',
    shipTime: '2026-04-16 10:00:00',
    trackingNumber: 'SF1234567890'
  }
])

// 选中的商品
const selectedProducts = ref<Record<number, boolean>>({})

// 全选
const selectAll = ref(false)

// 计算选中的商品数量
const selectedCount = computed(() => {
  return Object.values(selectedProducts.value).filter(Boolean).length
})

// 计算邮费
const postage = computed(() => {
  const count = selectedCount.value
  return count >= 3 ? 0 : 10
})

// 全选处理
const handleSelectAll = (val: boolean) => {
  pendingProducts.value.forEach(product => {
    selectedProducts.value[product.id] = val
  })
}

// 单个商品回收
const recycleProduct = (id: number) => {
  // 模拟回收逻辑
  const product = pendingProducts.value.find(p => p.id === id)
  if (product) {
    // 计算回收获得的盲盒币（假设原价50元）
    const blindBoxCoin = 50 * 0.8
    ElMessage.success(`回收成功，获得${blindBoxCoin}盲盒币！`)
    // 从待发货列表中移除
    pendingProducts.value = pendingProducts.value.filter(p => p.id !== id)
  }
}

// 批量回收
const showRecycleDialog = ref(false)

const batchRecycle = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要回收的商品！')
    return
  }
  showRecycleDialog.value = true
}

// 确认回收
const confirmRecycle = () => {
  // 模拟批量回收逻辑
  const selectedIds = Object.entries(selectedProducts.value)
    .filter(([_, selected]) => selected)
    .map(([id]) => parseInt(id))
  
  // 计算回收获得的盲盒币
  const blindBoxCoin = selectedIds.length * 50 * 0.8
  ElMessage.success(`批量回收成功，获得${blindBoxCoin}盲盒币！`)
  
  // 从待发货列表中移除
  pendingProducts.value = pendingProducts.value.filter(p => !selectedIds.includes(p.id))
  
  // 清空选中状态
  selectedProducts.value = {}
  selectAll.value = false
  
  showRecycleDialog.value = false
}

// 批量发货
const showShipDialog = ref(false)
const shipForm = ref({
  address: '',
  contact: '',
  phone: ''
})

const batchShip = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要发货的商品！')
    return
  }
  showShipDialog.value = true
}

// 确认发货
const confirmShip = () => {
  // 模拟发货逻辑
  if (!shipForm.value.address || !shipForm.value.contact || !shipForm.value.phone) {
    ElMessage.error('请填写完整的收货信息！')
    return
  }
  
  const selectedIds = Object.entries(selectedProducts.value)
    .filter(([_, selected]) => selected)
    .map(([id]) => parseInt(id))
  
  // 将选中的商品移到已发货列表
  const shippedItems = pendingProducts.value.filter(p => selectedIds.includes(p.id))
  shippedItems.forEach(item => {
    shippedProducts.value.push({
      ...item,
      shipTime: new Date().toLocaleString(),
      trackingNumber: `SF${Math.floor(Math.random() * 10000000000)}`
    })
  })
  
  // 从待发货列表中移除
  pendingProducts.value = pendingProducts.value.filter(p => !selectedIds.includes(p.id))
  
  // 清空选中状态
  selectedProducts.value = {}
  selectAll.value = false
  
  // 重置发货表单
  shipForm.value = {
    address: '',
    contact: '',
    phone: ''
  }
  
  ElMessage.success('发货成功！')
  showShipDialog.value = false
}

// 去首页抽盒
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.box-cabinet {
  padding: 20px;
  background-color: white;
  min-height: 100vh;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.status-tabs {
  margin-bottom: 20px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.product-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 5px;
}

.rarity {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 5px;
  display: inline-block;
}

.rarity.common {
  background-color: #E6A23C;
  color: white;
}

.rarity.rare {
  background-color: #409EFF;
  color: white;
}

.rarity.hidden {
  background-color: #909399;
  color: white;
}

.draw-time,
.ship-time,
.tracking-number {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.product-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.select-all {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state img {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 16px;
  color: #909399;
  margin-bottom: 20px;
}

.recycle-info {
  color: #666;
  margin-top: 10px;
}

.postage {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
  margin: 0;
}

.postage-info {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-img {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .product-actions {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
  
  .batch-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>