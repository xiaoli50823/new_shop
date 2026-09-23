<template>
  <div class="cache-page">
    <div class="heading"><div><h2>缓存与智能问答</h2><p>查看 Redis 缓存状态和 DeepSeek 接入状态。</p></div><el-button :loading="loading" @click="refresh">刷新状态</el-button></div>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <el-card v-if="cache" class="status-card">
      <template #header><div class="card-heading"><strong>Redis 缓存</strong><el-tag :type="cache.connected ? 'success' : 'warning'">{{ cache.connected ? '已连接' : cache.enabled ? '未连接 · 查询回退 MySQL' : '已关闭' }}</el-tag></div></template>
      <div class="metrics"><div><strong>{{ cache.hitRate }}%</strong><span>缓存命中率</span></div><div><strong>{{ cache.stats.hits }}</strong><span>命中次数</span></div><div><strong>{{ cache.stats.misses }}</strong><span>未命中次数</span></div><div><strong>{{ cache.stats.bypasses }}</strong><span>降级次数</span></div></div>
      <p class="muted">{{ cache.statsScope }}。命中率 = 命中 /（命中 + 未命中）。</p>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="键前缀">{{ cache.keyPrefix }}</el-descriptions-item>
        <el-descriptions-item label="默认缓存时间">{{ cache.defaultTtlSeconds }} 秒（各接口可覆盖）</el-descriptions-item>
        <el-descriptions-item label="覆盖范围">盲盒列表和详情、分类、周边商品、积分商品、问答商品资料</el-descriptions-item>
        <el-descriptions-item label="失效次数 / 错误次数">{{ cache.stats.invalidations }} / {{ cache.stats.errors }}</el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="cache.lastError" :title="cache.lastError" type="warning" :closable="false" />
      <div class="cache-actions"><p>修改商品或完成抽盒后会自动失效缓存。手动刷新后，旧缓存将按过期时间回收。</p><el-button type="primary" :disabled="!cache.connected" :loading="clearing" @click="clearCache">刷新全部商品缓存</el-button></div>
    </el-card>
    <el-card v-if="ai" class="status-card">
      <template #header><div class="card-heading"><strong>DeepSeek 智能问答</strong><el-tag :type="ai.enabled && ai.configured ? 'success' : 'info'">{{ ai.enabled && ai.configured ? '已配置（需实际提问验证）' : '待配置' }}</el-tag></div></template>
      <p>模型：{{ ai.model }} · 支持商城助手和通用问答</p>
      <p class="muted">在后端 server/.env 中配置 DEEPSEEK_API_KEY 后重启服务。密钥仅保存在后端。</p>
      <el-button @click="router.push('/assistant')">打开智能问答</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { aiAPI, cacheAPI, type AiStatus, type CacheStatus } from '@/services/assistant'
const router = useRouter()
const cache = ref<CacheStatus | null>(null)
const ai = ref<AiStatus | null>(null)
const loading = ref(false)
const clearing = ref(false)
const error = ref('')
async function refresh() {
  loading.value = true; error.value = ''
  try { const [c, a] = await Promise.all([cacheAPI.status(), aiAPI.status()]); cache.value = c.data; ai.value = a.data }
  catch (err: any) { error.value = err.response?.data?.message || '获取服务状态失败' }
  finally { loading.value = false }
}
async function clearCache() {
  clearing.value = true
  try { await cacheAPI.clear(); ElMessage.success('缓存已刷新'); await refresh() }
  catch { /* API interceptor displays the error. */ }
  finally { clearing.value = false }
}
onMounted(refresh)
</script>

<style scoped>
.cache-page{max-width:1100px}.heading,.card-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}.heading{margin-bottom:24px}.heading p,.muted{color:var(--text-secondary);margin:12px 0;font-size:13px;line-height:1.8}.status-card{margin:20px 0}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metrics>div{padding:20px;background:var(--beige);border-radius:10px}.metrics strong,.metrics span{display:block}.metrics strong{font-size:28px;color:var(--ink)}.metrics span{font-size:13px;color:var(--text-secondary);margin-top:8px}.cache-actions{margin-top:20px}.cache-actions p{color:var(--text-secondary);font-size:13px;line-height:1.8;margin-bottom:12px}@media(max-width:700px){.metrics{grid-template-columns:repeat(2,1fr)}.heading,.card-heading{align-items:flex-start;flex-direction:column}}
</style>
