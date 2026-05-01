export function createNpc(scene, npcData) {
  const container = scene.add.container(npcData.x, npcData.y)

  const shadow = scene.add.ellipse(0, 18, 28, 10, 0x000000, 0.25)

  const leg1 = scene.add.rectangle(-5, 13, 6, 12, 0x5b4636)
  const leg2 = scene.add.rectangle(5, 13, 6, 12, 0x5b4636)

  const bodyColor = npcData.bodyColor ?? 0x8b5cf6
  const bodyStroke = npcData.bodyStroke ?? 0x3b2463

  const body = scene.add.rectangle(0, 0, 20, 24, bodyColor)
  body.setStrokeStyle(2, bodyStroke)

  const head = scene.add.rectangle(0, -20, 18, 18, 0xf0c27b)
  head.setStrokeStyle(2, 0x3a2412)

  const hair = scene.add.rectangle(0, -29, 20, 8, 0x4a2d16)
  const eye = scene.add.rectangle(4, -20, 3, 3, 0x111111)

  const nameTag = scene.add.text(-22, -45, npcData.name, {
    fontSize: '10px',
    color: '#ffffff',
    fontFamily: 'monospace',
    backgroundColor: '#00000088'
  })

  const questIndicatorBg = scene.add.circle(0, -58, 10, 0x111111, 0.9)
  questIndicatorBg.setStrokeStyle(2, 0xffffff)

  const questIndicatorText = scene.add.text(-4, -66, '', {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#ffffff'
  })

  questIndicatorBg.setVisible(false)
  questIndicatorText.setVisible(false)

  container.add([
    shadow,
    leg1,
    leg2,
    body,
    head,
    hair,
    eye,
    nameTag,
    questIndicatorBg,
    questIndicatorText
  ])

  container.setScale(1.8)
  container.setDepth(4)

  container.npcData = npcData
  container.questIndicatorBg = questIndicatorBg
  container.questIndicatorText = questIndicatorText

  return container
}
