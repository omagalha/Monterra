import { animalData } from '../data/animals'

export function getAnimalForEnemy(enemy) {
  if (!enemy?.enemyType) return null
  return animalData[enemy.enemyType] ?? null
}

export function canCapture(enemy) {
  const animal = getAnimalForEnemy(enemy)
  if (!enemy || enemy.hp <= 0 || !animal) return false
  return enemy.hp / enemy.maxHp <= 0.3
}

export function getCaptureRequirement(enemy) {
  const animal = getAnimalForEnemy(enemy)
  if (!animal) return null

  return {
    animal,
    foodId: animal.captureFood,
    hpReady: canCapture(enemy)
  }
}

export function hasCaptureFood(inventory, foodId) {
  if (!foodId) return true
  return (inventory?.items?.[foodId] ?? 0) > 0
}

export function consumeCaptureFood(inventory, foodId) {
  if (!foodId) return true
  if (!hasCaptureFood(inventory, foodId)) return false

  inventory.items[foodId] -= 1
  inventory.refresh?.()
  return true
}

export function attemptCapture(enemy, inventory) {
  const animal = getAnimalForEnemy(enemy)
  if (!animal) {
    return { success: false, reason: 'unknown_animal' }
  }

  if (!canCapture(enemy)) {
    return { success: false, reason: 'hp_too_high', animal }
  }

  if (!hasCaptureFood(inventory, animal.captureFood)) {
    return {
      success: false,
      reason: 'missing_food',
      animal,
      foodId: animal.captureFood
    }
  }

  consumeCaptureFood(inventory, animal.captureFood)

  const hpRatio = enemy.hp / enemy.maxHp
  const bonus = ((0.3 - hpRatio) / 0.3) * 0.2
  const roll = Math.random()
  const success = roll <= animal.captureRate + bonus

  if (!success) {
    return {
      success: false,
      reason: 'escaped',
      animal,
      foodId: animal.captureFood
    }
  }

  return {
    success: true,
    foodId: animal.captureFood,
    creature: {
      id: animal.id,
      name: animal.name,
      species: animal.species,
      family: animal.family,
      tier: animal.tier,
      role: animal.role,
      color: animal.color,
      level: 1,
      xp: 0,
      hp: animal.baseHp,
      maxHp: animal.baseHp,
      baseHp: animal.baseHp,
      speed: animal.baseSpeed,
      damage: animal.baseDamage,
      captureRate: animal.captureRate,
      captureFood: animal.captureFood,
      passive: animal.passive,
      abilities: animal.abilities ?? []
    }
  }
}
