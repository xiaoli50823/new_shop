<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="admin-header-left">
        <h2>分类管理</h2>
        <p class="admin-subtitle">管理盲盒分类，客户端按分类筛选</p>
      </div>
      <el-button type="primary" @click="openCreateDialog">添加分类</el-button>
    </div>

    <div class="admin-card">
      <div class="admin-toolbar">
        <el-input v-model="searchKeyword" clearable placeholder="搜索分类名称" style="width: 200px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-select v-model="filterStatus" clearable placeholder="状态筛选" style="width: 120px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
      </div>

      <el-table :data="categoryList" v-loading="loading" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="value" label="标识" width="120" />
        <el-table-column label="图标" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 6px;"
              :preview-src-list="[row.icon]"
              :preview-teleported="true"
            />
            <span v-else style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        class="admin-pagination"
      />
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="如：动漫手办" />
        </el-form-item>
        <el-form-item label="标识" prop="value">
          <el-input v-model="form.value" placeholder="如：anime_figure" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="图标URL">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <el-input v-model="form.icon" placeholder="输入图标URL" clearable style="flex: 1" />
            <el-image
              v-if="form.icon"
              :src="form.icon"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 6px; border: 1px solid #e4e7ed; flex-shrink: 0;"
              :preview-src-list="[form.icon]"
              preview-teleported
            />
            <span v-else style="width: 50px; height: 50px; border-radius: 6px; border: 1px dashed #dcdfe6; display: flex; align-items: center; justify-content: center; color: #c0c4cc; font-size: 18px; flex-shrink: 0;">?</span>
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="分类描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/services/api'

// 数据
const categoryList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const searchKeyword = ref('')
const filterStatus = ref('')

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  name: '',
  value: '',
  icon: '',
  description: '',
  sortOrder: 0,
  status: 'active' as 'active' | 'inactive'
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  value: [
    { required: true, message: '请输入标识', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ]
}

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/categories/admin', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value || undefined,
        status: filterStatus.value || undefined
      }
    })
    const data = res.data
    categoryList.value = data.list || []
    total.value = data.total || 0
  } catch {
    // 已处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadList()
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    name: '',
    value: '',
    icon: '',
    description: '',
    sortOrder: 0,
    status: 'active' as const
  })
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    value: row.value,
    icon: row.icon || '',
    description: row.description || '',
    sortOrder: row.sort_order || 0,
    status: row.status
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await api.put(`/categories/${form.id}`, {
          name: form.name,
          icon: form.icon || null,
          description: form.description || null,
          sort_order: form.sortOrder,
          status: form.status
        })
        ElMessage.success('更新成功')
      } else {
        await api.post('/categories', {
          name: form.name,
          value: form.value,
          icon: form.icon || null,
          description: form.description || null,
          sortOrder: form.sortOrder
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadList()
    } catch (e: any) {
      // 已处理
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除分类"${row.name}"吗？`, '删除确认', { type: 'warning' })
    await api.delete(`/categories/${row.id}`)
    ElMessage.success('删除成功')
    loadList()
  } catch {
    // 取消或已处理
  }
}

onMounted(() => {
  loadList()
})
</script>
