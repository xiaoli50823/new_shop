<template>
  <div class="system-settings">
    <div class="card">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form ref="basicFormRef" :model="basicForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="basicForm.siteName" placeholder="请输入站点名称" />
            </el-form-item>
            <el-form-item label="站点描述" prop="siteDesc">
              <el-input v-model="basicForm.siteDesc" type="textarea" :rows="3" placeholder="请输入站点描述" />
            </el-form-item>
            <el-form-item label="联系方式" prop="contact">
              <el-input v-model="basicForm.contact" placeholder="请输入联系方式" />
            </el-form-item>
            <el-form-item label="客服链接" prop="serviceUrl">
              <el-input v-model="basicForm.serviceUrl" placeholder="请输入客服链接" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveBasic">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: 支付设置 -->
        <el-tab-pane label="支付设置" name="payment">
          <div class="section-block">
            <h4>支付方式配置</h4>
            <el-form label-width="140px" style="max-width: 600px">
              <el-form-item label="微信支付">
                <el-switch v-model="paymentForm.wechat" active-text="启用" inactive-text="禁用" />
              </el-form-item>
              <el-form-item label="支付宝">
                <el-switch v-model="paymentForm.alipay" active-text="启用" inactive-text="禁用" />
              </el-form-item>
              <el-form-item label="Apple Pay">
                <el-switch v-model="paymentForm.applePay" active-text="启用" inactive-text="禁用" />
              </el-form-item>
            </el-form>
          </div>
          <el-divider />
          <div class="section-block">
            <h4>充值金额选项</h4>
            <div class="recharge-options">
              <el-tag
                v-for="(amount, idx) in paymentForm.rechargeOptions"
                :key="idx"
                closable
                size="large"
                style="margin: 0 8px 8px 0"
                @close="removeRechargeOption(idx)"
              >
                ¥{{ amount }}
              </el-tag>
              <el-input
                v-if="showRechargeInput"
                ref="rechargeInputRef"
                v-model="newRechargeAmount"
                size="small"
                style="width: 100px"
                placeholder="金额"
                @keyup.enter="addRechargeOption"
                @blur="addRechargeOption"
              />
              <el-button v-else size="small" @click="showRechargeInput = true; $nextTick(() => rechargeInputRef?.focus())">
                + 添加金额
              </el-button>
            </div>
          </div>
          <el-divider />
          <el-button type="primary" :loading="saving" @click="savePayment">保存设置</el-button>
        </el-tab-pane>

        <!-- Tab 3: 短信设置 -->
        <el-tab-pane label="短信设置" name="sms">
          <el-form ref="smsFormRef" :model="smsForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="短信服务商" prop="provider">
              <el-select v-model="smsForm.provider" placeholder="请选择" style="width: 100%">
                <el-option label="阿里云短信" value="aliyun" />
                <el-option label="腾讯云短信" value="tencent" />
                <el-option label="华为云短信" value="huawei" />
              </el-select>
            </el-form-item>
            <el-form-item label="AccessKey" prop="accessKey">
              <el-input v-model="smsForm.accessKey" placeholder="请输入AccessKey" />
            </el-form-item>
            <el-form-item label="AccessSecret" prop="accessSecret">
              <el-input v-model="smsForm.accessSecret" type="password" show-password placeholder="请输入AccessSecret" />
            </el-form-item>
            <el-form-item label="短信签名" prop="signName">
              <el-input v-model="smsForm.signName" placeholder="请输入短信签名" />
            </el-form-item>
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="smsForm.templateId" placeholder="请输入模板ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveSms">保存设置</el-button>
              <el-button @click="testSms">发送测试短信</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 4: 操作日志 -->
        <el-tab-pane label="操作日志" name="logs">
          <div class="log-filter">
            <el-input
              v-model="logSearch"
              placeholder="搜索操作人/详情"
              clearable
              style="width: 240px"
              @keyup.enter="loadLogs"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="logType" placeholder="操作类型" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="登录" value="login" />
              <el-option label="创建" value="create" />
              <el-option label="编辑" value="update" />
              <el-option label="删除" value="delete" />
              <el-option label="设置" value="setting" />
            </el-select>
            <el-button @click="loadLogs">查询</el-button>
          </div>
          <el-table :data="logList" stripe border v-loading="logLoading" style="width: 100%; margin-top: 16px">
            <el-table-column prop="time" label="时间" width="170" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="type" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="logTypeMap[row.type]?.type || 'info'" size="small">
                  {{ logTypeMap[row.type]?.label || row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="详情" min-width="250" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="140" />
          </el-table>
          <div class="table-footer">
            <el-pagination
              v-model:current-page="logPage"
              v-model:page-size="logPageSize"
              :total="logTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadLogs"
              @current-change="loadLogs"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import api from '../../services/api'

const activeTab = ref('basic')
const saving = ref(false)

// 基本设置
const basicFormRef = ref<FormInstance>()
const basicForm = reactive({
  siteName: '',
  siteDesc: '',
  contact: '',
  serviceUrl: ''
})

// 支付设置
const paymentForm = reactive({
  wechat: true,
  alipay: true,
  applePay: false,
  rechargeOptions: [10, 30, 50, 100, 200, 500] as number[]
})
const showRechargeInput = ref(false)
const newRechargeAmount = ref('')
const rechargeInputRef = ref<any>()

const removeRechargeOption = (idx: number) => {
  paymentForm.rechargeOptions.splice(idx, 1)
}

const addRechargeOption = () => {
  const val = Number(newRechargeAmount.value)
  if (val > 0 && !paymentForm.rechargeOptions.includes(val)) {
    paymentForm.rechargeOptions.push(val)
    paymentForm.rechargeOptions.sort((a, b) => a - b)
  }
  showRechargeInput.value = false
  newRechargeAmount.value = ''
}

// 短信设置
const smsFormRef = ref<FormInstance>()
const smsForm = reactive({
  provider: 'aliyun',
  accessKey: '',
  accessSecret: '',
  signName: '',
  templateId: ''
})

// 操作日志
const logLoading = ref(false)
const logSearch = ref('')
const logType = ref('')
const logPage = ref(1)
const logPageSize = ref(20)
const logTotal = ref(0)
const logList = ref<any[]>([])

const logTypeMap: Record<string, { type: string; label: string }> = {
  login: { type: 'success', label: '登录' },
  create: { type: '', label: '创建' },
  update: { type: 'warning', label: '编辑' },
  delete: { type: 'danger', label: '删除' },
  setting: { type: 'info', label: '设置' }
}

const saveBasic = async () => {
  saving.value = true
  try {
    await api.put('/settings/basic', { ...basicForm })
    ElMessage.success('基本设置保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const savePayment = async () => {
  saving.value = true
  try {
    await api.put('/settings/payment', { ...paymentForm })
    ElMessage.success('支付设置保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const saveSms = async () => {
  saving.value = true
  try {
    await api.put('/settings/sms', { ...smsForm })
    ElMessage.success('短信设置保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const testSms = async () => {
  try {
    await api.post('/settings/sms/test')
    ElMessage.success('测试短信发送成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '发送失败')
  }
}

const loadLogs = async () => {
  logLoading.value = true
  try {
    const res: any = await api.get('/settings/logs', {
      params: {
        page: logPage.value,
        pageSize: logPageSize.value,
        keyword: logSearch.value,
        type: logType.value
      }
    })
    const data = res?.data || res || {}
    logList.value = (data.list || data || []).map((l: any) => ({
      ...l,
      id: l._id || l.id
    }))
    logTotal.value = data.total || logList.value.length
  } catch {
    logList.value = []
    logTotal.value = 0
  } finally {
    logLoading.value = false
  }
}

const loadSettings = async () => {
  try {
    const res: any = await api.get('/settings')
    const data = res?.data || res || {}
    if (data.basic) {
      Object.assign(basicForm, data.basic)
    }
    if (data.payment) {
      Object.assign(paymentForm, data.payment)
    }
    if (data.sms) {
      Object.assign(smsForm, data.sms)
    }
  } catch {
    // 使用默认值
  }
}

onMounted(() => {
  loadSettings()
  loadLogs()
})
</script>

<style scoped>
.system-settings {
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

.section-block {
  margin-bottom: 20px;
}

.section-block h4 {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.recharge-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.log-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
