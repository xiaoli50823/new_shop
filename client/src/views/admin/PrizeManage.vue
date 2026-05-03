<template>
  <div class="prize-manage">
    <!-- 筛选栏 -->
    <div class="card filter-bar">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索奖品名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterRarity" placeholder="稀有度筛选" clearable style="width: 140px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="普通" value="common" />
          <el-option label="稀有" value="rare" />
          <el-option label="超稀有" value="super_rare" />
          <el-option label="隐藏款" value="hidden" />
        </el-select>
        <el-select v-model="filterBlindBox" placeholder="所属盲盒" clearable style="width: 180px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option v-for="box in blindBoxOptions" :key="box.id" :label="box.name" :value="box.id" />
        </el-select>
        <el-button @click="resetFilter">重置</el-button>
        <div class="filter-right">
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>创建奖品
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
        :data="prizeList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="奖品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="blindBoxName" label="所属盲盒" min-width="160" show-overflow-tooltip />
        <el-table-column label="稀有度" width="100">
          <template #default="{ row }">
            <el-tag :type="rarityTagMap[row.rarity]?.type || 'info'" size="small">
              {{ rarityTagMap[row.rarity]?.label || row.rarity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="概率" width="100">
          <template #default="{ row }">{{ row.probability }}%</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该奖品吗？" @confirm="handleDelete(row)">
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
      :title="isEdit ? '编辑奖品' : '创建奖品'"
      width="550px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="所属盲盒" prop="blindBoxId">
          <el-select v-model="form.blindBoxId" placeholder="请选择盲盒" style="width: 100%">
            <el-option v-for="box in blindBoxOptions" :key="box.id" :label="box.name" :value="box.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入奖品名称" />
        </el-form-item>
        <el-form-item label="稀有度" prop="rarity">
          <el-select v-model="form.rarity" placeholder="请选择稀有度" style="width: 100%">
            <el-option label="普通" value="common" />
            <el-option label="稀有" value="rare" />
            <el-option label="超稀有" value="super_rare" />
            <el-option label="隐藏款" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item label="概率(%)" prop="probability">
          <el-input-number v-model="form.probability" :min="0" :max="100" :precision="1" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, Download } from '@element-plus/icons-vue'
import api from '../../services/api'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterRarity = ref('')
const filterBlindBox = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const rarityTagMap: Record<string, { type: string; label: string }> = {
  common: { type: 'info', label: '普通' },
  rare: { type: '', label: '稀有' },
  super_rare: { type: 'warning', label: '超稀有' },
  hidden: { type: 'danger', label: '隐藏款' }
}

const blindBoxOptions = ref<Array<{ id: string; name: string }>>([])
const prizeList = ref<any[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = () => ({
  id: '',
  blindBoxId: '',
  name: '',
  rarity: 'common',
  probability: 0,
  stock: 0
})

const form = reactive(defaultForm())

const formRules: FormRules = {
  blindBoxId: [{ required: true, message: '请选择所属盲盒', trigger: 'change' }],
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  rarity: [{ required: true, message: '请选择稀有度', trigger: 'change' }],
  probability: [{ required: true, message: '请输入概率', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
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
    blindBoxId: row.blindBoxId || '',
    name: row.name || '',
    rarity: row.rarity || 'common',
    probability: row.probability || 0,
    stock: row.stock || 0
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
        blindBoxId: form.blindBoxId,
        name: form.name,
        rarity: form.rarity,
        probability: form.probability,
        stock: form.stock
      }
      if (isEdit.value) {
        await api.put(`/prizes/${form.id}`, payload)
        ElMessage.success('编辑成功')
      } else {
        await api.post('/prizes', payload)
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

const handleDelete = async (row: any) => {
  try {
    await api.delete(`/prizes/${row._id || row.id}`)
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
  filterRarity.value = ''
  filterBlindBox.value = ''
  currentPage.value = 1
  loadList()
}

const exportData = () => {
  ElMessage.success('数据导出成功')
}

const loadBlindBoxOptions = async () => {
  try {
    const res: any = await api.get('/blind-boxes', { params: { pageSize: 100 } })
    const data = res?.data || res || {}
    const list = data.list || data || []
    blindBoxOptions.value = list.map((b: any) => ({ id: b._id || b.id, name: b.name }))
  } catch {
    blindBoxOptions.value = []
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/prizes', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        rarity: filterRarity.value,
        blindBoxId: filterBlindBox.value
      }
    })
    const data = res?.data || res || {}
    prizeList.value = (data.list || data || []).map((p: any) => ({
      ...p,
      id: p._id || p.id,
      blindBoxName: p.blindBox?.name || ''
    }))
    totalCount.value = data.total || prizeList.value.length
  } catch {
    prizeList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBlindBoxOptions()
  loadList()
})
</script>

<style scoped>
.prize-manage {
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

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
