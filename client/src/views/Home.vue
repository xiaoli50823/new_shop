<template>
  <div class="home">
    <!-- 轮播海报 -->
    <div class="carousel">
      <el-carousel :interval="5000" type="card" height="220px">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <img :src="item.image" :alt="item.title" class="carousel-img">
          <div class="carousel-overlay"></div>
          <div class="carousel-text">{{ item.title }}</div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 游戏化跑马灯播报 -->
    <div class="broadcast">
      <div class="broadcast-icon">🎉</div>
      <div class="broadcast-wrapper">
        <div class="broadcast-content">
          <span v-for="(msg, index) in broadcastMessages" :key="index" class="broadcast-item">
            {{ msg }}
          </span>
        </div>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="recommend-section">
      <h2 class="section-title">
        <span class="title-cn">热门周边</span>
        <span class="title-en">HOT ACCESSORIES</span>
      </h2>
      <div class="waterfall">
        <div v-for="(item, index) in recommendItems" :key="index" class="waterfall-item">
          <div class="item-tag" :class="'tag-' + item.tag">{{ item.tagText }}</div>
          <img :src="item.image" :alt="item.name" class="waterfall-img">
          <h4>{{ item.name }}</h4>
          <div class="price-row">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ item.price }}</span>
          </div>
          <button class="buy-btn" @click="buyItem(item)">立即购买</button>
        </div>
      </div>
    </div>

    <!-- 盲盒专区 -->
    <div class="blind-box-section">
      <h2 class="section-title">
        <span class="title-cn">盲盒专区</span>
        <span class="title-en">BLIND BOX ZONE</span>
      </h2>
      <div class="blind-box-types">
        <div class="blind-box-type">
          <h3 class="type-title">一番赏/抽赏</h3>
          <div class="blind-box-list">
            <div v-for="(box, index) in one赏Boxes" :key="index" class="blind-box-card">
              <div class="item-tag" :class="'tag-' + box.tag">{{ box.tagText }}</div>
              <img :src="box.image" :alt="box.name" class="blind-box-img">
              <h4>{{ box.name }}</h4>
              <p class="box-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ box.price }}</span>
              </p>
              <div class="stock-info">
                <span class="stock-text">剩余 {{ box.stock }} 个</span>
                <div class="stock-progress">
                  <div class="stock-bar" :style="{ width: box.stockPercentage + '%' }"></div>
                </div>
                <span v-if="box.stock <= 50" class="last-reward">LAST赏!</span>
              </div>
              <button class="action-btn" @click="goToBlindBox(box.id)">
                立即开赏
              </button>
            </div>
          </div>
        </div>

        <div class="blind-box-type">
          <h3 class="type-title">无限盲盒</h3>
          <div class="blind-box-list">
            <div v-for="(box, index) in infiniteBoxes" :key="index" class="blind-box-card">
              <div class="item-tag" :class="'tag-' + box.tag">{{ box.tagText }}</div>
              <img :src="box.image" :alt="box.name" class="blind-box-img">
              <h4>{{ box.name }}</h4>
              <p class="box-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ box.price }}</span>
              </p>
              <button class="action-btn" @click="goToBlindBox(box.id)">
                去抽盒
              </button>
            </div>
          </div>
        </div>

        <div class="blind-box-type">
          <h3 class="type-title">哈希盲盒</h3>
          <div class="blind-box-list">
            <div v-for="(box, index) in hashBoxes" :key="index" class="blind-box-card">
              <div class="item-tag" :class="'tag-' + box.tag">{{ box.tagText }}</div>
              <img :src="box.image" :alt="box.name" class="blind-box-img">
              <h4>{{ box.name }}</h4>
              <p class="box-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ box.price }}</span>
              </p>
              <button class="action-btn" @click="goToBlindBox(box.id)">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { blindBoxAPI, productAPI } from '../services/api'

