export function createPlayer(scene, x, y) {
  const container = scene.add.container(x, y)

  const shadow = scene.add.ellipse(0, 18, 28, 10, 0x000000, 0.25)

  const leg1 = scene.add.rectangle(-5, 13, 6, 12, 0x24324a)
  const leg2 = scene.add.rectangle(5, 13, 6, 12, 0x24324a)

  const body = scene.add.rectangle(0, 0, 20, 24, 0x1f7a4d)
  body.setStrokeStyle(2, 0x123222)

  const bag = scene.add.rectangle(-13, 2, 8, 18, 0x6b4b2a)
  bag.setStrokeStyle(1, 0x2a1b0d)

  const head = scene.add.rectangle(0, -20, 18, 18, 0xf0c27b)
  head.setStrokeStyle(2, 0x3a2412)

  const hair = scene.add.rectangle(0, -29, 20, 8, 0x3a2412)
  const hair2 = scene.add.rectangle(-6, -24, 8, 8, 0x3a2412)

  const eye = scene.add.rectangle(5, -20, 3, 3, 0x111111)

  const arm = scene.add.rectangle(13, 0, 6, 18, 0xf0c27b)
  arm.setStrokeStyle(1, 0x3a2412)

  container.add([shadow, leg1, leg2, bag, body, head, hair, hair2, eye, arm])
  container.setScale(1.8)

  return container
}
