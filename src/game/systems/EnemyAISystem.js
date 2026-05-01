import Phaser from 'phaser'

const ENEMY_FULL_AI_DISTANCE = 720
const ENEMY_SLEEP_DISTANCE = 1050

function moveEnemy(scene, enemy, dx, dy, multiplier = 1) {
  const stepX = dx * enemy.speed * multiplier
  const stepY = dy * enemy.speed * multiplier

  const nextX = Phaser.Math.Clamp(
    enemy.x + stepX,
    20,
    scene.currentMap.config.worldWidth - 20
  )

  const nextY = Phaser.Math.Clamp(
    enemy.y + stepY,
    20,
    scene.currentMap.config.worldHeight - 20
  )

  if (!scene.isCollidingAt(nextX, enemy.y)) {
    enemy.x = nextX
  }

  if (!scene.isCollidingAt(enemy.x, nextY)) {
    enemy.y = nextY
  }
}

function distanceToPlayer(scene, enemy) {
  return Phaser.Math.Distance.Between(
    enemy.x,
    enemy.y,
    scene.player.x,
    scene.player.y
  )
}

function distanceToSpawn(enemy) {
  return Phaser.Math.Distance.Between(
    enemy.x,
    enemy.y,
    enemy.spawnX,
    enemy.spawnY
  )
}

function getNormalizedDirection(fromX, fromY, toX, toY) {
  const dx = toX - fromX
  const dy = toY - fromY
  const len = Math.hypot(dx, dy) || 1

  return {
    dx: dx / len,
    dy: dy / len
  }
}

function updateWanderEnemy(scene, enemy, context) {
  const { now, distToPlayer, distToSpawn, toPlayer, toHome } = context

  if (distToPlayer <= enemy.aggroRadius) {
    enemy.state = 'chasing'
  } else if (distToSpawn > enemy.wanderRadius) {
    enemy.state = 'returning'
  } else {
    enemy.state = 'wandering'
  }

  if (enemy.state === 'chasing') {
    moveEnemy(scene, enemy, toPlayer.dx, toPlayer.dy, 1.1)
  } else if (enemy.state === 'returning') {
    moveEnemy(scene, enemy, toHome.dx, toHome.dy, 0.95)
  } else {
    if (now >= enemy.nextDecisionTime) {
      enemy.directionX = Phaser.Math.FloatBetween(-1, 1)
      enemy.directionY = Phaser.Math.FloatBetween(-1, 1)
      enemy.nextDecisionTime = now + Phaser.Math.Between(900, 1700)
    }

    moveEnemy(scene, enemy, enemy.directionX, enemy.directionY, 0.45)
  }

  enemy.y += Math.sin(now * 0.005 + enemy.floatOffset) * 0.05
}

function updateKiteEnemy(scene, enemy, context) {
  const { now, distToPlayer, distToSpawn, toPlayer, toHome } = context
  const tooFarFromHome = distToSpawn > enemy.leashRadius

  if (tooFarFromHome) {
    enemy.state = 'returning'
  } else if (distToPlayer <= enemy.aggroRadius) {
    enemy.state = 'skirmishing'
  } else if (distToSpawn > enemy.wanderRadius) {
    enemy.state = 'returning'
  } else {
    enemy.state = 'wandering'
  }

  if (enemy.state === 'skirmishing') {
    if (distToPlayer > enemy.preferredRange + 18) {
      moveEnemy(scene, enemy, toPlayer.dx, toPlayer.dy, 0.9)
    } else if (distToPlayer < enemy.preferredRange - 18) {
      moveEnemy(scene, enemy, -toPlayer.dx, -toPlayer.dy, 0.95)
    } else {
      const orbitX = -toPlayer.dy
      const orbitY = toPlayer.dx
      moveEnemy(scene, enemy, orbitX, orbitY, 0.8)
    }
  } else if (enemy.state === 'returning') {
    moveEnemy(scene, enemy, toHome.dx, toHome.dy, 1)
  } else {
    if (now >= enemy.nextDecisionTime) {
      enemy.directionX = Phaser.Math.FloatBetween(-1, 1)
      enemy.directionY = Phaser.Math.FloatBetween(-1, 1)
      enemy.nextDecisionTime = now + Phaser.Math.Between(1000, 1800)
    }

    moveEnemy(scene, enemy, enemy.directionX, enemy.directionY, 0.35)
  }

  enemy.alpha = 0.72 + Math.sin(now * 0.01 + enemy.floatOffset) * 0.12
  enemy.y += Math.sin(now * 0.008 + enemy.floatOffset) * 0.18
}

