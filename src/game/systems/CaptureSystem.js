import { creatureData } from '../data/creatures'

export function canCapture(enemy) {
  if (!enemy || enemy.hp <= 0) return false
  if (!enemy.enemyType || !creatureData[enemy.enemyType]) return false
  return enemy.hp / enemy.maxHp <= 0.3
}

export function attemptCapture(enemy) {
  const data = creatureData[enemy.enemyType]
  if (!data) return { success: false }

  const hpRatio = enemy.hp / enemy.maxHp
  const bonus = ((0.3 - hpRatio) / 0.3) * 0.2
  const roll = Math.random()
  const success = roll <= data.captureRate + bonus

  if (!success) return { success: false }

  return {
    success: true,
    creature: {
      id: data.id,
      name: data.name,
      color: data.color,
      level: 1,
      xp: 0,
      hp: data.baseHp,
      maxHp: data.baseHp,
      baseHp: data.baseHp,
      speed: data.baseSpeed,
      damage: data.baseDamage,
      captureRate: data.captureRate
    }
  }
}
