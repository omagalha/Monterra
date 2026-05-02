export function setActiveCompanion(scene, creature) {
  if (!scene || !creature) return

  scene.activeCreature = creature
  scene.companionHp = creature.hp ?? creature.baseHp ?? scene.companionHp
  scene.companionMaxHp = creature.maxHp ?? creature.baseHp ?? scene.companionMaxHp

  if (scene.companion?.setAppearance) {
    scene.companion.setAppearance(creature.color)
  }
}

export function getCompanionAttackInterval(creature) {
  if (!creature) return 900

  const fastPassives = ['soft_step', 'instinto_fulgor', 'rastreador_nomade', 'rastro_ancestral']
  const passiveBonus = fastPassives.includes(creature.passive?.id) ? 120 : 0
  return Math.max(420, 1200 - creature.speed * 400 - passiveBonus)
}

export function getCompanionDamage(creature) {
  if (!creature) return 20

  const damagePassives = ['thorn_hide', 'guardiao_do_vale', 'sombra_soberana', 'rastro_ancestral']
  const passiveBonus = damagePassives.includes(creature.passive?.id) ? 4 : 0
  return (creature.damage ?? 20) + passiveBonus
}

export function getCompanionFollowSpeed(creature) {
  if (!creature) return 0.04

  const speedPassives = ['instinto_fulgor', 'rastreador_nomade', 'desert_stride']
  const passiveBonus = speedPassives.includes(creature.passive?.id) ? 0.012 : 0
  return 0.03 + creature.speed * 0.03 + passiveBonus
}
