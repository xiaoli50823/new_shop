<template>
  <div class="blind-box-card" @click="goDetail">
    <div class="card-cover">
      <img :src="box.coverImage || box.image || '/placeholder.png'" :alt="box.name" />
      <div v-if="box.tag" class="card-tag" :class="tagClass">{{ box.tagText || box.tag }}</div>
      <div v-if="box.stockPercentage !== undefined && box.stockPercentage < 30" class="stock-warning">
        仅剩 {{ box.stockPercentage }}%
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-name">{{ box.name }}</h3>
      <div v-if="box.stockPercentage !== undefined" class="stock-bar">
        <div class="stock-fill" :style="{ width: box.stockPercentage + '%' }"></div>
      </div>
      <div class="card-bottom">
        <span class="card-price">
          <span class="price-symbol">¥</span>{{ formatPrice(box.price) }}
        </span>
        <span v-if="box.sales !== undefined" class="card-sales">已售{{ formatCount(box.sales) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice, formatCount } from '@/utils/format'

const props = defineProps<{
  box: {
    id: number | string
    name: string
    price: number
    coverImage?: string
    image?: string
    tag?: string
    tagText?: string
    sales?: number
    stockPercentage?: number
    stock?: number
  }
}>()

const router = useRouter()

const tagClass = computed(() => {
  const tag = props.box.tag
  if (tag === '热门' || tag === 'hot') return 'tag-hot'
  if (tag === '新品' || tag === 'new') return 'tag-new'
  if (tag === '限量' || tag === 'limited') return 'tag-limited'
  return 'tag-default'
})

const goDetail = () => {
  router.push(`/blind-box/${props.box.id}`)
}
</script>

<style scoped>
.blind-box-card {
  background: #FFFFFF;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
}

.blind-box-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f8fafc;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.blind-box-card:hover .card-cover img {
  transform: scale(1.1);
}

.card-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
  z-index: 2;
}

.tag-hot {
  background: var(--ink);
}

.tag-new {
  background: var(--ink);
}

.tag-limited {
  background: var(--ink);
}

.tag-default {
  background: var(--ink);
}

.stock-warning {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  z-index: 2;
}

.card-info {
  padding: 14px 16px 16px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
  min-height: 42px;
}

.stock-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-bottom: 10px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: var(--ink);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
}

.card-sales {
  font-size: 12px;
  color: var(--text-light);
}
</style>