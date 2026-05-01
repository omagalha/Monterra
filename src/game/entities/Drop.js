export function createDrop(scene, x, y, type = 'coin') {
  const drop = scene.add.container(x, y)

  const shadow = scene.add.ellipse(0, 10, 20, 6, 0x000000, 0.2)

  let color = 0xfacc15

  if (type === 'leaf') color = 0x22c55e
  if (type === 'bone') color = 0xffffff
  if (type === 'crystal') color = 0x60a5fa

  const body = scene.add.circle(0, 0, 10, color)
  body.setStrokeStyle(2, 0x000000)

  drop.add([shadow, body])

  drop.type = type
  drop.value = 5
  drop.collected = false

  return drop
}
