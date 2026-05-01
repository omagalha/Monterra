import Phaser from 'phaser'

const ENEMY_REACTIONS = {
  wander: {
    damageMultiplier: 1,
    knockback: 46,
    hitAlpha: 0.25,
    hitDuration: 90
  },

  kite: {
    damageMultiplier: 1,
    knockback: 74,
    hitAlpha: 0.35,
    hitDuration: 120,
    blinkDistance: 64
  },

  charge: {
    damageMultiplier: 0.82,
    knockback: 16,
    hitAlpha: 0.55,
    hitDuration: 70,
    staggerDuration: 260
  }
}

function getReaction(enemy) {
  return ENEMY_REACTIONS[enemy.behavior] ?? ENEMY_REACTIONS.wander
}

function getDirectionAwayFrom(attacker, enemy) {
  const dx = enemy.x - attacker.x
  const dy = enemy.y - attacker.y
  const len = Math.hypot(dx, dy) || 1

  return {
    dx: dx / len,
    dy: dy / len
  }
}

function moveEnemyByImpulse(scene, enemy, dx, dy, distance) {
  const targetX = Phaser.Math.Clamp(
    enemy.x + dx * distance,
    20,
    scene.currentMap.config.worldWidth - 20
  )

  const targetY = Phaser.Math.Clamp(
    enemy.y + dy * distance,
    20,
    scene.currentMap.config.worldHeight - 20
  )

  if (!scene.isCollidingAt(targetX, enemy.y)) {
    enemy.x = targetX
  }

  if (!scene.isCollidingAt(enemy.x, targetY)) {
    enemy.y = targetY
  }
}

function playCompanionStrike(scene, companion, enemy) {
  if (!companion) return

  scene.tweens.add({
    targets: companion,
    x: enemy.x - 20,
    y: enemy.y,
    duration: 120,
    yoyo: true
  })
}

function playHitFeedback(scene, enemy, reaction) {
  scene.tweens.add({
    targets: enemy,
    alpha: reaction.hitAlpha,
    duration: reaction.hitDuration,
    yoyo: true,
    onComplete: () => {
      if (enemy.active && enemy.behavior !== 'kite') {
        enemy.setAlpha(1)
      }
    }
  })
}

function applyBehaviorReaction(scene, enemy, attacker, reaction) {
  const away = getDirectionAwayFrom(attacker, enemy)

  if (enemy.behavior === 'kite') {
    moveEnemyByImpulse(scene, enemy, away.dx, away.dy, reaction.blinkDistance)
    enemy.nextDecisionTime = scene.time.now + 350
    enemy.state = 'evading'
    return
  }

  if (enemy.behavior === 'charge') {
    moveEnemyByImpulse(scene, enemy, away.dx, away.dy, reaction.knockback)
    enemy.chargeUntil = 0
    enemy.chargeCooldownUntil = Math.max(
      enemy.chargeCooldownUntil ?? 0,
      scene.time.now + reaction.staggerDuration
    )
    enemy.state = 'staggered'

    scene.tweens.add({
      targets: enemy,
      scaleX: enemy.baseScale * 0.96,
      scaleY: enemy.baseScale * 1.04,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        if (enemy.active) enemy.setScale(enemy.baseScale)
      }
    })
    return
  }

  moveEnemyByImpulse(scene, enemy, away.dx, away.dy, reaction.knockback)

  scene.tweens.add({
    targets: enemy,
    scaleX: enemy.baseScale * 1.12,
    scaleY: enemy.baseScale * 0.88,
    duration: 80,
    yoyo: true,
    onComplete: () => {
      if (enemy.active) enemy.setScale(enemy.baseScale)
    }
  })
}

export function applyPlayerAttack(scene, enemy, options = {}) {
  if (!enemy || enemy.hp <= 0) {
    return { killed: false, damage: 0 }
  }

  const {
    damage = 20,
    attacker = scene.player,
    companion = scene.companion
  } = options

  const reaction = getReaction(enemy)
  const finalDamage = Math.max(1, Math.round(damage * reaction.damageMultiplier))

  enemy.hp = Math.max(0, enemy.hp - finalDamage)
  enemy.lastHitTime = scene.time.now
  enemy.lastCombatTime = scene.time.now

  if (scene.updateEnemyHealthBar) {
    scene.updateEnemyHealthBar(enemy)
  }

  playHitFeedback(scene, enemy, reaction)
  applyBehaviorReaction(scene, enemy, attacker, reaction)
  playCompanionStrike(scene, companion, enemy)

  return {
    killed: enemy.hp <= 0,
    damage: finalDamage
  }
}
