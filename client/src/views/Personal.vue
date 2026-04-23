<template>
  <div class="personal">
    <!-- 用户信息 -->
    <div class="user-info">
      <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20illustration&image_size=square" alt="用户头像" class="avatar">
      <div class="user-details">
        <h2>{{ userInfo.username }}</h2>
        <p class="vip-level">VIP{{ userInfo.vipLevel }}</p>
        <p class="user-id">ID: {{ userInfo.userId }}</p>
      </div>
      <el-button type="primary" size="small">编辑资料</el-button>
    </div>

    <!-- 资产管理 -->
    <div class="asset-section">
      <h3 class="section-title">资产管理</h3>
      <div class="asset-list">
        <div class="asset-item">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coin%20icon%20illustration&image_size=square" alt="盲盒币">
          <div class="asset-info">
            <h4>盲盒币</h4>
            <p class="asset-value">{{ userAssets.blindBoxCoin }}</p>
          </div>
          <el-button size="small">充值</el-button>
        </div>
        <div class="asset-item">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=points%20icon%20illustration&image_size=square" alt="积分">
          <div class="asset-info">
            <h4>积分</h4>
            <p class="asset-value">{{ userAssets.points }}</p>
          </div>
          <el-button size="small">兑换</el-button>
        </div>
        <div class="asset-item">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coupoun%20icon%20illustration&image_size=square" alt="优惠券">
          <div class="asset-info">
            <h4>优惠券</h4>
            <p class="asset-value">{{ userAssets.coupons }}</p>
          </div>
          <el-button size="small">查看</el-button>
        </div>
      </div>
    </div>

    <!-- 订单管理 -->
    <div class="order-section">
      <h3 class="section-title">订单管理</h3>
      <div class="order-tabs">
        <el-tabs v-model="activeOrderTab">
          <el-tab-pane label="购买订单" name="purchase"></el-tab-pane>
          <el-tab-pane label="发货订单" name="shipment"></el-tab-pane>
        </el-tabs>
      </div>
      <div class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.id }}</span>
            <span class="order-status" :class="order.status">{{ order.statusText }}</span>
          </div>
          <div class="order-content">
            <div v-for="item in order.items" :key="item.id" class="order-product">
              <img :src="item.image" :alt="item.name" class="product-img">
              <div class="product-info">
                <h4>{{ item.name }}</h4>
                <p class="product-price">¥{{ item.price }} x {{ item.quantity }}</p>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-total">合计: ¥{{ order.total }}</span>
            <div class="order-actions">
              <el-button v-if="order.status === 'pending'" type="primary" size="small">支付</el-button>
              <el-button v-if="order.status === 'shipping'" size="small">查看物流</el-button>
              <el-button v-if="order.status === 'completed'" size="small">再次购买</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 会员成长体系 -->
    <div class="vip-section">
      <h3 class="section-title">会员成长</h3>
      <div class="vip-progress">
        <div class="vip-level-info">
          <h4>当前等级: VIP{{ userInfo.vipLevel }}</h4>
          <p>距离下一等级还需 {{ userInfo.nextLevelPoints }} 积分</p>
        </div>
        <el-progress :percentage="userInfo.progress" :format="formatProgress"></el-progress>
      </div>
      <div class="vip-benefits">
        <h4>会员特权</h4>
        <ul class="benefits-list">
          <li>每月赠送 {{ userInfo.vipLevel * 2 }} 张透视卡</li>
          <li>抽盒享受 {{ 100 - userInfo.vipLevel * 2 }}% 折扣</li>
          <li>优先购买限量版盲盒</li>
          <li>专属客服通道</li>
        </ul>
      </div>
      <div class="check-in">
        <el-button type="success" @click="checkIn" :disabled="checkedIn">
          {{ checkedIn ? '已签到' : '每日签到' }}
        </el-button>
        <p class="check-in-info">连续签到 {{ userInfo.checkInDays }} 天，再签 {{ 7 - userInfo.checkInDays }} 天可获得额外奖励</p>
      </div>
    </div>

    <!-- 邀请好友 -->
    <div class="invite-section">
      <h3 class="section-title">邀请好友</h3>
      <div class="invite-card">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=invite%20friends%20illustration&image_size=landscape_16_9" alt="邀请好友">
        <div class="invite-info">
          <h4>邀请好友注册并抽盒</h4>
          <p>好友注册即送 100 积分</p>
          <p>好友首次抽盒，你获得 50 盲盒币</p>
          <el-button type="primary" @click="copyInviteLink">复制邀请链接</el-button>
        </div>
      </div>
    </div>

    <!-- 设置 -->
    <div class="settings-section">
      <h3 class="section-title">设置</h3>
      <div class="settings-list">
        <div class="setting-item">
          <span>账号安全</span>
          <el-icon><arrow-right /></el-icon>
        </div>
        <div class="setting-item">
          <span>收货地址</span>
          <el-icon><arrow-right /></el-icon>
        </div>
        <div class="setting-item">
          <span>隐私设置</span>
          <el-icon><arrow-right /></el-icon>
        </div>
        <div class="setting-item">
          <span>关于我们</span>
          <el-icon><arrow-right /></el-icon>
        </div>
        <div class="setting-item">
          <span>联系客服</span>
          <el-icon><arrow-right /></el-icon>
        </div>
        <div class="setting-item logout">
          <span>退出登录</span>
          <el-icon><arrow-right /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

