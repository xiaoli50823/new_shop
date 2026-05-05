// 抽盒算法工具

/**
 * 单次抽盒
 * 每个奖品独立按自身概率判定，如果多个命中则优先稀有度高的
 * 如果没有任何奖品命中，返回 null（抽空）
 * @param {Array} prizes - 奖品列表 [{id, name, image, rarity, probability, stock}, ...]
 * @returns {Object|null} 抽中的奖品 或 null
 */
const singleDraw = (prizes) => {
  const hits = []

  for (const prize of prizes) {
    if (prize.stock <= 0) continue
    const roll = Math.random() * 100
    if (roll < prize.probability) {
      hits.push(prize)
    }
  }

  if (hits.length === 0) return null

  // 多个命中时按稀有度排序，优先返回稀有度最高的
  const rarityOrder = { hidden: 5, legendary: 5, super_rare: 4, epic: 4, rare: 3, common: 1 }
  hits.sort((a, b) => {
    const ra = rarityOrder[a.rarity] || 0
    const rb = rarityOrder[b.rarity] || 0
    return rb - ra
  })

  const chosen = hits[0]
  chosen.stock--
  return chosen
}

/**
 * 批量抽盒
 * @param {Array} prizes - 奖品列表
 * @param {number} count - 抽盒次数
 * @param {boolean} hasGuarantee - 五连抽保底（至少一个稀有及以上）
 * @param {boolean} doubleGuarantee - 十连抽双保底（至少两个稀有及以上）
 * @returns {Array} 抽中的奖品列表（含 null 表示抽空）
 */
const batchDraw = (prizes, count, hasGuarantee = false, doubleGuarantee = false) => {
  const workingPrizes = prizes.map(p => ({ ...p }))
  const results = []

  for (let i = 0; i < count; i++) {
    results.push(singleDraw(workingPrizes))
  }

  // 五连抽保底：至少一个稀有及以上
  if (hasGuarantee) {
    const hasRare = results.some(r =>
      r && (r.rarity === 'rare' || r.rarity === 'super_rare' || r.rarity === 'hidden')
    )
    if (!hasRare) {
      // 找一个可替换的位置（优先替换 null，其次替换 common）
      let replaceIndex = -1
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) { replaceIndex = i; break }
      }
      if (replaceIndex < 0) {
        for (let i = 0; i < results.length; i++) {
          if (results[i] && results[i].rarity === 'common') { replaceIndex = i; break }
        }
      }

      if (replaceIndex >= 0) {
        const rarePrizes = prizes.filter(
          p => p.rarity === 'rare' || p.rarity === 'super_rare' || p.rarity === 'hidden'
        )
        if (rarePrizes.length > 0) {
          results[replaceIndex] = { ...rarePrizes[Math.floor(Math.random() * rarePrizes.length)] }
        }
      }
    }
  }

  // 十连抽双保底：至少两个稀有及以上
  if (doubleGuarantee) {
    const nonCommon = results.filter(r =>
      r && (r.rarity === 'rare' || r.rarity === 'super_rare' || r.rarity === 'hidden')
    )
    if (nonCommon.length < 2) {
      const rarePrizes = prizes.filter(
        p => p.rarity === 'rare' || p.rarity === 'super_rare' || p.rarity === 'hidden'
      )
      const needed = 2 - nonCommon.length
      let replaced = 0

      // 优先替换 null，再替换 common
      for (let i = 0; i < results.length && replaced < needed; i++) {
        if (!results[i]) {
          if (rarePrizes.length > 0) {
            results[i] = { ...rarePrizes[Math.floor(Math.random() * rarePrizes.length)] }
            replaced++
          }
        }
      }
      for (let i = 0; i < results.length && replaced < needed; i++) {
        if (results[i] && results[i].rarity === 'common') {
          if (rarePrizes.length > 0) {
            results[i] = { ...rarePrizes[Math.floor(Math.random() * rarePrizes.length)] }
            replaced++
          }
        }
      }
    }
  }

  return results
}

/**
 * 生成奖池序列（预生成整盒奖品序列）
 * @param {Array} prizes - 奖品列表
 * @param {number} total - 总数量
 * @returns {Array} 奖池序列
 */
const generatePrizeSequence = (prizes, total) => {
  const sequence = []

  const prizeCounts = {}
  prizes.forEach(prize => {
    const cnt = Math.round((prize.probability / 100) * total)
    prizeCounts[prize.id] = Math.max(1, cnt)
  })

  for (const [prizeId, cnt] of Object.entries(prizeCounts)) {
    const prize = prizes.find(p => p.id === parseInt(prizeId))
    if (prize) {
      for (let i = 0; i < cnt; i++) {
        sequence.push({ ...prize })
      }
    }
  }

  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]]
  }

  return sequence
}

module.exports = {
  singleDraw,
  batchDraw,
  generatePrizeSequence
}
