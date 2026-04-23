<template>
  <div class="blind-box-detail">
    <!-- 商品信息 -->
    <div class="product-info">
      <img :src="blindBox.image" :alt="blindBox.name" class="product-img">
      <div class="product-details">
        <h1>{{ blindBox.name }}</h1>
        <p class="price">¥{{ blindBox.price }}/次</p>
        <p class="description">{{ blindBox.description }}</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="singleDraw">单抽</el-button>
          <el-button type="success" size="large" @click="fiveDraw">五连抽（必得稀有）</el-button>
          <el-button type="warning" size="large" @click="tenDraw">十连抽</el-button>
        </div>
      </div>
    </div>

    <!-- 奖池展示 -->
    <div class="prize-pool">
      <h2 class="section-title">奖池展示</h2>
      <div class="prize-list">
        <div v-for="prize in blindBox.prizes" :key="prize.id" class="prize-item">
          <img :src="prize.image" :alt="prize.name" class="prize-img">
          <h3>{{ prize.name }}</h3>
          <p class="rarity" :class="prize.rarity">
            {{ prize.rarity === 'common' ? '普通款' : prize.rarity === 'rare' ? '稀有款' : '隐藏款' }}
          </p>
          <p class="probability">概率: {{ prize.probability }}%</p>
        </div>
      </div>
    </div>

    <!-- 透视卡/提示卡 -->
    <div class="tools">
      <h2 class="section-title">道具</h2>
      <div class="tool-list">
        <div class="tool-item">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=perspective%20card%20for%20blind%20box&image_size=square" alt="透视卡">
          <h3>透视卡</h3>
          <p>剩余: {{ userTools.perspectiveCard }}张</p>
          <el-button @click="usePerspectiveCard">使用</el-button>
        </div>
        <div class="tool-item">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hint%20card%20for%20blind%20box&image_size=square" alt="提示卡">
          <h3>提示卡</h3>
          <p>剩余: {{ userTools.hintCard }}张</p>
          <el-button @click="useHintCard">使用</el-button>
        </div>
      </div>
    </div>

    <!-- 抽盒结果弹窗 -->
    <el-dialog
      v-model="showResult"
      title="抽盒结果"
      width="80%"
    >
      <div class="draw-result">
        <div class="result-animation">
          <!-- 这里可以添加开盒动画 -->
          <img :src="drawResult.image" :alt="drawResult.name" class="result-img">
        </div>
        <h2>{{ drawResult.name }}</h2>
        <p :class="drawResult.rarity">
          {{ drawResult.rarity === 'common' ? '普通款' : drawResult.rarity === 'rare' ? '稀有款' : '隐藏款' }}
        </p>
        <p class="congrats">恭喜你抽中了{{ drawResult.name }}！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showResult = false">继续抽盒</el-button>
          <el-button type="primary" @click="goToBoxCabinet">去盒柜查看</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 盲盒数据
const blindBox = ref({
  id: 1,
  name: '海贼王一番赏',
  price: 50,
  image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=one%20piece%20blind%20box%20collection&image_size=portrait_4_3',
  description: '海贼王官方授权一番赏盲盒，包含多个角色手办，有机会抽中隐藏款路飞手办！',
  prizes: [
    {
      id: 1,
      name: '路飞手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=monkey%20d%20luffy%20figure&image_size=square',
      rarity: 'hidden',
      probability: 1
    },
    {
      id: 2,
      name: '索隆手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roronoa%20zoro%20figure&image_size=square',
      rarity: 'rare',
      probability: 5
    },
    {
      id: 3,
      name: '娜美手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nami%20figure&image_size=square',
      rarity: 'rare',
      probability: 5
    },
    {
      id: 4,
      name: '山治手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sanji%20figure&image_size=square',
      rarity: 'common',
      probability: 20
    },
    {
      id: 5,
      name: '乌索普手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=usopp%20figure&image_size=square',
      rarity: 'common',
      probability: 20
    },
    {
      id: 6,
      name: '乔巴手办',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chopper%20figure&image_size=square',
      rarity: 'common',
      probability: 49
    }
  ]
})

// 用户道具
const userTools = ref({
  perspectiveCard: 2,
  hintCard: 3
})

// 抽盒结果
const showResult = ref(false)
const drawResult = ref({
  name: '',
  image: '',
  rarity: 'common'
})