// 用户信息
const userInfo = ref({
  username: '小明',
  userId: '123456789',
  vipLevel: 3,
  nextLevelPoints: 250,
  progress: 75,
  checkInDays: 5
})

// 用户资产
const userAssets = ref({
  blindBoxCoin: 580,
  points: 1250,
  coupons: 3
})

// 订单数据
const activeOrderTab = ref('purchase')
const orders = ref([
  {
    id: '20260417001',
    status: 'pending',
    statusText: '待支付',
    total: 250,
    items: [
      {
        id: 1,
        name: '海贼王一番赏',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=one%20piece%20blind%20box&image_size=square',
        price: 50,
        quantity: 5
      }
    ]
  },
  {
    id: '20260416001',
    status: 'shipping',
    statusText: '配送中',
    total: 100,
    items: [
      {
        id: 2,
        name: '潮玩盲盒',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=trendy%20toys%20blind%20box&image_size=square',
        price: 39,
        quantity: 2
      },
      {
        id: 3,
        name: '美妆盲盒',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20products%20blind%20box&image_size=square',
        price: 69,
        quantity: 1
      }
    ]
  },
  {
    id: '20260415001',
    status: 'completed',
    statusText: '已完成',
    total: 199,
    items: [
      {
        id: 4,
        name: '区块链盲盒',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blockchain%20blind%20box&image_size=square',
        price: 199,
        quantity: 1
      }
    ]
  }
])

// 签到状态
const checkedIn = ref(false)

// 格式化进度条
const formatProgress = (percentage: number) => {
  return `${percentage}%`
}

// 每日签到
const checkIn = () => {
  // 模拟签到逻辑
  checkedIn.value = true
  userInfo.value.checkInDays += 1
  userAssets.value.points += 10
  ElMessage.success('签到成功，获得10积分！')
}

// 复制邀请链接
const copyInviteLink = () => {
  // 模拟复制链接
  ElMessage.success('邀请链接已复制到剪贴板！')
}
</script>

<style scoped>
.personal {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.user-info {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  font-size: 20px;
  margin-bottom: 5px;
}

.vip-level {
  display: inline-block;
  background-color: #E6A23C;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 5px;
}

.user-id {
  font-size: 12px;
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.asset-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.asset-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.asset-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.asset-info {
  flex: 1;
}

.asset-info h4 {
  font-size: 14px;
  margin-bottom: 5px;
}

.asset-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.order-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-tabs {
  margin-bottom: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 10px;
}

.order-status.pending {
  background-color: #E6A23C;
  color: white;
}

.order-status.shipping {
  background-color: #409EFF;
  color: white;
}

.order-status.completed {
  background-color: #67C23A;
  color: white;
}

.order-content {
  margin-bottom: 10px;
}

.order-product {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.order-product .product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.order-product .product-info h4 {
  font-size: 14px;
  margin-bottom: 5px;
}

.product-price {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}

.order-total {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.vip-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vip-progress {
  margin-bottom: 20px;
}

.vip-level-info h4 {
  font-size: 16px;
  margin-bottom: 5px;
}

.vip-level-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.vip-benefits h4 {
  font-size: 16px;
  margin-bottom: 10px;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.benefits-list li {
  font-size: 14px;
  margin-bottom: 5px;
  padding-left: 20px;
  position: relative;
}

.benefits-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67C23A;
  font-weight: bold;
}

.check-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.check-in-info {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.invite-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invite-card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.invite-card img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.invite-info {
  flex: 1;
}

.invite-info h4 {
  font-size: 16px;
  margin-bottom: 10px;
}

.invite-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.settings-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.setting-item:hover {
  background-color: #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.logout {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .asset-list {
    grid-template-columns: 1fr;
  }
  
  .invite-card {
    flex-direction: column;
    text-align: center;
  }
  
  .invite-card img {
    width: 100%;
    max-width: 300px;
  }
}
</style>