function updateChargeEnemy(scene, enemy, context) {
  const { now, distToPlayer, distToSpawn, toPlayer, toHome } = context
  const tooFarFromHome = distToSpawn > enemy.leashRadius

  if (tooFarFromHome) {
    enemy.state = 'returning'
  } else if (now < enemy.chargeUntil) {
    enemy.state = 'charging'
  } else if (
    distToPlayer <= enemy.aggroRadius &&
    now >= enemy.chargeCooldownUntil
  ) {
    enemy.state = 'windup'
  } else if (distToPlayer <= enemy.aggroRadius) {
    enemy.state = 'stalking'
  } else if (distToSpawn > enemy.wanderRadius) {
    enemy.state = 'returning'
  } else {
    enemy.state = 'wandering'
  }

  if (enemy.state === 'windup') {
    enemy.chargeDirX = toPlayer.dx
    enemy.chargeDirY = toPlayer.dy
    enemy.chargeUntil = now + 380
    enemy.chargeCooldownUntil = now + 1700
  } else if (enemy.state === 'charging') {
    moveEnemy(scene, enemy, enemy.chargeDirX, enemy.chargeDirY, 2.35)
    enemy.setScale(enemy.baseScale * 1.08)
  } else if (enemy.state === 'stalking') {
    moveEnemy(scene, enemy, toPlayer.dx, toPlayer.dy, 0.72)
    enemy.setScale(enemy.baseScale)
  } else if (enemy.state === 'returning') {
    moveEnemy(scene, enemy, toHome.dx, toHome.dy, 1.05)
    enemy.setScale(enemy.baseScale)
  } else {
    if (now >= enemy.nextDecisionTime) {
      enemy.directionX = Phaser.Math.FloatBetween(-1, 1)
      enemy.directionY = Phaser.Math.FloatBetween(-1, 1)
      enemy.nextDecisionTime = now + Phaser.Math.Between(900, 1500)
    }

    moveEnemy(scene, enemy, enemy.directionX, enemy.directionY, 0.3)
    enemy.setScale(enemy.baseScale)
  }
}

export function updateEnemyAI(scene, enemies) {
  const now = scene.time.now

  enemies.forEach((enemy) => {
    if (!enemy.active) return
    if (enemy.hp <= 0) return

    const distToPlayer = distanceToPlayer(scene, enemy)
    enemy.distanceToPlayer = distToPlayer

    if (distToPlayer > ENEMY_SLEEP_DISTANCE) {
      enemy.state = 'sleeping'
      return
    }

    if (distToPlayer > ENEMY_FULL_AI_DISTANCE) {
      enemy.state = 'dormant'
      scene.updateEnemyHealthBar(enemy)
      return
    }

    const distToSpawn = distanceToSpawn(enemy)

    const toPlayer = getNormalizedDirection(
      enemy.x,
      enemy.y,
      scene.player.x,
      scene.player.y
    )

    const toHome = getNormalizedDirection(
      enemy.x,
      enemy.y,
      enemy.spawnX,
      enemy.spawnY
    )

    const context = {
      now,
      distToPlayer,
      distToSpawn,
      toPlayer,
      toHome
    }

    if (distToPlayer <= enemy.aggroRadius) {
      enemy.lastCombatTime = now
    }

    if (enemy.behavior === 'kite') {
      updateKiteEnemy(scene, enemy, context)
    } else if (enemy.behavior === 'charge') {
      updateChargeEnemy(scene, enemy, context)
    } else {
      updateWanderEnemy(scene, enemy, context)
    }

    scene.updateEnemyHealthBar(enemy)
  })
}
