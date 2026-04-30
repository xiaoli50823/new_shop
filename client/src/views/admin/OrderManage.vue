<template>
  <div class="order-manage">
    <!-- 筛选栏 -->
    <div class="card filter-bar">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号/用户名"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterType" placeholder="订单类型" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="购买" value="purchase" />
          <el-option label="发货" value="shipment" />
          <el-option label="抽盒" value="draw" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="订单状态" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="配送中" value="shipping" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
        />
        <el-button @click="resetFilter">重置</el-button>
        <div class="filter-right">
          <el-button @click="exportOrders">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="card">
      <el-table
        :data="orderList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="username" label="用户" width="110" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.type]?.type || 'info'" size="small">
              {{ typeMap[row.type]?.label || row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="商品摘要" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="markPaid(row)">标记支付</el-button>
            <el-button v-if="row.status === 'paid'" type="warning" link size="small" @click="openShipDialog(row)">发货</el-button>
            <el-popconfirm v-if="row.status !== 'cancelled' && row.status !== 'completed'" title="确定取消该订单吗？" @confirm="cancelOrder(row)">
              <template #reference>
                <el-button type="danger" link size="small">取消</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="750px" destroy-on-close>
      <div class="detail-section">
        <h4>订单信息</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ detailData.username }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="typeMap[detailData.type]?.type || 'info'" size="small">
              {{ typeMap[detailData.type]?.label || detailData.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[detailData.status]?.type || 'info'" size="small">
              {{ statusMap[detailData.status]?.label || detailData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ detailData.amount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>商品列表</h4>
        <el-table :data="detailData.items || []" border size="small" style="width: 100%">
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="detailData.shippingInfo" class="detail-section">
        <h4>收货信息</h4>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="收货地址">{{ detailData.shippingInfo.address }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailData.shippingInfo.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.shippingInfo.phone }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="detailData.trackingNo" class="detail-section">
        <h4>物流信息</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="快递公司">{{ detailData.expressCompany }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ detailData.trackingNo }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="detailData.logs && detailData.logs.length" class="detail-section">
        <h4>操作日志</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(log, idx) in detailData.logs"
            :key="idx"
            :timestamp="log.time"
            placement="top"
          >
            {{ log.action }} - {{ log.operator }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="shipVisible" title="发货" width="480px" destroy-on-close>
      <el-form ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="100px">
        <el-form-item label="订单号">
          <el-input :model-value="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="快递公司" prop="expressCompany">
          <el-select v-model="shipForm.expressCompany" placeholder="请选择快递公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="邮政快递" value="邮政快递" />
            <el-option label="京东物流" value="京东物流" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNo">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipSubmitting" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import api from '../../services/api'

const loading = ref(false)
const shipSubmitting = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const typeMap: Record<string, { type: string; label: string }> = {
  purchase: { type: '', label: '购买' },
  shipment: { type: 'success', label: '发货' },
  draw: { type: 'warning', label: '抽盒' }
}

const statusMap: Record<string, { type: string; label: string }> = {
  pending: { type: 'warning', label: '待支付' },
  paid: { type: '', label: '已支付' },
  shipping: { type: 'info', label: '配送中' },
  completed: { type: 'success', label: '已完成' },
  cancelled: { type: 'danger', label: '已取消' }
}

const orderList = ref<any[]>([])

// 详情弹窗
const detailVisible = ref(false)
const detailData = ref<any>({})

// 发货弹窗
const shipVisible = ref(false)
const shipFormRef = ref<FormInstance>()
const shipForm = reactive({
  orderId: '',
  orderNo: '',
  expressCompany: '',
  trackingNo: ''
})
const shipRules: FormRules = {
  expressCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  trackingNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

const handleSearch = () => {
  currentPage.value = 1
  loadList()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterStatus.value = ''
  dateRange.value = null
  currentPage.value = 1
  loadList()
}

const exportOrders = () => {
  ElMessage.success('订单导出成功')
}

const viewDetail = (row: any) => {
  detailData.value = row
  detailVisible.value = true
}

const markPaid = async (row: any) => {
  try {
    await api.put(`/orders/${row._id || row.id}`, { status: 'paid' })
    row.status = 'paid'
    ElMessage.success('已标记为已支付')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const openShipDialog = (row: any) => {
  shipForm.orderId = row._id || row.id
  shipForm.orderNo = row.orderNo
  shipForm.expressCompany = ''
  shipForm.trackingNo = ''
  shipVisible.value = true
}

const confirmShip = async () => {
  if (!shipFormRef.value) return
  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return
    shipSubmitting.value = true
    try {
      await api.put(`/orders/${shipForm.orderId}`, {
        status: 'shipping',
        expressCompany: shipForm.expressCompany,
        trackingNo: shipForm.trackingNo
      })
      ElMessage.success('发货成功')
      shipVisible.value = false
      loadList()
    } catch (e: any) {
      ElMessage.error(e?.message || '发货失败')
    } finally {
      shipSubmitting.value = false
    }
  })
}

const cancelOrder = async (row: any) => {
  try {
    await api.put(`/orders/${row._id || row.id}`, { status: 'cancelled' })
    row.status = 'cancelled'
    ElMessage.success('订单已取消')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      type: filterType.value,
      status: filterStatus.value
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }
    const res: any = await api.get('/orders', { params })
    const data = res?.data || res || {}
    orderList.value = (data.list || data || []).map((o: any) => ({
      ...o,
      id: o._id || o.id,
      summary: (o.items || []).map((i: any) => `${i.name}×${i.quantity}`).join('、') || o.summary || '-'
    }))
    totalCount.value = data.total || orderList.value.length
  } catch {
    orderList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.order-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.filter-bar {
  padding: 16px 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.price-text {
  color: #FF4D4F;
  font-weight: 600;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
</style>
