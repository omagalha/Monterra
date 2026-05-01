export function createEnemy(scene, x, y) {
  const container = scene.add.container(x, y)

  const shadow = scene.add.ellipse(0, 16, 30, 10, 0x000000, 0.25)

  const body = scene.add.circle(0, 0, 18, 0xff6b6b)
  body.setStrokeStyle(2, 0x5a1a1a)

  const eye1 = scene.add.rectangle(-6, -4, 4, 4, 0x111111)
  const eye2 = scene.add.rectangle(6, -4, 4, 4, 0x111111)

  const mouth = scene.add.rectangle(0, 6, 10, 3, 0x111111)

  container.add([shadow, body, eye1, eye2, mouth])
  container.setScale(1.4)

  return container
}
