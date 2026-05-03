<template>
  <div class="blind-box-manage">
    <!-- 顶部操作栏 -->
    <div class="card filter-bar">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索盲盒名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterType" placeholder="类型筛选" clearable style="width: 150px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="一番赏" value="lottery" />
          <el-option label="无限盲盒" value="infinite" />
          <el-option label="哈希盲盒" value="hash" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 130px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="上架" value="active" />
          <el-option label="下架" value="inactive" />
        </el-select>
        <el-button @click="resetFilter">重置</el-button>
        <div class="filter-right">
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>创建盲盒
          </el-button>
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>导出数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="card">
      <el-table
        :data="boxList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="售价" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]?.type || 'info'" size="small">
              {{ typeTagMap[row.type]?.label || row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="totalDraws" label="总抽盒次数" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-popconfirm title="确定删除该盲盒吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
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

    <!-- 创建/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑盲盒' : '创建盲盒'"
      width="800px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="盲盒名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入盲盒名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio value="lottery">一番赏</el-radio>
                <el-radio value="infinite">无限盲盒</el-radio>
                <el-radio value="hash">哈希盲盒</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch v-model="form.status" active-value="active" inactive-value="inactive" active-text="上架" inactive-text="下架" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入盲盒描述" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="封面图URL">
              <el-input v-model="form.coverUrl" placeholder="输入图片URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发售时间">
              <el-date-picker v-model="form.saleTime" type="datetime" placeholder="选择发售时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="库存">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="保底机制">
              <el-input-number v-model="form.guarantee" :min="0" style="width: 100%" />
            </el-form-item>
            <div class="form-tip">X抽必中</div>
          </el-col>
          <el-col :span="8">
            <el-form-item label="防爆雷">
              <el-input-number v-model="form.maxHidden" :min="0" style="width: 100%" />
            </el-form-item>
            <div class="form-tip">隐藏款最大产出</div>
          </el-col>
        </el-row>

        <!-- 奖池配置 -->
        <el-divider content-position="left">奖池配置</el-divider>
        <div class="pool-header">
          <el-button type="primary" size="small" @click="addPrize">
            <el-icon><Plus /></el-icon>添加奖品
          </el-button>
          <span class="pool-total" :class="{ 'pool-error': probabilityTotal > 100, 'pool-ok': probabilityTotal === 100 }">
            概率总和: {{ probabilityTotal }}%
          </span>
        </div>
        <el-table :data="form.prizes" border size="small" style="width: 100%">
          <el-table-column label="奖品名称" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.name" size="small" placeholder="奖品名称" />
            </template>
          </el-table-column>
          <el-table-column label="概率(%)" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.probability" :min="0" :max="100" :precision="1" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="库存" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.stock" :min="0" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="稀有度" width="120">
            <template #default="{ row }">
              <el-select v-model="row.rarity" size="small" style="width: 100%">
                <el-option label="普通" value="common" />
                <el-option label="稀有" value="rare" />
                <el-option label="超稀有" value="super_rare" />
                <el-option label="隐藏款" value="hidden" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removePrize($index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, Download, Delete } from '@element-plus/icons-vue'
import api from '../../services/api'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const typeTagMap: Record<string, { type: string; label: string }> = {
  lottery: { type: 'warning', label: '一番赏' },
  infinite: { type: '', label: '无限盲盒' },
  hash: { type: 'info', label: '哈希盲盒' }
}

// 盲盒列表
const boxList = ref<any[]>([])

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = () => ({
  id: '',
  name: '',
  price: 0,
  type: 'infinite' as string,
  description: '',
  coverUrl: '',
  saleTime: null as Date | null,
  status: 'active' as string,
  stock: 0,
  guarantee: 0,
  maxHidden: 0,
  prizes: [] as Array<{ name: string; probability: number; stock: number; rarity: string }>
})

const form = reactive(defaultForm())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入盲盒名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const probabilityTotal = computed(() => {
  return Math.round(form.prizes.reduce((sum, p) => sum + (p.probability || 0), 0) * 10) / 10
})

const addPrize = () => {
  form.prizes.push({ name: '', probability: 0, stock: 0, rarity: 'common' })
}

const removePrize = (index: number) => {
  form.prizes.splice(index, 1)
}

const resetForm = () => {
  Object.assign(form, defaultForm())
  isEdit.value = false
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row._id || row.id,
    name: row.name || '',
    price: row.price || 0,
    type: row.type || 'infinite',
    description: row.description || '',
    coverUrl: row.coverUrl || row.cover_image || row.cover || '',
    saleTime: (row.saleTime || row.sale_time) ? new Date(row.saleTime || row.sale_time) : null,
    status: row.status || 'active',
    stock: row.stock || 0,
    guarantee: row.guarantee || 0,
    maxHidden: row.maxHidden || 0,
    prizes: (row.prizes || []).map((p: any) => ({
      name: p.name || '',
      probability: p.probability || 0,
      stock: p.stock || 0,
      rarity: p.rarity || 'common'
    }))
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        name: form.name,
        price: form.price,
        type: form.type,
        description: form.description,
        coverUrl: form.coverUrl,
        saleTime: form.saleTime,
        status: form.status,
        stock: form.stock,
        guarantee: form.guarantee,
        maxHidden: form.maxHidden,
        prizes: form.prizes
      }
      if (isEdit.value) {
        await api.put(`/blind-boxes/${form.id}`, payload)
        ElMessage.success('编辑成功')
      } else {
        await api.post('/blind-boxes', payload)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadList()
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const toggleStatus = async (row: any) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await api.put(`/blind-boxes/${row._id || row.id}`, { status: newStatus })
    row.status = newStatus
    ElMessage.success(newStatus === 'active' ? '已上架' : '已下架')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await api.delete(`/blind-boxes/${row._id || row.id}`)
    ElMessage.success('删除成功')
    loadList()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadList()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterStatus.value = ''
  currentPage.value = 1
  loadList()
}

const exportData = () => {
  ElMessage.success('数据导出成功')
}

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/blind-boxes', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        type: filterType.value,
        status: filterStatus.value
      }
    })
    const data = res?.data || res || {}
    boxList.value = (data.list || data || []).map((b: any) => ({
      ...b,
      id: b._id || b.id
    }))
    totalCount.value = data.total || boxList.value.length
  } catch {
    boxList.value = []
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
.blind-box-manage {
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: -8px;
  margin-bottom: 12px;
  padding-left: 120px;
}

.pool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pool-total {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.pool-total.pool-error {
  color: #FF4D4F;
}

.pool-total.pool-ok {
  color: #52C41A;
}
</style>
