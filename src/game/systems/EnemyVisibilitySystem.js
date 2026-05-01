import Phaser from 'phaser'

export const ENEMY_RENDER_DISTANCE = 1050
export const ENEMY_HEALTH_BAR_DISTANCE = 420
export const ENEMY_HEALTH_BAR_HIT_TIME = 2200

function distanceToPlayer(scene, enemy) {
  return Phaser.Math.Distance.Between(
    scene.player.x,
    scene.player.y,
    enemy.x,
    enemy.y
  )
}

function setHealthBarVisible(enemy, isVisible) {
  enemy.healthBar?.setVisible(isVisible)
  enemy.healthFill?.setVisible(isVisible)
}

export function shouldShowEnemyHealthBar(scene, enemy, distance) {
  if (!enemy.active || enemy.hp <= 0) return false

  const now = scene.time.now
  const wasRecentlyHit = now < (enemy.lastHitTime ?? 0) + ENEMY_HEALTH_BAR_HIT_TIME
  const isRecentlyInCombat = now < (enemy.lastCombatTime ?? 0) + ENEMY_HEALTH_BAR_HIT_TIME
  const isClose = distance <= ENEMY_HEALTH_BAR_DISTANCE

  return isClose || wasRecentlyHit || isRecentlyInCombat
}

export function updateEnemyVisibility(scene, enemies) {
  enemies.forEach((enemy) => {
    if (!enemy.active) return

    const distance = distanceToPlayer(scene, enemy)
    enemy.distanceToPlayer = distance

    const isRenderable = distance <= ENEMY_RENDER_DISTANCE
    enemy.setVisible(isRenderable)

    if (!isRenderable) {
      setHealthBarVisible(enemy, false)
      return
    }

    setHealthBarVisible(
      enemy,
      shouldShowEnemyHealthBar(scene, enemy, distance)
    )
  })
}
