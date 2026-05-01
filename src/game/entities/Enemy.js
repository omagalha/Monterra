function buildSlime(scene, color) {
  const shadow = scene.add.ellipse(0, 16, 30, 10, 0x000000, 0.22)
  const body = scene.add.ellipse(0, 2, 34, 28, color)
  body.setStrokeStyle(2, 0x2b4d2b)

  const shine = scene.add.ellipse(-7, -6, 10, 6, 0xffffff, 0.24)
  const eye1 = scene.add.rectangle(-6, -2, 4, 4, 0x111111)
  const eye2 = scene.add.rectangle(6, -2, 4, 4, 0x111111)
  const mouth = scene.add.rectangle(0, 7, 10, 3, 0x111111)

  return [shadow, body, shine, eye1, eye2, mouth]
}

function buildSpirit(scene, color) {
  const shadow = scene.add.ellipse(0, 18, 26, 8, 0x000000, 0.16)
  const aura = scene.add.ellipse(0, 2, 38, 44, color, 0.18)
  const body = scene.add.ellipse(0, -2, 26, 34, color, 0.92)
  body.setStrokeStyle(2, 0x4c2f7f)

  const head = scene.add.circle(0, -10, 11, 0xd8c7ff)
  const eye1 = scene.add.rectangle(-4, -11, 3, 4, 0x111111)
  const eye2 = scene.add.rectangle(4, -11, 3, 4, 0x111111)

  const tailLeft = scene.add.triangle(-7, 12, 0, 0, 8, 18, 16, 0, color, 0.9)
  const tailMid = scene.add.triangle(0, 15, 0, 0, 8, 22, 16, 0, color, 0.9)
  const tailRight = scene.add.triangle(7, 12, 0, 0, 8, 18, 16, 0, color, 0.9)

  return [shadow, aura, body, head, eye1, eye2, tailLeft, tailMid, tailRight]
}

function buildThornBeast(scene, color) {
  const shadow = scene.add.ellipse(0, 18, 38, 12, 0x000000, 0.24)
  const body = scene.add.ellipse(0, 2, 42, 30, color)
  body.setStrokeStyle(3, 0x2f3d14)

  const head = scene.add.ellipse(12, -8, 24, 18, 0x86a94b)
  head.setStrokeStyle(2, 0x2f3d14)

  const eye = scene.add.rectangle(18, -10, 4, 4, 0x111111)
  const jaw = scene.add.rectangle(18, -2, 10, 4, 0x24310f)

  const spike1 = scene.add.triangle(-14, -14, 0, 12, 8, 0, 16, 12, 0xcddc39)
  const spike2 = scene.add.triangle(0, -18, 0, 12, 8, 0, 16, 12, 0xcddc39)
  const spike3 = scene.add.triangle(14, -14, 0, 12, 8, 0, 16, 12, 0xcddc39)

  const leg1 = scene.add.rectangle(-10, 14, 8, 10, 0x2f3d14)
  const leg2 = scene.add.rectangle(8, 15, 8, 10, 0x2f3d14)

  return [shadow, body, head, eye, jaw, spike1, spike2, spike3, leg1, leg2]
}

function getEnemyParts(scene, enemyData) {
  const key = enemyData?.key || enemyData?.id
  const color = enemyData?.color ?? 0xff6b6b

  if (key === 'slime' || key === 'wild_slime') {
    return buildSlime(scene, color)
  }

  if (key === 'spirit' || key === 'forest_spirit') {
    return buildSpirit(scene, color)
  }

  if (key === 'thornBeast' || key === 'thorn_beast') {
    return buildThornBeast(scene, color)
  }

  return buildSlime(scene, color)
}

export function createEnemy(scene, x, y, enemyData = {}) {
  const container = scene.add.container(x, y)
  const parts = getEnemyParts(scene, enemyData)

  container.add(parts)
  container.setScale(enemyData.behavior === 'charge' ? 1.6 : 1.4)

  container.enemyTypeKey = enemyData.key || enemyData.id || 'enemy'
  container.baseScale = container.scaleX

  return container
}
