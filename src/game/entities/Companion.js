import Phaser from 'phaser'

export function createCompanion(scene, x, y) {
  const container = scene.add.container(x, y)

  const shadow = scene.add.ellipse(0, 14, 24, 8, 0x000000, 0.22)

  const body = scene.add.ellipse(0, 0, 26, 22, 0x1ec98b)
  body.setStrokeStyle(2, 0x0b4f3a)

  const head = scene.add.ellipse(10, -10, 18, 16, 0x28e0a0)
  head.setStrokeStyle(2, 0x0b4f3a)

  const ear1 = scene.add.triangle(4, -20, 0, 0, 8, -16, 14, 0, 0x28e0a0)
  const ear2 = scene.add.triangle(16, -20, 0, 0, 8, -16, 14, 0, 0x28e0a0)

  const eye = scene.add.rectangle(14, -10, 3, 3, 0x111111)

  const tail = scene.add.rectangle(-15, -3, 14, 5, 0x1ec98b)
  tail.rotation = -0.5

  container.add([shadow, tail, body, head, ear1, ear2, eye])
  container.setScale(1.4)

  container.setAppearance = (color) => {
    const dark = Phaser.Display.Color.ValueToColor(color)
    dark.darken(20)
    const darkColor = dark.color

    body.setFillStyle(darkColor)
    tail.setFillStyle(darkColor)
    head.setFillStyle(color)
    ear1.setFillStyle(color)
    ear2.setFillStyle(color)
  }

  return container
}
