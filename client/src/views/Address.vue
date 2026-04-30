<template>
  <div class="address-page">
    <!-- 顶部 -->
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h2>收货地址</h2>
      <div></div>
    </div>

    <!-- 地址列表 -->
    <div v-loading="loading" class="address-list">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="address-card"
      >
        <div class="address-content" @click="selectAddress(addr)">
          <div class="address-top">
            <span class="address-name">{{ addr.name }}</span>
            <span class="address-phone">{{ formatPhone(addr.phone) }}</span>
            <span v-if="addr.isDefault" class="default-tag">默认</span>
          </div>
          <p class="address-detail">
            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
          </p>
        </div>
        <div class="address-actions">
          <span class="action-btn" @click="setDefault(addr)" v-if="!addr.isDefault">
            设为默认
          </span>
          <span class="action-btn" @click="editAddress(addr)">编辑</span>
          <span class="action-btn delete" @click="deleteAddress(addr)">删除</span>
        </div>
      </div>

      <el-empty v-if="!loading && addresses.length === 0" description="暂无收货地址" />
    </div>

    <!-- 新增按钮 -->
    <div class="add-btn-wrapper safe-bottom">
      <el-button type="primary" round class="add-btn" @click="showDialog = true; resetForm()">
        + 新增收货地址
      </el-button>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="editingId ? '编辑地址' : '新增地址'"
      width="90%"
    >
      <el-form :model="form" label-width="70px">
        <el-form-item label="收货人">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" type="tel" />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="form.province" placeholder="省份" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city" placeholder="城市" />
        </el-form-item>
        <el-form-item label="区县">
          <el-input v-model="form.district" placeholder="区县" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detail" placeholder="请输入详细地址" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { addressAPI } from '@/services/api'
import { formatPhone } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const addresses = ref<any[]>([])

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const goBack = () => router.back()

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.phone = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.detail = ''
  form.isDefault = false
}

const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await addressAPI.getList()
    addresses.value = res.data?.list || res.data || res.list || []
  } catch {
    addresses.value = []
  } finally {
    loading.value = false
  }
}

const saveAddress = async () => {
  if (!form.name.trim()) { ElMessage.warning('请输入收货人'); return }
  if (!form.phone.trim()) { ElMessage.warning('请输入手机号'); return }
  if (!form.detail.trim()) { ElMessage.warning('请输入详细地址'); return }

  saving.value = true
  try {
    if (editingId.value) {
      await addressAPI.update(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await addressAPI.create({ ...form })
      ElMessage.success('添加成功')
    }
    showDialog.value = false
    fetchAddresses()
  } catch {} finally {
    saving.value = false
  }
}

const editAddress = (addr: any) => {
  editingId.value = addr.id
  form.name = addr.name
  form.phone = addr.phone
  form.province = addr.province || ''
  form.city = addr.city || ''
  form.district = addr.district || ''
  form.detail = addr.detail
  form.isDefault = addr.isDefault || false
  showDialog.value = true
}

const deleteAddress = async (addr: any) => {
  try {
    await ElMessageBox.confirm('确认删除该地址？', '删除确认')
    await addressAPI.remove(addr.id)
    ElMessage.success('删除成功')
    fetchAddresses()
  } catch {}
}

const setDefault = async (addr: any) => {
  try {
    await addressAPI.setDefault(addr.id)
    ElMessage.success('已设为默认')
    fetchAddresses()
  } catch {}
}

const selectAddress = (_addr: any) => {
  // 如果是从其他页面跳转来选择地址的
  // 可以在这里处理回传
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background: var(--bg-pink);
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h2 {
  font-size: 17px;
  font-weight: 600;
}

.back-icon {
  font-size: 22px;
  cursor: pointer;
  color: var(--text-primary);
}

.address-list {
  padding: 12px 16px;
  min-height: 300px;
}

.address-card {
  background: #FFFFFF;
  border-radius: var(--radius-card);
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-card);
}

.address-content {
  cursor: pointer;
  margin-bottom: 10px;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.address-name {
  font-size: 15px;
  font-weight: 600;
}

.address-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

.default-tag {
  padding: 2px 8px;
  background: var(--primary-gradient);
  color: #FFFFFF;
  font-size: 10px;
  border-radius: 10px;
  font-weight: 500;
}

.address-detail {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-btn.delete {
  color: var(--danger);
}

.add-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  padding: 12px 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.add-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-btn);
}
</style>