const router = useRouter()

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    const [blindBoxRes, productRes] = await Promise.all([
      blindBoxAPI.getList().catch(() => []),
      productAPI.getRecommendList().catch(() => [])
    ])

    if (Array.isArray(blindBoxRes) && blindBoxRes.length > 0) {
      categorizeBoxes(blindBoxRes)
    }

    if (Array.isArray(productRes) && productRes.length > 0) {
      recommendItems.value = productRes
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const categorizeBoxes = (boxes: any[]) => {
  const one赏: any[] = []
  const infinite: any[] = []
  const hash: any[] = []

  boxes.forEach((box: any) => {
    const item = {
      id: box._id || box.id,
      name: box.name,
      price: box.price,
      image: box.image || box.coverImage,
      stock: box.stock || 0,
      stockPercentage: box.stockPercentage || 50,
      tag: box.tag || 'hot',
      tagText: box.tagText || '热门'
    }

    if (box.type === 'lottery') {
      one赏.push(item)
    } else if (box.type === 'infinite') {
      infinite.push(item)
    } else if (box.type === 'hash') {
      hash.push(item)
    }
  })

  if (one赏.length > 0) one赏Boxes.value = one赏
  if (infinite.length > 0) infiniteBoxes.value = infinite
  if (hash.length > 0) hashBoxes.value = hash
}

// 轮播图数据
const carouselItems = ref([
  {
    image: 'https://img.freepik.com/free-vector/gradient-chinese-new-year-illustration_23-2149565323.jpg',
    title: '全新海贼王盲盒系列'
  },
  {
    image: 'https://img.freepik.com/free-vector/gradient-anime-style-background_23-2149954369.jpg',
    title: '鬼灭之刃一番赏'
  },
  {
    image: 'https://img.freepik.com/free-vector/cyberpunk-style-futuristic-background_23-2149829765.jpg',
    title: '赛博朋克2077盲盒'
  }
])

// 跑马灯播报
const broadcastMessages = ref([
  '🎉 恭喜用户 138****8888 抽中 [隐藏款·黄金海贼王]！',
  '🎉 恭喜用户 159****6666 抽中 [稀有款·鬼灭之刃炭治郎]！',
  '🎉 恭喜用户 186****9999 抽中 [隐藏款·独角兽]！',
  '🎉 恭喜用户 137****5555 抽中 [稀有款·初音未来]！'
])

// 推荐商品
const recommendItems = ref([
  {
    id: 1,
    name: '盲盒专用展示盒',
    price: 29,
    image: 'https://img.freepik.com/free-photo/empty-transparent-plastic-display-case_23-2149193136.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 2,
    name: '手办清洁套装',
    price: 19,
    image: 'https://img.freepik.com/free-photo/cleaning-brush-set-arrangement_23-2149307013.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 3,
    name: '盲盒专用灯',
    price: 39,
    image: 'https://img.freepik.com/free-photo/led-light-strip-on-white-background_23-2149185163.jpg',
    tag: 'discount',
    tagText: '折扣'
  },
  {
    id: 4,
    name: '手办收纳袋',
    price: 15,
    image: 'https://img.freepik.com/free-photo/protective-storage-bags-arrangement_23-2149307009.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 5,
    name: '盲盒展示架',
    price: 49,
    image: 'https://img.freepik.com/free-photo/wooden-display-shelf-empty_23-2149253841.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 6,
    name: '手办底座',
    price: 12,
    image: 'https://img.freepik.com/free-photo/white-plastic-display-stands_23-2149185158.jpg',
    tag: 'discount',
    tagText: '折扣'
  }
])

// 一番赏盲盒
const one赏Boxes = ref([
  {
    id: 1,
    name: '海贼王一番赏',
    price: 39,
    image: 'https://img.freepik.com/free-photo/anime-action-figures-collection_23-2149307011.jpg',
    stock: 128,
    stockPercentage: 60,
    tag: 'limited',
    tagText: '限量'
  },
  {
    id: 2,
    name: '鬼灭之刃一番赏',
    price: 49,
    image: 'https://img.freepik.com/free-photo/anime-character-figures_23-2149307007.jpg',
    stock: 88,
    stockPercentage: 45,
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 3,
    name: '龙珠一番赏',
    price: 45,
    image: 'https://img.freepik.com/free-photo/dragon-ball-action-figures_23-2149307005.jpg',
    stock: 156,
    stockPercentage: 70,
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 4,
    name: '火影忍者一番赏',
    price: 42,
    image: 'https://img.freepik.com/free-photo/naruto-action-figures_23-2149307003.jpg',
    stock: 45,
    stockPercentage: 30,
    tag: 'warning',
    tagText: '告急'
  }
])

// 无限盲盒
const infiniteBoxes = ref([
  {
    id: 5,
    name: '潮玩手办盲盒',
    price: 29,
    image: 'https://img.freepik.com/free-photo/trendy-toy-collection_23-2149307012.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 6,
    name: '美妆盲盒',
    price: 59,
    image: 'https://img.freepik.com/free-photo/beauty-products-collection_23-2148897904.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 7,
    name: '3C数码盲盒',
    price: 99,
    image: 'https://img.freepik.com/free-photo/electronic-gadgets-collection_23-2149307010.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 8,
    name: '文具盲盒',
    price: 19,
    image: 'https://img.freepik.com/free-photo/stationery-items-collection_23-2149307008.jpg',
    tag: 'discount',
    tagText: '折扣'
  },
  {
    id: 9,
    name: '零食盲盒',
    price: 39,
    image: 'https://img.freepik.com/free-photo/snack-collection-assortment_23-2149307006.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 10,
    name: '宠物用品盲盒',
    price: 49,
    image: 'https://img.freepik.com/free-photo/pet-supplies-collection_23-2149307004.jpg',
    tag: 'hot',
    tagText: '热门'
  }
])

// 哈希盲盒
const hashBoxes = ref([
  {
    id: 11,
    name: '区块链数字盲盒',
    price: 199,
    image: 'https://img.freepik.com/free-photo/cryptocurrency-concept-with-bitcoin_23-2149307002.jpg',
    tag: 'limited',
    tagText: '限量'
  },
  {
    id: 12,
    name: 'NFT艺术盲盒',
    price: 299,
    image: 'https://img.freepik.com/free-photo/digital-art-nft-concept_23-2149307000.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 13,
    name: '元宇宙盲盒',
    price: 399,
    image: 'https://img.freepik.com/free-photo/metaverse-virtual-reality-concept_23-2149306998.jpg',
    tag: 'limited',
    tagText: '限量'
  },
  {
    id: 14,
    name: '数字艺术盲盒',
    price: 159,
    image: 'https://img.freepik.com/free-photo/digital-creative-artwork_23-2149306996.jpg',
    tag: 'new',
    tagText: '上新'
  }
])

// 跳转到盲盒详情
const goToBlindBox = (id: number) => {
  router.push(`/blind-box/${id}`)
}

// 购买商品
const buyItem = (item: any) => {
  ElMessage.success(`已添加 ${item.name} 到背包`)
  // 这里可以添加实际的购买逻辑，比如加入背包或跳转到支付页面
}
</script>

<style scoped>
.home {
  padding: 30px 16px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

/* 轮播图 */
.carousel {
  margin-bottom: 30px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.carousel-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 16px;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}

.carousel-text {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 跑马灯 */
.broadcast {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 40px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.broadcast-icon {
  font-size: 24px;
  margin-right: 20px;
  animation: bounce 2s infinite;
}

.broadcast-wrapper {
  flex: 1;
  overflow: hidden;
}

.broadcast-content {
  display: flex;
  animation: scroll 20s linear infinite;
}

.broadcast-item {
  white-space: nowrap;
  margin-right: 60px;
  color: #333333;
  font-weight: 500;
  font-size: 14px;
}

@keyframes scroll {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 推荐商品 */
.recommend-section {
  margin-bottom: 50px;
}

.section-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 16px;
  border-bottom: 2px solid #F0F0F0;
}

.title-cn {
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  line-height: 1.2;
}

.title-en {
  font-size: 12px;
  color: #999999;
  letter-spacing: 2px;
  margin-top: 4px;
  font-weight: 500;
}

.waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.waterfall-item {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.waterfall-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
}

.waterfall-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  margin-bottom: 16px;
  border-radius: 12px;
  background: #F8F9FA;
}

.waterfall-item h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333333;
  line-height: 1.4;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
}

.price-symbol {
  font-size: 14px;
  color: #00BCD4;
  margin-right: 4px;
  font-weight: 500;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #333333;
  font-family: 'Inter', sans-serif;
}

.buy-btn {
  width: 100%;
  padding: 10px;
  background: #00BCD4;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  margin-top: auto;
}

.buy-btn:hover {
  background: #00ACC1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

/* 盲盒专区 */
.blind-box-section {
  margin-bottom: 50px;
}

.blind-box-types {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.type-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333333;
}

.blind-box-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.blind-box-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.blind-box-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
}

.blind-box-img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  margin-bottom: 16px;
  border-radius: 12px;
  background: #F8F9FA;
}

.blind-box-card h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333333;
  height: 48px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.box-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  justify-content: center;
}

