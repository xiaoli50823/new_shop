<template>
  <div class="blind-box-manage">
    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="primary" @click="showCreateDialog = true">创建盲盒</el-button>
      <el-button type="success" @click="exportData">导出数据</el-button>
    </div>

    <!-- 盲盒列表 -->
    <div class="blind-box-list">
      <el-table :data="blindBoxes" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="盲盒名称"></el-table-column>
        <el-table-column prop="price" label="售价" width="100">
          <template #default="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lottery' ? 'warning' : scope.row.type === 'infinite' ? 'primary' : 'info'">
              {{ scope.row.type === 'lottery' ? '一番赏' : scope.row.type === 'infinite' ? '无限盲盒' : '哈希盲盒' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="totalDraws" label="总抽盒次数" width="120"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editBlindBox(scope.row)">编辑</el-button>
            <el-button type="success" size="small" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteBlindBox(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑盲盒弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? '编辑盲盒' : '创建盲盒'"
      width="800px"
    >
      <el-form :model="blindBoxForm" label-width="120px">
        <el-form-item label="盲盒名称">
          <el-input v-model="blindBoxForm.name" placeholder="请输入盲盒名称"></el-input>
        </el-form-item>
        <el-form-item label="售价">
          <el-input-number v-model="blindBoxForm.price" :min="0" :step="0.01" placeholder="请输入售价"></el-input-number>
        </el-form-item>
        <el-form-item label="盲盒类型">
          <el-radio-group v-model="blindBoxForm.type">
            <el-radio label="lottery">一番赏</el-radio>
            <el-radio label="infinite">无限盲盒</el-radio>
            <el-radio label="hash">哈希盲盒</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload"
            :file-list="fileList"
          >
            <el-button type="primary">上传封面图</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="发售时间">
          <el-date-picker
            v-model="blindBoxForm.saleTime"
            type="datetime"
            placeholder="选择发售时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="blindBoxForm.status" active-value="active" inactive-value="inactive"></el-switch>
        </el-form-item>
        <el-form-item label="奖池配置">
          <div class="prize-config">
            <el-button type="primary" size="small" @click="addPrize">添加奖品</el-button>
            <el-table :data="blindBoxForm.prizes" style="width: 100%" margin-top="10px">
              <el-table-column prop="name" label="奖品名称"></el-table-column>
              <el-table-column prop="probability" label="概率(%)">
                <template #default="scope">
                  <el-input-number v-model="scope.row.probability" :min="0" :max="100" :step="0.1"></el-input-number>
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存">
                <template #default="scope">
                  <el-input-number v-model="scope.row.stock" :min="0"></el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="removePrize(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="保底机制">
          <el-input-number v-model="blindBoxForm.guarantee" :min="0" placeholder="设置X抽必中指定奖品"></el-input-number>
        </el-form-item>
        <el-form-item label="防爆雷风控">
          <el-input-number v-model="blindBoxForm.maxHidden" :min="0" placeholder="全站最多产出隐藏款数量"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveBlindBox">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { blindBoxAPI } from '../../services/api'

// 盲盒列表数据
const blindBoxes = ref([
  {
    id: 1,
    name: '海贼王一番赏',
    price: 50,
    type: 'lottery',
    status: 'active',
    createdAt: '2026-04-15 10:00:00',
    totalDraws: 1200
  },
  {
    id: 2,
    name: '火影忍者一番赏',
    price: 50,
    type: 'lottery',
    status: 'active',
    createdAt: '2026-04-14 14:30:00',
    totalDraws: 850
  },
  {
    id: 3,
    name: '潮玩盲盒',
    price: 39,
    type: 'infinite',
    status: 'active',
    createdAt: '2026-04-13 09:15:00',
    totalDraws: 1500
  },
  {
    id: 4,
    name: '美妆盲盒',
    price: 69,
    type: 'infinite',
    status: 'inactive',
    createdAt: '2026-04-12 16:45:00',
    totalDraws: 980
  },
  {
    id: 5,
    name: '区块链盲盒',
    price: 199,
    type: 'hash',
    status: 'active',
    createdAt: '2026-04-11 11:20:00',
    totalDraws: 750
  }
])

// 弹窗状态
const showCreateDialog = ref(false)
const isEditing = ref(false)

// 盲盒表单
const blindBoxForm = reactive({
  id: 0,
  name: '',
  price: 0,
  type: 'infinite',
  status: 'active',
  saleTime: new Date(),
  prizes: [],
  guarantee: 0,
  maxHidden: 0
})

// 文件列表
const fileList = ref([])

// 加载盲盒列表
const loadBlindBoxes = async () => {
  try {
    const boxes = await blindBoxAPI.getList()
    if (Array.isArray(boxes)) {
      blindBoxes.value = boxes.map(box => ({
        ...box,
        id: box._id,
        createdAt: box.createdAt || new Date().toLocaleString(),
        totalDraws: box.totalDraws || 0
      }))
    }
  } catch (error) {
    console.error('加载盲盒列表失败:', error)
  }
}

// 页面加载时获取盲盒列表
onMounted(() => {
  loadBlindBoxes()
})

// 处理图片上传
const handleImageUpload = (file) => {
  fileList.value = [file]
  // 实际项目中这里应该上传图片到服务器
  console.log('上传图片:', file)
}

// 添加奖品
const addPrize = () => {
  blindBoxForm.prizes.push({
    id: blindBoxForm.prizes.length + 1,
    name: '',
    probability: 0,
    stock: 0
  })
}

// 移除奖品
const removePrize = (index) => {
  blindBoxForm.prizes.splice(index, 1)
}

// 编辑盲盒
const editBlindBox = (row) => {
  isEditing.value = true
  Object.assign(blindBoxForm, row)
  // 实际项目中这里应该获取奖品详情
  blindBoxForm.prizes = [
    { id: 1, name: '路飞手办', probability: 1, stock: 10 },
    { id: 2, name: '索隆手办', probability: 5, stock: 50 },
    { id: 3, name: '娜美手办', probability: 5, stock: 50 },
    { id: 4, name: '山治手办', probability: 20, stock: 200 },
    { id: 5, name: '乌索普手办', probability: 20, stock: 200 },
    { id: 6, name: '乔巴手办', probability: 49, stock: 490 }
  ]
  showCreateDialog.value = true
}

// 切换状态
const toggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  row.status = newStatus
  ElMessage.success(`盲盒${newStatus === 'active' ? '上架' : '下架'}成功！`)
}

// 删除盲盒
const deleteBlindBox = (id) => {
  blindBoxes.value = blindBoxes.value.filter(box => box.id !== id)
  ElMessage.success('盲盒删除成功！')
}

// 保存盲盒
const saveBlindBox = async () => {
  if (!blindBoxForm.name || !blindBoxForm.price) {
    ElMessage.error('请填写完整的盲盒信息！')
    return
  }
  
  try {
    if (isEditing.value) {
      // 编辑模式
      const updatedBox = await blindBoxAPI.update(blindBoxForm.id, blindBoxForm)
      ElMessage.success('盲盒编辑成功！')
    } else {
      // 创建模式
      const newBlindBox = await blindBoxAPI.create(blindBoxForm)
      ElMessage.success('盲盒创建成功！')
    }
    // 重新加载盲盒列表
    await loadBlindBoxes()
  } catch (error) {
    ElMessage.error('操作失败，请重试！')
    console.error('保存盲盒失败:', error)
  }
  
  showCreateDialog.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(blindBoxForm, {
    id: 0,
    name: '',
    price: 0,
    type: 'infinite',
    status: 'active',
    saleTime: new Date(),
    prizes: [],
    guarantee: 0,
    maxHidden: 0
  })
  fileList.value = []
  isEditing.value = false
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出成功！')
  // 实际项目中这里应该实现导出功能
}
</script>

<style scoped>
.blind-box-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.blind-box-list {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.prize-config {
  margin-top: 10px;
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
  
  .blind-box-list {
    padding: 10px;
  }
}
</style>