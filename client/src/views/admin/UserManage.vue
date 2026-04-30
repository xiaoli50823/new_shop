<template>
  <div class="user-manage">
    <!-- 筛选栏 -->
    <div class="card filter-bar">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/邮箱/手机"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterVip" placeholder="VIP等级" clearable style="width: 130px">
          <el-option label="全部" value="" />
          <el-option v-for="n in 10" :key="n" :label="'VIP' + n" :value="String(n)" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="封禁" value="banned" />
        </el-select>
        <el-select v-model="filterRole" placeholder="角色" clearable style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="普通用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="注册开始"
          end-placeholder="注册结束"
          style="width: 260px"
        />
        <el-button @click="resetFilter">重置</el-button>
        <div class="filter-right">
          <el-button @click="exportUsers">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length" class="card batch-bar">
      <span class="batch-info">已选择 {{ selectedRows.length }} 个用户</span>
      <el-button type="danger" size="small" @click="batchBan">批量封禁</el-button>
      <el-button type="success" size="small" @click="batchUnban">批量解封</el-button>
      <el-button type="warning" size="small" @click="openBatchCoin">赠送盲盒币</el-button>
      <el-button type="info" size="small" @click="openBatchSms">发短信</el-button>
    </div>

    <!-- 表格 -->
    <div class="card">
      <el-table
        :data="userList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="用户ID" width="120" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column label="VIP" width="80">
          <template #default="{ row }">
            <el-tag :type="getVipType(row.vipLevel)" size="small">VIP{{ row.vipLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="90" />
        <el-table-column prop="blindBoxCoin" label="盲盒币" width="90" />
        <el-table-column label="角色" width="90">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '活跃' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewUser(row)">查看</el-button>
            <el-popconfirm
              :title="row.status === 'active' ? '确定封禁该用户？' : '确定解封该用户？'"
              @confirm="toggleUserStatus(row)"
            >
              <template #reference>
                <el-button :type="row.status === 'active' ? 'danger' : 'success'" link size="small">
                  {{ row.status === 'active' ? '封禁' : '解封' }}
                </el-button>
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

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="800px" destroy-on-close>
      <el-tabs v-model="detailTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="用户ID">{{ detailUser.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ detailUser.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ detailUser.email }}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ detailUser.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="VIP等级">VIP{{ detailUser.vipLevel }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ detailUser.role === 'admin' ? '管理员' : '用户' }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ detailUser.status === 'active' ? '活跃' : '封禁' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ detailUser.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="资产信息" name="assets">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="积分">{{ detailUser.points }}</el-descriptions-item>
            <el-descriptions-item label="盲盒币">{{ detailUser.blindBoxCoin }}</el-descriptions-item>
            <el-descriptions-item label="透视卡">{{ detailUser.tools?.perspectiveCard ?? 0 }}</el-descriptions-item>
            <el-descriptions-item label="提示卡">{{ detailUser.tools?.hintCard ?? 0 }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="优惠券" name="coupons">
          <el-table :data="detailUser.coupons || []" border size="small" style="width: 100%">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="value" label="价值" width="100" />
            <el-table-column prop="expireAt" label="过期时间" width="140" />
          </el-table>
          <el-empty v-if="!(detailUser.coupons || []).length" description="暂无优惠券" :image-size="60" />
        </el-tab-pane>
        <el-tab-pane label="抽盒记录" name="draws">
          <el-table :data="detailUser.drawRecords || []" border size="small" style="width: 100%" v-loading="detailLoading">
            <el-table-column prop="blindBoxName" label="盲盒" />
            <el-table-column prop="prizeName" label="获得奖品" />
            <el-table-column prop="createdAt" label="时间" width="170" />
          </el-table>
          <el-empty v-if="!(detailUser.drawRecords || []).length" description="暂无记录" :image-size="60" />
        </el-tab-pane>
        <el-tab-pane label="订单列表" name="orders">
          <el-table :data="detailUser.orders || []" border size="small" style="width: 100%" v-loading="detailLoading">
            <el-table-column prop="orderNo" label="订单号" width="170" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.amount }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)" size="small">{{ getOrderStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="170" />
          </el-table>
          <el-empty v-if="!(detailUser.orders || []).length" description="暂无订单" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 批量赠送盲盒币弹窗 -->
    <el-dialog v-model="batchCoinVisible" title="批量赠送盲盒币" width="450px" destroy-on-close>
      <el-form ref="batchCoinFormRef" :model="batchCoinForm" :rules="batchCoinRules" label-width="100px">
        <el-form-item label="赠送数量" prop="amount">
          <el-input-number v-model="batchCoinForm.amount" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason">
          <el-input v-model="batchCoinForm.reason" type="textarea" :rows="3" placeholder="请输入原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCoinVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchSubmitting" @click="confirmBatchCoin">确认</el-button>
      </template>
    </el-dialog>

    <!-- 批量发短信弹窗 -->
    <el-dialog v-model="batchSmsVisible" title="批量发送短信" width="450px" destroy-on-close>
      <el-form ref="batchSmsFormRef" :model="batchSmsForm" :rules="batchSmsRules" label-width="100px">
        <el-form-item label="短信内容" prop="content">
          <el-input v-model="batchSmsForm.content" type="textarea" :rows="4" placeholder="请输入短信内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchSmsVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchSubmitting" @click="confirmBatchSms">确认发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import api from '../../services/api'

const loading = ref(false)
const detailLoading = ref(false)
const batchSubmitting = ref(false)
const searchKeyword = ref('')
const filterVip = ref('')
const filterStatus = ref('')
const filterRole = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const userList = ref<any[]>([])
const selectedRows = ref<any[]>([])

// 详情弹窗
const detailVisible = ref(false)
const detailTab = ref('info')
const detailUser = ref<any>({})

// 批量赠送盲盒币
const batchCoinVisible = ref(false)
const batchCoinFormRef = ref<FormInstance>()
const batchCoinForm = reactive({ amount: 100, reason: '' })
const batchCoinRules: FormRules = {
  amount: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入原因', trigger: 'blur' }]
}

// 批量发短信
const batchSmsVisible = ref(false)
const batchSmsFormRef = ref<FormInstance>()
const batchSmsForm = reactive({ content: '' })
const batchSmsRules: FormRules = {
  content: [{ required: true, message: '请输入短信内容', trigger: 'blur' }]
}

const getVipType = (level: number) => {
  if (level >= 8) return 'danger'
  if (level >= 5) return 'warning'
  if (level >= 3) return ''
  return 'info'
}

const getOrderStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', paid: '', shipping: 'info', completed: 'success', cancelled: 'danger' }
  return (map[status] || 'info') as any
}

const getOrderStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: '待支付', paid: '已支付', shipping: '配送中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleSearch = () => {
  currentPage.value = 1
  loadList()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterVip.value = ''
  filterStatus.value = ''
  filterRole.value = ''
  dateRange.value = null
  currentPage.value = 1
  loadList()
}

const exportUsers = () => {
  ElMessage.success('用户导出成功')
}

const viewUser = async (row: any) => {
  detailUser.value = { ...row }
  detailTab.value = 'info'
  detailVisible.value = true
  // 加载详细数据
  detailLoading.value = true
  try {
    const res: any = await api.get(`/users/${row._id || row.id}`)
    const data = res?.data || res || row
    detailUser.value = { ...row, ...data }
  } catch {
    // 使用列表数据
  } finally {
    detailLoading.value = false
  }
}

const toggleUserStatus = async (row: any) => {
  try {
    const newStatus = row.status === 'active' ? 'banned' : 'active'
    await api.put(`/users/${row._id || row.id}`, { status: newStatus })
    row.status = newStatus
    ElMessage.success(newStatus === 'active' ? '已解封' : '已封禁')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const batchBan = () => {
  ElMessageBox.confirm(`确定封禁选中的 ${selectedRows.value.length} 个用户？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(r => r._id || r.id)
      await api.put('/users/batch', { ids, status: 'banned' })
      selectedRows.value.forEach(r => r.status = 'banned')
      ElMessage.success('批量封禁成功')
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
    }
  }).catch(() => {})
}

const batchUnban = async () => {
  try {
    const ids = selectedRows.value.map(r => r._id || r.id)
    await api.put('/users/batch', { ids, status: 'active' })
    selectedRows.value.forEach(r => r.status = 'active')
    ElMessage.success('批量解封成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const openBatchCoin = () => {
  batchCoinForm.amount = 100
  batchCoinForm.reason = ''
  batchCoinVisible.value = true
}

const confirmBatchCoin = async () => {
  if (!batchCoinFormRef.value) return
  await batchCoinFormRef.value.validate(async (valid) => {
    if (!valid) return
    batchSubmitting.value = true
    try {
      const ids = selectedRows.value.map(r => r._id || r.id)
      await api.put('/users/batch-coin', { ids, amount: batchCoinForm.amount, reason: batchCoinForm.reason })
      ElMessage.success(`已为 ${ids.length} 个用户赠送 ${batchCoinForm.amount} 盲盒币`)
      batchCoinVisible.value = false
      loadList()
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
    } finally {
      batchSubmitting.value = false
    }
  })
}

const openBatchSms = () => {
  batchSmsForm.content = ''
  batchSmsVisible.value = true
}

const confirmBatchSms = async () => {
  if (!batchSmsFormRef.value) return
  await batchSmsFormRef.value.validate(async (valid) => {
    if (!valid) return
    batchSubmitting.value = true
    try {
      const ids = selectedRows.value.map(r => r._id || r.id)
      await api.put('/users/batch-sms', { ids, content: batchSmsForm.content })
      ElMessage.success(`已为 ${ids.length} 个用户发送短信`)
      batchSmsVisible.value = false
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
    } finally {
      batchSubmitting.value = false
    }
  })
}

const loadList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      vipLevel: filterVip.value,
      status: filterStatus.value,
      role: filterRole.value
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }
    const res: any = await api.get('/users', { params })
    const data = res?.data || res || {}
    userList.value = (data.list || data || []).map((u: any) => ({
      ...u,
      id: u._id || u.id
    }))
    totalCount.value = data.total || userList.value.length
  } catch {
    userList.value = []
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
.user-manage {
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

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.batch-info {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