.stock-info {
  width: 100%;
  margin-bottom: 20px;
}

.stock-text {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666666;
}

.stock-progress {
  width: 100%;
  height: 8px;
  background: #F0F0F0;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.stock-bar {
  height: 100%;
  background: #00BCD4;
  border-radius: 4px;
  transition: width 0.3s;
}

.last-reward {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #00BCD4;
  animation: flash 1s infinite;
}

.action-btn {
  width: 100%;
  padding: 12px;
  background: #FFFFFF;
  color: #00BCD4;
  border: 2px solid #00BCD4;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: auto;
  font-size: 14px;
}

.action-btn:hover {
  background: #00BCD4;
  color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 188, 212, 0.3);
}

/* 状态标签 */
.item-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

.tag-hot {
  background: #E3F2FD;
  color: #00BCD4;
}

.tag-new {
  background: #E8F5E9;
  color: #4CAF50;
}

.tag-discount {
  background: #FFF3E0;
  color: #FF9800;
}

.tag-warning {
  background: #FFEBEE;
  color: #F44336;
  animation: flash 1s infinite;
}

.tag-limited {
  background: #F3E5F5;
  color: #9C27B0;
}

@keyframes flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.6; }
}

/* 响应式 */
@media (max-width: 768px) {
  .home {
    padding: 20px 16px;
  }

  .carousel {
    height: 180px;
  }

  .carousel-img {
    height: 180px;
  }

  .broadcast {
    padding: 12px 16px;
    margin-bottom: 30px;
  }

  .title-cn {
    font-size: 24px;
  }

  .title-en {
    font-size: 11px;
  }

  .waterfall {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .waterfall-img {
    height: 150px;
  }

  .blind-box-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .blind-box-img {
    width: 130px;
    height: 130px;
  }

  .blind-box-card {
    padding: 16px;
  }

  .blind-box-types {
    gap: 30px;
  }
}

@media (min-width: 1024px) {
  .waterfall {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .blind-box-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>