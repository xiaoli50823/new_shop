<template>
  <div class="cabinet-page">
    <!-- 顶部统计 -->
    <div class="cabinet-header">
      <h2>📦 我的盒柜</h2>
      <span class="total-count">共 {{ totalCount }} 件商品</span>
    </div>

    <!-- Tab 切换 -->
    <div class="cabinet-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-count">({{ tab.count }})</span>
      </div>
    </div>

    <!-- 商品列表 -->
    <div v-loading="loading" class="cabinet-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="cabinet-item"
      >
        <div class="item-checkbox" v-if="activeTab === 'pending'">
          <el-checkbox v-model="item.selected" @change="updateSelection" />
        </div>
        <div class="item-cover">
          <img :src="item.image || item.coverImage || '/placeholder.png'" :alt="item.name" />
        </div>
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <div class="item-meta">
            <span class="rarity-tag" :class="getRarityClass(item.rarity)">
              {{ getRarityLabel(item.rarity) }}
            </span>
            <span class="item-time">{{ formatDate(item.drawTime || item.createdAt, 'MM-DD HH:mm') }}</span>
          </div>
          <!-- 待发货 -->
          <div v-if="activeTab === 'pending'" class="item-actions">
            <el-button size="small" round @click="recycleSingle(item)">回收</el-button>
            <el-button size="small" type="primary" round @click="shipSingle(item)">发货</el-button>
          </div>
          <!-- 已发货 -->
          <div v-if="activeTab === 'shipped'" class="item-shipping">
            <span class="shipping-label">物流单号：</span>
            <span class="shipping-no">{{ item.trackingNo || '暂无' }}</span>
          </div>
          <!-- 已回收 -->
          <div v-if="activeTab === 'recycled'" class="item-recycled">
            <span class="recycled-coins">+{{ item.recyclePrice || item.price }} 盲盒币</span>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && list.length === 0" :description="emptyText" />
    </div>

    <!-- 底部批量操作栏 -->
    <div v-if="activeTab === 'pending' && list.length > 0" class="batch-bar safe-bottom">
      <div class="batch-left">
        <el-checkbox v-model="allSelected" @change="toggleAll">全选</el-checkbox>
        <span class="selected-count" v-if="selectedCount > 0">已选 {{ selectedCount }} 件</span>
      </div>
      <div class="batch-right">
        <el-button round @click="batchRecycle" :disabled="selectedCount === 0">批量回收</el-button>
        <el-button type="primary" round @click="batchShip" :disabled="selectedCount === 0">批量发货</el-button>
      </div>
    </div>

    <!-- 发货弹窗 -->
    <el-dialog v-model="showShipDialog" title="选择收货地址" width="90%">
      <div class="ship-content">
        <div v-if="addresses.length === 0" class="no-address">
          <p>暂无收货地址</p>
          <el-button type="primary" round size="small" @click="goAddress">去添加地址</el-button>
        </div>
        <div v-else class="address-list">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="address-item"
            :class="{ selected: selectedAddressId === addr.id }"
            @click="selectedAddressId = addr.id"
          >
            <div class="address-info">
              <div class="address-user">
                <span class="address-name">{{ addr.name }}</span>
                <span class="address-phone">{{ formatPhone(addr.phone) }}</span>
              </div>
              <p class="address-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</p>
            </div>
            <el-icon v-if="selectedAddressId === addr.id" class="check-icon"><CircleCheck /></el-icon>
          </div>
        </div>
        <div class="shipping-info" v-if="selectedAddressId">
          <p>邮费：{{ shipItems.length >= 3 ? '满3件包邮 🎉' : '¥10.00' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showShipDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :disabled="!selectedAddressId">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 回收确认弹窗 -->
    <el-dialog v-model="showRecycleDialog" title="确认回收" width="85%">
      <div class="recycle-content">
        <p class="recycle-tip">回收后将获得盲盒币（原价的80%）</p>
        <div class="recycle-items">
          <div v-for="item in recycleItems" :key="item.id" class="recycle-item">
            <img :src="item.image || '/placeholder.png'" :alt="item.name" />
            <span class="recycle-name">{{ item.name }}</span>
            <span class="recycle-price">+{{ (item.recyclePrice || item.price * 0.8).toFixed(2) }} 币</span>
          </div>
        </div>
        <div class="recycle-total">
          共获得：<span class="total-coins">{{ totalRecycleCoins.toFixed(2) }}</span> 盲盒币
        </div>
      </div>
      <template #footer>
        <el-button @click="showRecycleDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRecycle">确认回收</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { userAPI, addressAPI } from '@/services/api'
import { formatDate, formatPhone, formatPrice } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('pending')
const loading = ref(false)
const list = ref<any[]>([])

// 各状态数量
const pendingCount = ref(0)
const shippedCount = ref(0)
const recycledCount = ref(0)

const tabs = computed(() => [
  { label: '待发货', value: 'pending', count: pendingCount.value },
  { label: '已发货', value: 'shipped', count: shippedCount.value },
  { label: '已回收', value: 'recycled', count: recycledCount.value }
])

const totalCount = computed(() => pendingCount.value + shippedCount.value + recycledCount.value)

const emptyText = computed(() => {
  if (activeTab.value === 'pending') return '暂无待发货商品'
  if (activeTab.value === 'shipped') return '暂无已发货商品'
  return '暂无已回收商品'
})

// 选择
const allSelected = ref(false)
const selectedCount = computed(() => list.value.filter(i => i.selected).length)

const updateSelection = () => {
  allSelected.value = list.value.length > 0 && list.value.every(i => i.selected)
}

const toggleAll = (val: boolean) => {
  list.value.forEach(item => { item.selected = val })
}

// 发货
const showShipDialog = ref(false)
const addresses = ref<any[]>([])
const selectedAddressId = ref<number | null>(null)
const shipItems = ref<any[]>([])

// 回收
const showRecycleDialog = ref(false)
const recycleItems = ref<any[]>([])
const totalRecycleCoins = computed(() => {
  return recycleItems.value.reduce((sum, item) => sum + (item.recyclePrice || item.price * 0.8), 0)
})

const getRarityClass = (rarity: string) => {
  if (rarity === 'hidden' || rarity === 'legendary') return 'rarity-legendary'
  if (rarity === 'rare' || rarity === 'epic') return 'rarity-rare'
  return 'rarity-common'
}

const getRarityLabel = (rarity: string) => {
  const map: Record<string, string> = { common: '普通', rare: '稀有', epic: '史诗', hidden: '隐藏', legendary: '传说' }
  return map[rarity] || '普通'
}

const switchTab = (tab: string) => {
  activeTab.value = tab
  fetchList()
}

const fetchList = async () => {
  if (!userStore.userInfo?.id) return
  loading.value = true
  try {
    const res = await userAPI.getCabinet(userStore.userInfo.id, { status: activeTab.value })
    const data = res.data || res
    list.value = (data.list || data || []).map((item: any) => ({ ...item, selected: false }))

    // 更新各状态数量
    if (activeTab.value === 'pending') pendingCount.value = list.value.length
    // 获取其他状态数量
    try {
      const shippedRes = await userAPI.getCabinet(userStore.userInfo.id, { status: 'shipped' })
      shippedCount.value = (shippedRes.data?.list || shippedRes.data || shippedRes.list || []).length
    } catch {}
    try {
      const recycledRes = await userAPI.getCabinet(userStore.userInfo.id, { status: 'recycled' })
      recycledCount.value = (recycledRes.data?.list || recycledRes.data || recycledRes.list || []).length
    } catch {}
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const fetchAddresses = async () => {
  try {
    const res = await addressAPI.getList()
    addresses.value = res.data?.list || res.data || res.list || []
    const defaultAddr = addresses.value.find((a: any) => a.isDefault)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
  } catch {
    addresses.value = []
  }
}

const goAddress = () => {
  showShipDialog.value = false
  router.push('/address')
}

const shipSingle = (item: any) => {
  shipItems.value = [item]
  fetchAddresses()
  showShipDialog.value = true
}

const batchShip = () => {
  shipItems.value = list.value.filter(i => i.selected)
  if (shipItems.value.length === 0) {
    ElMessage.warning('请选择要发货的商品')
    return
  }
  fetchAddresses()
  showShipDialog.value = true
}

const confirmShip = async () => {
  if (!selectedAddressId.value || !userStore.userInfo?.id) return
  try {
    await userAPI.shipCabinet(userStore.userInfo.id, {
      itemIds: shipItems.value.map(i => i.id),
      addressId: selectedAddressId.value
    })
    ElMessage.success('发货成功')
    showShipDialog.value = false
    fetchList()
  } catch {}
}

const recycleSingle = (item: any) => {
  recycleItems.value = [item]
  showRecycleDialog.value = true
}

const batchRecycle = () => {
  recycleItems.value = list.value.filter(i => i.selected)
  if (recycleItems.value.length === 0) {
    ElMessage.warning('请选择要回收的商品')
    return
  }
  showRecycleDialog.value = true
}

const confirmRecycle = async () => {
  if (!userStore.userInfo?.id) return
  try {
    await userAPI.recycle(userStore.userInfo.id, {
      itemIds: recycleItems.value.map(i => i.id)
    })
    ElMessage.success(`回收成功，获得 ${totalRecycleCoins.value.toFixed(2)} 盲盒币`)
    showRecycleDialog.value = false
    fetchList()
    userStore.fetchUserInfo()
  } catch {}
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchList()
})
</script>

<style scoped>
.cabinet-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 80px;
}

.cabinet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(180deg, #FFE4EE 0%, var(--bg-pink) 100%);
}

.cabinet-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.total-count {
  font-size: 13px;
  color: var(--text-light);
}

/* Tabs */
.cabinet-tabs {
  display: flex;
  padding: 0 16px 12px;
  gap: 0;
  background: var(--bg-pink);
}

.cabinet-tabs .tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.cabinet-tabs .tab-item.active {
  color: var(--primary-pink);
  font-weight: 600;
  border-bottom-color: var(--primary-pink);
}

.tab-count {
  font-size: 12px;
  color: var(--text-light);
}

/* 列表 */
.cabinet-list {
  padding: 0 16px;
  min-height: 300px;
}

.cabinet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #FFFFFF;
  border-radius: var(--radius-card);
  margin-bottom: 10px;
  box-shadow: var(--shadow-card);
}

.item-checkbox {
  flex-shrink: 0;
}

.item-cover {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rarity-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.rarity-common { background: #F5F5F5; color: #999; }
.rarity-rare { background: #E8ECFF; color: #667eea; }
.rarity-legendary { background: #FFF8E1; color: #FFD700; }

.item-time {
  font-size: 11px;
  color: var(--text-light);
}

.item-actions {
  display: flex;
  gap: 8px;
}

.item-actions .el-button {
  font-size: 12px;
  padding: 4px 14px;
}

.item-shipping {
  font-size: 12px;
  color: var(--text-secondary);
}

.shipping-label {
  color: var(--text-light);
}

.shipping-no {
  color: var(--primary-pink);
  font-weight: 500;
}

.recycled-coins {
  font-size: 14px;
  font-weight: 600;
  color: var(--warning);
}

/* 批量操作栏 */
.batch-bar {
  position: fixed;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 98;
}

.batch-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-count {
  font-size: 12px;
  color: var(--primary-pink);
}

.batch-right {
  display: flex;
  gap: 8px;
}

/* 发货弹窗 */
.ship-content {
  max-height: 400px;
  overflow-y: auto;
}

.no-address {
  text-align: center;
  padding: 30px 0;
}

.no-address p {
  margin-bottom: 12px;
  color: var(--text-light);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-item.selected {
  border-color: var(--primary-pink);
  background: #FFF5F7;
}

.address-info {
  flex: 1;
}

.address-user {
  margin-bottom: 4px;
}

.address-name {
  font-size: 15px;
  font-weight: 600;
  margin-right: 10px;
}

.address-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

.address-detail {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.check-icon {
  color: var(--primary-pink);
  font-size: 22px;
}

.shipping-info {
  margin-top: 12px;
  padding: 10px;
  background: #FFF5F7;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 回收弹窗 */
.recycle-content {
  text-align: center;
}

.recycle-tip {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 16px;
}

.recycle-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 16px;
}

.recycle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  background: #FFF5F7;
  border-radius: 12px;
  width: 90px;
}

.recycle-item img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.recycle-name {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.recycle-price {
  font-size: 12px;
  font-weight: 600;
  color: var(--warning);
}

.recycle-total {
  font-size: 15px;
  color: var(--text-primary);
}

.total-coins {
  font-size: 20px;
  font-weight: 700;
  color: var(--warning);
}
</style>
