<template>
  <div class="user-manage">
    <!-- 操作按钮 -->
    <div class="actions">
      <div class="batch-actions" v-if="selectedUsers.length > 0">
        <span class="batch-info">已选择 {{ selectedUsers.length }} 个用户</span>
        <el-button type="primary" size="small" @click="batchBan">批量封禁</el-button>
        <el-button type="success" size="small" @click="batchUnban">批量解封</el-button>
        <el-button type="warning" size="small" @click="batchSendCoin">批量赠送盲盒币</el-button>
        <el-button type="info" size="small" @click="batchSendSMS">批量发短信</el-button>
      </div>
      <div class="primary-actions">
        <el-button type="primary" @click="exportUsers">导出用户</el-button>
        <el-button type="success" @click="refreshUsers">刷新</el-button>
        <el-button type="default" @click="resetFilter">重置筛选</el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名/邮箱/ID"
        style="width: 300px; margin-right: 10px"
        clearable
      >
        <template #append>
          <el-button @click="searchUsers"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      
      <!-- VIP等级筛选 -->
      <el-select v-model="vipLevel" placeholder="VIP等级" style="width: 120px; margin-right: 10px">
        <el-option label="全部" value=""></el-option>
        <el-option label="VIP1-2" value="1-2"></el-option>
        <el-option label="VIP3-4" value="3-4"></el-option>
        <el-option label="VIP5+" :value="'5+'"></el-option>
      </el-select>
      
      <!-- 注册时间区间 -->
      <el-date-picker
        v-model="registerDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 300px; margin-right: 10px"
      />
      
      <!-- 资产范围筛选 -->
      <el-select v-model="assetRange" placeholder="资产范围" style="width: 150px; margin-right: 10px">
        <el-option label="全部" value=""></el-option>
        <el-option label="盲盒币>1000" value="coin>1000"></el-option>
        <el-option label="积分>5000" value="points>5000"></el-option>
        <el-option label="高价值用户" value="high-value"></el-option>
      </el-select>
      
      <el-select v-model="userRole" placeholder="用户角色" style="width: 120px; margin-right: 10px">
        <el-option label="全部" value=""></el-option>
        <el-option label="普通用户" value="user"></el-option>
        <el-option label="管理员" value="admin"></el-option>
      </el-select>
      
      <el-select v-model="userStatus" placeholder="用户状态" style="width: 120px">
        <el-option label="全部" value=""></el-option>
        <el-option label="活跃" value="active"></el-option>
        <el-option label="封禁" value="banned"></el-option>
      </el-select>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <el-table 
        :data="users" 
        style="width: 100%"
        :row-class-name="tableRowClassName"
        border
        stripe
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="用户ID" width="180" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="vipLevel" label="VIP等级" width="100">
          <template #default="scope">
            <span class="vip-tag" :class="getVIPClass(scope.row.vipLevel)">
              VIP{{ scope.row.vipLevel }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100">
          <template #default="scope">
            <span class="points-value">{{ formatNumber(scope.row.points) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="blindBoxCoin" label="盲盒币" width="100">
          <template #default="scope">
            <span class="coin-value">{{ formatNumber(scope.row.blindBoxCoin) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <span class="role-tag" :class="scope.row.role === 'admin' ? 'role-admin' : 'role-user'">
              {{ scope.row.role === 'admin' ? '管理员' : '用户' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <span class="status-tag" :class="scope.row.status === 'active' ? 'status-active' : 'status-banned'">
              {{ scope.row.status === 'active' ? '活跃' : '封禁' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="text" @click="viewUser(scope.row)" class="view-btn">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'active'" 
              type="danger" 
              size="small" 
              @click="banUser(scope.row)"
              class="ban-btn"
            >
              封禁
            </el-button>
            <el-button 
              v-else 
              type="success" 
              size="small" 
              @click="unbanUser(scope.row)"
              class="unban-btn"
            >
              解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户详情弹窗 -->
    <el-dialog
      v-model="showUserDetail"
      title="用户详情"
      width="800px"
    >
      <div class="user-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2">
            <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ currentUser.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="VIP等级">
              <span class="vip-tag" :class="getVIPClass(currentUser.vipLevel)">
                VIP{{ currentUser.vipLevel }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <span class="role-tag" :class="currentUser.role === 'admin' ? 'role-admin' : 'role-user'">
                {{ currentUser.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-tag" :class="currentUser.status === 'active' ? 'status-active' : 'status-banned'">
                {{ currentUser.status === 'active' ? '活跃' : '封禁' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h3>资产信息</h3>
          <el-descriptions :column="2">
            <el-descriptions-item label="积分">{{ formatNumber(currentUser.points) }}</el-descriptions-item>
            <el-descriptions-item label="盲盒币">{{ formatNumber(currentUser.blindBoxCoin) }}</el-descriptions-item>
            <el-descriptions-item label="透视卡">{{ currentUser.tools?.perspectiveCard || 0 }}</el-descriptions-item>
            <el-descriptions-item label="提示卡">{{ currentUser.tools?.hintCard || 0 }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h3>优惠券</h3>
          <el-table v-if="currentUser.coupons && currentUser.coupons.length > 0" :data="currentUser.coupons" style="width: 100%">
            <el-table-column prop="type" label="类型"></el-table-column>
            <el-table-column prop="value" label="价值"></el-table-column>
            <el-table-column prop="expireAt" label="过期时间"></el-table-column>
          </el-table>
          <div v-else class="empty-coupons">
            暂无优惠券
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUserDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作弹窗 -->
    <el-dialog
      v-model="showBatchDialog"
      :title="batchDialogTitle"
      width="500px"
    >
      <div v-if="batchDialogType === 'coin'" class="batch-form">
        <el-form label-position="top">
          <el-form-item label="赠送盲盒币数量">
            <el-input v-model="batchCoinAmount" type="number" min="1" placeholder="请输入数量" />
          </el-form-item>
          <el-form-item label="赠送原因">
            <el-input v-model="batchReason" type="textarea" placeholder="请输入原因" />
          </el-form-item>
        </el-form>
      </div>
      <div v-else-if="batchDialogType === 'sms'" class="batch-form">
        <el-form label-position="top">
          <el-form-item label="短信内容">
            <el-input v-model="batchSMSContent" type="textarea" rows="4" placeholder="请输入短信内容" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchAction">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 用户数据
const users = ref([
  {
    id: '123456789',
    username: '小明',
    email: 'xiaoming@example.com',
    phone: '13800138000',
    vipLevel: 3,
    points: 1250,
    blindBoxCoin: 580,
    role: 'user',
    status: 'active',
    tools: {
      perspectiveCard: 2,
      hintCard: 3
    },
    coupons: [
      { type: '满减券', value: 10, expireAt: '2026-12-31' },
      { type: '免邮券', value: 0, expireAt: '2026-12-31' }
    ],
    createdAt: '2026-01-01 10:00:00'
  },
  {
    id: '987654321',
    username: '小红',
    email: 'xiaohong@example.com',
    phone: '13900139000',
    vipLevel: 5,
    points: 3500,
    blindBoxCoin: 1200,
    role: 'user',
    status: 'active',
    tools: {
      perspectiveCard: 5,
      hintCard: 10
    },
    coupons: [
      { type: '满减券', value: 20, expireAt: '2026-12-31' },
      { type: '满减券', value: 50, expireAt: '2026-12-31' },
      { type: '免邮券', value: 0, expireAt: '2026-12-31' }
    ],
    createdAt: '2026-01-02 14:30:00'
  },
  {
    id: '112233445',
    username: '小刚',
    email: 'xiaogang@example.com',
    phone: '13700137000',
    vipLevel: 1,
    points: 200,
    blindBoxCoin: 100,
    role: 'user',
    status: 'banned',
    tools: {
      perspectiveCard: 0,
      hintCard: 0
    },
    coupons: [],
    createdAt: '2026-01-03 09:15:00'
  },
  {
    id: '556677889',
    username: '管理员',
    email: 'admin@example.com',
    phone: '13600136000',
    vipLevel: 10,
    points: 99999,
    blindBoxCoin: 99999,
    role: 'admin',
    status: 'active',
    tools: {
      perspectiveCard: 999,
      hintCard: 999
    },
    coupons: [],
    createdAt: '2026-01-01 00:00:00'
  }
])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(100)

// 搜索和筛选
const searchKeyword = ref('')
const userRole = ref('')
const userStatus = ref('')
const vipLevel = ref('')
const registerDate = ref([])
const assetRange = ref('')

// 批量操作
const selectedUsers = ref([])
const showBatchDialog = ref(false)
const batchDialogTitle = ref('')
const batchDialogType = ref('')
const batchCoinAmount = ref(0)
const batchReason = ref('')
const batchSMSContent = ref('')

// 用户详情弹窗
const showUserDetail = ref(false)
const currentUser = ref({})

// 表格行样式
const tableRowClassName = ({ row, rowIndex }: any) => {
  return rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd'
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取VIP标签类名
const getVIPClass = (level: number) => {
  if (level >= 10) return 'vip-level-10'
  if (level >= 5) return 'vip-level-5'
  if (level >= 3) return 'vip-level-3'
  return 'vip-level-1'
}

// 搜索用户
const searchUsers = () => {
  ElMessage.info('搜索功能开发中')
}

// 刷新用户
const refreshUsers = () => {
  ElMessage.success('用户列表已刷新')
}

// 导出用户
const exportUsers = () => {
  ElMessage.success('用户导出成功')
}

// 重置筛选
const resetFilter = () => {
  searchKeyword.value = ''
  userRole.value = ''
  userStatus.value = ''
  vipLevel.value = ''
  registerDate.value = []
  assetRange.value = ''
  ElMessage.success('筛选条件已重置')
}

// 查看用户详情
const viewUser = (row: any) => {
  currentUser.value = row
  showUserDetail.value = true
}

// 封禁用户
const banUser = (row: any) => {
  ElMessageBox.confirm('确定要封禁该用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'banned'
    ElMessage.success('用户已封禁')
  }).catch(() => {
    // 取消操作
  })
}

// 解封用户
const unbanUser = (row: any) => {
  row.status = 'active'
  ElMessage.success('用户已解封')
}

// 批量封禁
const batchBan = () => {
  ElMessageBox.confirm(`确定要封禁选中的 ${selectedUsers.value.length} 个用户吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedUsers.value.forEach((user: any) => {
      user.status = 'banned'
    })
    ElMessage.success('批量封禁成功')
  }).catch(() => {
    // 取消操作
  })
}

// 批量解封
const batchUnban = () => {
  selectedUsers.value.forEach((user: any) => {
    user.status = 'active'
  })
  ElMessage.success('批量解封成功')
}

// 批量赠送盲盒币
const batchSendCoin = () => {
  batchDialogTitle.value = '批量赠送盲盒币'
  batchDialogType.value = 'coin'
  batchCoinAmount.value = 100
  batchReason.value = '系统奖励'
  showBatchDialog.value = true
}

// 批量发短信
const batchSendSMS = () => {
  batchDialogTitle.value = '批量发送短信'
  batchDialogType.value = 'sms'
  batchSMSContent.value = '亲爱的用户，我们有新的盲盒系列上线，快来体验吧！'
  showBatchDialog.value = true
}

// 确认批量操作
const confirmBatchAction = () => {
  if (batchDialogType.value === 'coin') {
    ElMessage.success(`已为 ${selectedUsers.value.length} 个用户各赠送 ${batchCoinAmount.value} 盲盒币`)
  } else if (batchDialogType.value === 'sms') {
    ElMessage.success(`已为 ${selectedUsers.value.length} 个用户发送短信`)
  }
  showBatchDialog.value = false
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  ElMessage.info(`每页显示 ${size} 条`)
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
  ElMessage.info(`当前第 ${current} 页`)
}
</script>

<style scoped>
.user-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.batch-info {
  font-weight: 500;
  color: #2d3748;
}

.primary-actions {
  display: flex;
  gap: 10px;
}

/* 搜索筛选 */
.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 用户列表 */
.user-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  background: #f7fafc;
}

:deep(.el-table__header th) {
  background: #f7fafc !important;
  color: #4a5568 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background: #f7fafc !important;
}

.table-row-even {
  background: #f7fafc;
}

.table-row-odd {
  background: white;
}

/* 标签样式 */
.vip-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.vip-level-1 {
  background: #E6F4EA;
  color: #1E8E3E;
}

.vip-level-3 {
  background: #EBF8FF;
  color: #2B6CB0;
}

.vip-level-5 {
  background: #FEEBC8;
  color: #C05621;
}

.vip-level-10 {
  background: #FED7D7;
  color: #C53030;
}

.role-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background: #EBF8FF;
  color: #2B6CB0;
}

.role-user {
  background: #F7FAFC;
  color: #4A5568;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #E6F4EA;
  color: #1E8E3E;
}

.status-banned {
  background: #FED7D7;
  color: #C53030;
}

/* 资产数值 */
.points-value,
.coin-value {
  font-weight: 600;
  color: #2D3748;
}

.coin-value {
  color: #48BB78;
}

/* 操作按钮 */
.view-btn {
  color: #4299E1;
}

.view-btn:hover {
  color: #3182CE;
  background: #EBF8FF;
}

.ban-btn {
  margin-left: 8px;
}

.unban-btn {
  margin-left: 8px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 用户详情 */
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.empty-coupons {
  text-align: center;
  padding: 30px;
  color: #718096;
  background: #f7fafc;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.batch-form {
  padding: 10px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions,
  .primary-actions {
    justify-content: center;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .user-list {
    overflow-x: auto;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>