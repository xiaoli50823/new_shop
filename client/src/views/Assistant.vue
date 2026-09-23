<template>
  <main class="assistant-page">
    <header class="assistant-header">
      <button class="back-link" @click="router.push('/')">← 返回商城</button>
      <span>盲盒星球 · 智能问答</span>
      <el-button :disabled="busy || !messages.length" @click="newChat">新对话</el-button>
    </header>

    <div class="assistant-layout">
      <aside class="assistant-sidebar">
        <span class="eyebrow">AI ASSISTANT</span>
        <h1>有问题，<br>一起找答案。</h1>
        <p>了解商城玩法，或聊聊你感兴趣的知识。</p>
        <div class="mode-options" aria-label="问答模式">
          <button :class="{ selected: mode === 'mall' }" :disabled="busy" @click="switchMode('mall')">
            <strong>商城助手</strong><span>规则说明 · 商品信息 · 使用帮助</span>
          </button>
          <button :class="{ selected: mode === 'general' }" :disabled="busy" @click="switchMode('general')">
            <strong>通用问答</strong><span>知识解答 · 学习交流 · 编程思路</span>
          </button>
        </div>
        <div class="sidebar-note">
          <strong>{{ mode === 'mall' ? '回答有据可查' : '让问题更具体一点' }}</strong>
          <p>{{ mode === 'mall' ? '结合商城知识库与部分在售商品资料回答，并展示参考来源。价格和库存以商品页面为准。' : '说明你的背景和希望得到的答案形式，能帮助助手更准确地回答。本模式不提供联网搜索。' }}</p>
        </div>
        <p class="privacy-note">对话会发送至 DeepSeek。请勿输入密码、验证码或个人敏感信息。对话仅保留在当前页面，刷新即清空。</p>
      </aside>

      <section class="conversation" aria-label="问答对话">
        <div class="conversation-top"><strong>{{ mode === 'mall' ? '商城助手' : '通用知识问答' }}</strong><span>由 DeepSeek 提供回答</span></div>
        <el-alert v-if="statusError" :title="statusError" type="error" :closable="false" show-icon />
        <el-alert v-else-if="status && (!status.enabled || !status.configured)" title="智能问答暂未开通，请联系管理员配置 DeepSeek。" type="info" :closable="false" show-icon />
        <div ref="messageList" class="message-list" role="log" aria-live="polite" :aria-busy="busy">
          <div v-if="!messages.length" class="welcome">
            <div class="welcome-mark">问</div>
            <h2>{{ mode === 'mall' ? '今天想了解什么？' : '从一个好奇的问题开始' }}</h2>
            <p>可以从下面的问题开始，也可以直接输入。</p>
            <button v-for="prompt in prompts" :key="prompt" :disabled="!ready || busy" @click="send(prompt)">{{ prompt }} <span>↗</span></button>
          </div>
          <article v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
            <span class="message-author">{{ message.role === 'user' ? '你' : '星球助手' }}</span>
            <div class="message-body">{{ message.content }}</div>
            <small v-if="message.truncated">回答达到长度上限，可以继续追问。</small>
            <small v-if="message.catalogAvailable === false">商品资料暂时不可用，本次回答仅参考商城知识库。</small>
            <details v-if="message.sources?.length" class="sources">
              <summary>参考资料 · {{ message.sources.length }} 条</summary>
              <div v-for="source in message.sources" :key="source.number" class="source">
                <router-link :to="source.path">[{{ source.number }}] {{ source.title }} ↗</router-link>
                <p>{{ source.excerpt }}</p>
              </div>
            </details>
          </article>
          <div v-if="busy" class="thinking" role="status">星球助手正在整理回答…</div>
        </div>
        <div v-if="error" class="chat-error" role="alert">{{ error }}</div>
        <form class="composer" @submit.prevent="send()">
          <label class="sr-only" for="question">输入问题</label>
          <textarea id="question" v-model="question" maxlength="2000" rows="3" :disabled="!ready || busy"
            placeholder="输入你的问题…" @keydown.enter.exact="onEnter" />
          <div class="composer-footer"><span>{{ question.length }}/2000 · Shift + Enter 换行</span><el-button type="primary" native-type="submit" :loading="busy" :disabled="!ready || !question.trim()">发送问题</el-button></div>
        </form>
        <p class="answer-note">AI 回答可能存在偏差，重要信息请核实。</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { aiAPI, type AiMode, type AiStatus, type AiSource } from '@/services/assistant'

interface Message { role: 'user' | 'assistant'; content: string; sources?: AiSource[]; truncated?: boolean; catalogAvailable?: boolean | null }
const router = useRouter()
const mode = ref<AiMode>('mall')
const question = ref('')
const messages = ref<Message[]>([])
const busy = ref(false)
const error = ref('')
const statusError = ref('')
const status = ref<AiStatus | null>(null)
const messageList = ref<HTMLElement>()
const ready = computed(() => status.value?.enabled && status.value?.configured)
let controller: AbortController | null = null
const prompts = computed(() => mode.value === 'mall'
  ? ['抽中的奖品在哪里查看？', '积分怎么获得和兑换？', '有哪些在售盲盒可以了解？']
  : ['用生活中的例子解释 Redis 缓存', '如何制定一周的学习计划？', '解释一下什么是大语言模型'])

