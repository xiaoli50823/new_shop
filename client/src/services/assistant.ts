import api from './api'

export type AiMode = 'mall' | 'general'
export interface AiStatus { enabled: boolean; configured: boolean; provider: string; model: string; modes: AiMode[] }
export interface AiSource { number: number; title: string; path: string; excerpt: string }
interface ApiResult<T> { code: number; data: T; message: string }
interface ChatResult { answer: string; sources: AiSource[]; truncated: boolean; catalogAvailable: boolean | null }
export const aiAPI = {
  status: () => api.get('/ai/status') as unknown as Promise<ApiResult<AiStatus>>,
  chat: (data: { message: string; mode: AiMode; history: { role: string; content: string }[] }, signal: AbortSignal) =>
    api.post('/ai/chat', data, { timeout: 60000, signal }) as unknown as Promise<ApiResult<ChatResult>>
}
export interface CacheStatus {
  enabled: boolean; connected: boolean; connectedAt: string | null; lastError: string | null;
  keyPrefix: string; defaultTtlSeconds: number; hitRate: number; statsScope: string;
  stats: { hits: number; misses: number; bypasses: number; errors: number; invalidations: number }
}
export const cacheAPI = {
  status: () => api.get('/cache/status') as unknown as Promise<ApiResult<CacheStatus>>,
  clear: () => api.delete('/cache') as unknown as Promise<ApiResult<{ invalidated: boolean }>>
}
