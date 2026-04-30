<template>
  <div class="blind-box-card" @click="goDetail">
    <div class="card-cover">
      <img :src="box.coverImage || box.image || '/placeholder.png'" :alt="box.name" />
      <div v-if="box.tag" class="card-tag" :class="tagClass">{{ box.tag }}</div>
    </div>
    <div class="card-info">
      <h3 class="card-name">{{ box.name }}</h3>
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
    sales?: number
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

.blind-box-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-card-hover);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #FFF5F7;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blind-box-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #FFFFFF;
}

.tag-hot {
  background: linear-gradient(135deg, #FF6B9D, #FF4757);
}

.tag-new {
  background: linear-gradient(135deg, #7ED56F, #2ED573);
}

.tag-limited {
  background: linear-gradient(135deg, #FFD700, #FFA502);
}

.tag-default {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-info {
  padding: 10px 12px 12px;
}

.card-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
  min-height: 36px;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  color: var(--danger);
  font-size: 16px;
  font-weight: 700;
}

.price-symbol {
  font-size: 12px;
  font-weight: 500;
}

.card-sales {
  font-size: 11px;
  color: var(--text-light);
}
</style>