function newChat() { if (!busy.value) { messages.value = []; error.value = ''; question.value = '' } }
function switchMode(value: AiMode) { if (!busy.value && mode.value !== value) { newChat(); mode.value = value } }
async function scrollToBottom() { await nextTick(); messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' }) }
function onEnter(event: KeyboardEvent) { if (!event.isComposing) { event.preventDefault(); void send() } }
async function send(suggestion?: string) {
  const text = (suggestion || question.value).trim()
  if (!text || busy.value || !ready.value) return
  const history = messages.value.slice(-10).map(({ role, content }) => ({ role, content }))
  while (history.reduce((sum, m) => sum + m.content.length, text.length) > 24000) history.splice(0, 2)
  busy.value = true
  error.value = ''
  question.value = ''
  messages.value.push({ role: 'user', content: text })
  void scrollToBottom()
  controller = new AbortController()
  try {
    const response = await aiAPI.chat({ message: text, mode: mode.value, history }, controller.signal)
    messages.value.push({ role: 'assistant', content: response.data.answer, sources: response.data.sources,
      truncated: response.data.truncated, catalogAvailable: response.data.catalogAvailable })
    // Keep the current session bounded; at most 30 complete turns.
    if (messages.value.length > 60) messages.value.splice(0, 2)
  } catch (err: any) {
    messages.value.pop()
    question.value = text
    if (!controller.signal.aborted) error.value = err.response?.data?.message || err.message || '发送失败，请稍后重试'
  } finally { busy.value = false; controller = null; void scrollToBottom() }
}
onMounted(async () => {
  try { status.value = (await aiAPI.status()).data }
  catch { statusError.value = '暂时无法连接问答服务，请稍后刷新页面。' }
})
onBeforeUnmount(() => controller?.abort())
</script>

<style scoped>
.assistant-page{max-width:1200px;margin:auto;padding:24px;color:var(--text-primary)}
.assistant-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:28px;color:var(--text-secondary)}
.back-link{border:0;background:none;cursor:pointer;color:var(--ink);font-size:14px}
.assistant-layout{display:grid;grid-template-columns:290px minmax(0,1fr);gap:36px;align-items:start}
.assistant-sidebar{padding:28px 0}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--ink-light)}
h1{font-size:34px;line-height:1.5;margin:16px 0} .assistant-sidebar>p{line-height:1.9;color:var(--text-secondary)}
.mode-options{display:grid;gap:12px;margin:28px 0}.mode-options button{text-align:left;border:1px solid var(--border);border-radius:12px;background:var(--white);padding:18px;cursor:pointer;color:var(--text-primary)}
.mode-options button.selected{border-color:var(--ink);background:#eef2f6}.mode-options strong,.mode-options span{display:block}.mode-options span{font-size:12px;color:var(--text-secondary);margin-top:8px}
.sidebar-note{padding-top:20px;border-top:1px solid var(--border)}.sidebar-note p{margin-top:10px;font-size:13px;line-height:1.9;color:var(--text-secondary)}.privacy-note{font-size:12px;margin-top:24px}
.conversation{background:white;border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-card)}
.conversation-top{display:flex;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border)}.conversation-top span{font-size:12px;color:var(--text-light)}
.message-list{height:480px;overflow:auto;padding:24px;scrollbar-gutter:stable}.welcome{max-width:430px;margin:20px auto;text-align:center}.welcome-mark{display:grid;place-items:center;width:48px;height:48px;background:#eef2f6;color:var(--ink);border-radius:14px;margin:0 auto 20px;font-size:22px}.welcome h2{font-size:22px}.welcome>p{color:var(--text-secondary);margin:12px 0 24px}.welcome button{display:flex;justify-content:space-between;width:100%;padding:16px;margin:10px 0;border:1px solid var(--border);border-radius:10px;background:var(--beige);text-align:left;cursor:pointer;color:var(--ink)}
.message{margin-bottom:24px;max-width:95%}.message.user{margin-left:auto}.message-author{display:block;margin-bottom:8px;color:var(--text-secondary);font-size:12px}.user .message-author{text-align:right}.message-body{padding:16px 18px;border-radius:12px;background:var(--beige);line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere}.user .message-body{background:#edf2f7}.message small{display:block;color:var(--text-secondary);margin-top:8px;line-height:1.6}.sources{margin-top:12px;font-size:12px}.sources summary{cursor:pointer;color:var(--ink)}.source{padding:10px 0;border-bottom:1px solid var(--border-light)}.source a{color:var(--ink);font-weight:500}.source p{color:var(--text-secondary);line-height:1.7;margin-top:6px}.thinking{color:var(--ink-light);padding:12px}.chat-error{color:var(--danger);padding:12px 24px;background:#fff5f5;line-height:1.7}
.composer{margin:0 20px;border:1px solid var(--border);border-radius:12px;padding:12px}.composer:focus-within{border-color:var(--ink-light)}.composer textarea{display:block;width:100%;resize:vertical;min-height:65px;max-height:200px;font:inherit;line-height:1.6;border:0;outline:none;background:transparent}.composer-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}.composer-footer span{font-size:11px;color:var(--text-light)}.answer-note{text-align:center;padding:12px;color:var(--text-light);font-size:11px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}button:disabled{opacity:.6;cursor:not-allowed}
@media(max-width:760px){.assistant-page{padding:16px}.assistant-header{margin-bottom:16px}.assistant-header>span{display:none}.assistant-layout{grid-template-columns:1fr;gap:16px}.assistant-sidebar{padding:0}.eyebrow,h1,.assistant-sidebar>p:not(.privacy-note),.sidebar-note{display:none}.privacy-note{margin-top:12px;font-size:11px}.mode-options{grid-template-columns:1fr 1fr;margin:0;gap:8px}.mode-options button{padding:12px}.mode-options span{font-size:10px;line-height:1.6}.message-list{height:48vh;padding:16px}.conversation-top{padding:16px}.composer{margin:0 12px}.composer-footer span{font-size:10px}.welcome{margin:5px auto}.welcome h2{font-size:19px}}
</style>