// 单抽
const singleDraw = () => {
  // 模拟抽盒逻辑
  const random = Math.random() * 100
  let cumulativeProbability = 0
  
  for (const prize of blindBox.value.prizes) {
    cumulativeProbability += prize.probability
    if (random <= cumulativeProbability) {
      drawResult.value = {
        name: prize.name,
        image: prize.image,
        rarity: prize.rarity
      }
      break
    }
  }
  
  showResult.value = true
}

// 五连抽
const fiveDraw = () => {
  // 模拟五连抽，保证至少有一个稀有款
  const results = []
  let hasRare = false
  
  for (let i = 0; i < 5; i++) {
    const random = Math.random() * 100
    let cumulativeProbability = 0
    let prize
    
    for (const p of blindBox.value.prizes) {
      cumulativeProbability += p.probability
      if (random <= cumulativeProbability) {
        prize = p
        if (p.rarity === 'rare' || p.rarity === 'hidden') {
          hasRare = true
        }
        break
      }
    }
    
    results.push(prize)
  }
  
  // 如果没有稀有款，强制替换一个为稀有款
  if (!hasRare) {
    const rarePrizes = blindBox.value.prizes.filter(p => p.rarity === 'rare')
    if (rarePrizes.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length)
      results[randomIndex] = rarePrizes[Math.floor(Math.random() * rarePrizes.length)]
    }
  }
  
  // 显示第一个结果（实际应该显示所有结果）
  drawResult.value = {
    name: results[0].name,
    image: results[0].image,
    rarity: results[0].rarity
  }
  
  showResult.value = true
}

// 十连抽
const tenDraw = () => {
  // 模拟十连抽
  const random = Math.random() * 100
  let cumulativeProbability = 0
  
  for (const prize of blindBox.value.prizes) {
    cumulativeProbability += prize.probability
    if (random <= cumulativeProbability) {
      drawResult.value = {
        name: prize.name,
        image: prize.image,
        rarity: prize.rarity
      }
      break
    }
  }
  
  showResult.value = true
}

// 使用透视卡
const usePerspectiveCard = () => {
  if (userTools.value.perspectiveCard > 0) {
    userTools.value.perspectiveCard--
    // 模拟透视效果
    elMessage.success('使用透视卡成功，已排除一个错误选项！')
  } else {
    elMessage.error('透视卡不足！')
  }
}

// 使用提示卡
const useHintCard = () => {
  if (userTools.value.hintCard > 0) {
    userTools.value.hintCard--
    // 模拟提示效果
    elMessage.success('使用提示卡成功，获得一条线索！')
  } else {
    elMessage.error('提示卡不足！')
  }
}

// 去盒柜查看
const goToBoxCabinet = () => {
  showResult.value = false
  router.push('/box-cabinet')
}

// 导入ElMessage
import { ElMessage } from 'element-plus'

// 页面加载时获取盲盒详情
onMounted(() => {
  // 实际项目中这里应该通过API获取盲盒详情
  const id = route.params.id
  console.log('盲盒ID:', id)
})
</script>

<style scoped>
.blind-box-detail {
  padding: 20px;
  background-color: white;
  min-height: 100vh;
}

.product-info {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.product-img {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details {
  flex: 1;
}

.product-details h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #F56C6C;
  margin-bottom: 15px;
}

.description {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
  color: #666;
}

.actions {
  display: flex;
  gap: 15px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0;
  padding-left: 15px;
  border-left: 4px solid #409EFF;
}

.prize-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.prize-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.prize-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.prize-item h3 {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rarity {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 5px;
  display: inline-block;
}

.rarity.common {
  background-color: #E6A23C;
  color: white;
}

.rarity.rare {
  background-color: #409EFF;
  color: white;
}

.rarity.hidden {
  background-color: #909399;
  color: white;
}

.probability {
  font-size: 12px;
  color: #666;
}

.tool-list {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.tool-item {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.tool-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.tool-item h3 {
  font-size: 14px;
  margin-bottom: 5px;
}

.tool-item p {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.draw-result {
  text-align: center;
  padding: 20px;
}

.result-animation {
  margin-bottom: 20px;
}

.result-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.draw-result h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.draw-result .rarity {
  font-size: 16px;
  padding: 4px 12px;
  margin-bottom: 15px;
}

.congrats {
  font-size: 18px;
  color: #67C23A;
  margin-top: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .product-info {
    flex-direction: column;
    align-items: center;
  }
  
  .product-img {
    width: 100%;
    max-width: 300px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .tool-list {
    flex-direction: column;
  }
}
</style>