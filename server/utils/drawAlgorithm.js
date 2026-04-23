// 抽盒算法工具

/**
 * 真随机抽盒算法
 * @param {Array} prizes - 奖品列表，包含probability字段
 * @returns {Object} 抽中的奖品
 */
const trueRandomDraw = (prizes) => {
  const random = Math.random() * 100;
  let cumulativeProbability = 0;
  
  for (const prize of prizes) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability) {
      return prize;
    }
  }
  
  // 兜底返回第一个奖品
  return prizes[0];
};

/**
 * 伪随机抽盒算法（库存控制）
 * @param {Array} prizes - 奖品列表，包含stock字段
 * @returns {Object} 抽中的奖品
 */
const pseudoRandomDraw = (prizes) => {
  // 过滤出有库存的奖品
  const availablePrizes = prizes.filter(prize => prize.stock > 0);
  
  if (availablePrizes.length === 0) {
    return null;
  }
  
  // 计算总权重
  const totalWeight = availablePrizes.reduce((sum, prize) => sum + prize.probability, 0);
  const random = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  for (const prize of availablePrizes) {
    cumulativeWeight += prize.probability;
    if (random <= cumulativeWeight) {
      // 减少库存
      prize.stock--;
      return prize;
    }
  }
  
  // 兜底返回第一个奖品
  availablePrizes[0].stock--;
  return availablePrizes[0];
};

/**
 * 批量抽盒
 * @param {Array} prizes - 奖品列表
 * @param {number} count - 抽盒次数
 * @param {string} type - 抽盒类型：single, five, ten
 * @param {boolean} isTrueRandom - 是否使用真随机
 * @returns {Array} 抽中的奖品列表
 */
const batchDraw = (prizes, count, type, isTrueRandom = false) => {
  const results = [];
  let hasRare = false;
  
  for (let i = 0; i < count; i++) {
    let prize;
    if (isTrueRandom) {
      prize = trueRandomDraw(prizes);
    } else {
      prize = pseudoRandomDraw(prizes);
    }
    
    if (prize) {
      results.push(prize);
      if (prize.rarity === 'rare' || prize.rarity === 'hidden') {
        hasRare = true;
      }
    }
  }
  
  // 五连抽保底机制
  if (type === 'five' && !hasRare && results.length > 0) {
    const rarePrizes = prizes.filter(p => p.rarity === 'rare' || p.rarity === 'hidden');
    if (rarePrizes.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length);
      const rarePrize = rarePrizes[Math.floor(Math.random() * rarePrizes.length)];
      results[randomIndex] = rarePrize;
    }
  }
  
  return results;
};

/**
 * 生成奖池序列（用于伪随机模式）
 * @param {Array} prizes - 奖品列表
 * @param {number} total - 总数量
 * @returns {Array} 奖池序列
 */
const generatePrizeSequence = (prizes, total) => {
  const sequence = [];
  
  // 计算每个奖品的数量
  const prizeCounts = {};
  prizes.forEach(prize => {
    const count = Math.round((prize.probability / 100) * total);
    prizeCounts[prize.id] = count;
  });
  
  // 生成序列
  for (const [prizeId, count] of Object.entries(prizeCounts)) {
    const prize = prizes.find(p => p.id === parseInt(prizeId));
    if (prize) {
      for (let i = 0; i < count; i++) {
        sequence.push(prize);
      }
    }
  }
  
  // 随机打乱序列
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  
  return sequence;
};

module.exports = {
  trueRandomDraw,
  pseudoRandomDraw,
  batchDraw,
  generatePrizeSequence
};