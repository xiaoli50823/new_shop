<template>
  <div class="order-manage">
    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="primary" @click="exportOrders">导出订单</el-button>
      <el-button type="success" @click="refreshOrders">刷新</el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索订单号/用户ID"
        style="width: 300px; margin-right: 10px"
        clearable
      >
        <template #append>
          <el-button @click="searchOrders"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      <el-select v-model="orderType" placeholder="订单类型" style="width: 150px; margin-right: 10px">
        <el-option label="全部" value=""></el-option>
        <el-option label="购买订单" value="purchase"></el-option>
        <el-option label="发货订单" value="shipment"></el-option>
      </el-select>
      <el-select v-model="orderStatus" placeholder="订单状态" style="width: 150px">
        <el-option label="全部" value=""></el-option>
        <el-option label="待支付" value="pending"></el-option>
        <el-option label="已支付" value="paid"></el-option>
        <el-option label="配送中" value="shipping"></el-option>
        <el-option label="已完成" value="completed"></el-option>
        <el-option label="已取消" value="cancelled"></el-option>
      </el-select>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="id" label="订单号" width="180"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="150"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'purchase' ? 'primary' : 'success'">
              {{ scope.row.type === 'purchase' ? '购买' : '发货' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="金额" width="100">
          <template #default="scope">¥{{ scope.row.total }}</template>
        </el-table-column>
        <el-table-column prop="items" label="商品" width="300">
          <template #default="scope">
            <div v-for="(item, index) in scope.row.items" :key="index" class="order-item">
              {{ item.name }} x {{ item.quantity }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">查看</el-button>
              <el-button v-if="scope.row.status === 'pending'" type="success" size="small" @click="updateStatus(scope.row, 'paid')">标记支付</el-button>
              <el-button v-if="scope.row.status === 'paid' && scope.row.type === 'shipment'" type="success" size="small" @click="showShipDialog(scope.row)">发货</el-button>
              <el-button v-if="scope.row.status !== 'cancelled'" type="danger" size="small" @click="updateStatus(scope.row, 'cancelled')">取消</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 发货弹窗 -->
    <el-dialog
      v-model="showShipDialogVisible"
      title="发货"
      width="500px"
    >
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="shipForm.orderId" disabled></el-input>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号"></el-input>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.expressCompany" placeholder="选择快递公司">
            <el-option label="顺丰速运" value="SF"></el-option>
            <el-option label="中通快递" value="ZT"></el-option>
            <el-option label="申通快递" value="ST"></el-option>
            <el-option label="韵达快递" value="YD"></el-option>
            <el-option label="圆通快递" value="YT"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showShipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">确认发货</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="showOrderDetail"
      title="订单详情"
      width="800px"
    >
      <div class="order-detail">
        <div class="detail-section">
          <h3>订单信息</h3>
          <el-descriptions :column="2">
            <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
            <el-descriptions-item label="订单类型">{{ currentOrder.type === 'purchase' ? '购买订单' : '发货订单' }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">{{ getStatusText(currentOrder.status) }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ currentOrder.total }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.items" style="width: 100%">
            <el-table-column prop="name" label="商品名称"></el-table-column>
            <el-table-column prop="quantity" label="数量"></el-table-column>
            <el-table-column prop="price" label="单价">
              <template #default="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column label="小计">
              <template #default="scope">¥{{ scope.row.price * scope.row.quantity }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="currentOrder.shippingInfo" class="detail-section">
          <h3>收货信息</h3>
          <el-descriptions :column="1">
            <el-descriptions-item label="收货地址">{{ currentOrder.shippingInfo.address }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ currentOrder.shippingInfo.contact }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.shippingInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="物流单号">{{ currentOrder.shippingInfo.trackingNumber }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showOrderDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 订单数据
const orders = ref([
  {
    id: '20260417001',
    userId: '123456789',
    type: 'purchase',
    status: 'pending',
    total: 250,
    items: [
      {
        name: '海贼王一番赏',
        quantity: 5,
        price: 50
      }
    ],
    createdAt: '2026-04-17 10:30:00'
  },
  {
    id: '20260416001',
    userId: '987654321',
    type: 'shipment',
    status: 'shipping',
    total: 100,
    items: [
      {
        name: '潮玩盲盒',
        quantity: 2,
        price: 39
      },
      {
        name: '美妆盲盒',
        quantity: 1,
        price: 69
      }
    ],
    shippingInfo: {
      address: '北京市朝阳区某某街道123号',
      contact: '张三',
      phone: '13800138000',
      trackingNumber: 'SF1234567890'
    },
    createdAt: '2026-04-16 14:20:00'
  },
  {
    id: '20260415001',
    userId: '123456789',
    type: 'purchase',
    status: 'completed',
    total: 199,
    items: [
      {
        name: '区块链盲盒',
        quantity: 1,
        price: 199
      }
    ],
    createdAt: '2026-04-15 09:15:00'
  }
])

// 搜索和筛选
const searchKeyword = ref('')
const orderType = ref('')
const orderStatus = ref('')

// 发货弹窗
const showShipDialogVisible = ref(false)
const shipForm = reactive({
  orderId: '',
  trackingNumber: '',
  expressCompany: ''
})

// 订单详情弹窗
const showOrderDetail = ref(false)
const currentOrder = ref({})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'paid': return 'primary'
    case 'shipping': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待支付'
    case 'paid': return '已支付'
    case 'shipping': return '配送中'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    default: return status
  }
}

// 搜索订单
const searchOrders = () => {
  // 实际项目中这里应该调用API搜索订单
  ElMessage.info('搜索功能开发中')
}

// 刷新订单
const refreshOrders = () => {
  // 实际项目中这里应该调用API刷新订单
  ElMessage.success('订单已刷新')
}

// 导出订单
const exportOrders = () => {
  // 实际项目中这里应该调用API导出订单
  ElMessage.success('订单导出成功')
}

// 查看订单详情
const viewOrder = (row: any) => {
  currentOrder.value = row
  showOrderDetail.value = true
}

// 显示发货弹窗
const showShipDialog = (row: any) => {
  shipForm.orderId = row.id
  showShipDialogVisible.value = true
}

// 确认发货
const confirmShip = () => {
  if (!shipForm.trackingNumber || !shipForm.expressCompany) {
    ElMessage.error('请填写完整的发货信息！')
    return
  }
  
  // 实际项目中这里应该调用API更新订单状态
  ElMessage.success('发货成功！')
  showShipDialogVisible.value = false
}

// 更新订单状态
const updateStatus = (row: any, status: string) => {
  // 实际项目中这里应该调用API更新订单状态
  row.status = status
  ElMessage.success(`订单状态已更新为${getStatusText(status)}`)
}
</script>

<style scoped>
.order-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.order-list {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-item {
  margin-bottom: 5px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  align-items: center;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.detail-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .order-list {
    padding: 10px;
  }
}
</style>