export const UI_COLORS = {
  ink: 0x0c0a10,
  panel: 0x18121d,
  panelAlt: 0x241b29,
  panelSoft: 0x2b2230,
  border: 0x4a3a32,
  borderBright: 0xc8a020,
  text: '#f4e8c8',
  textDark: '#2d2115',
  muted: '#b89f82',
  gold: '#e8c050',
  green: 0x48c870,
  greenDark: 0x123222,
  red: 0xe05040,
  redDark: 0x4a1c1c,
  teal: 0x30c0b0,
  tealDark: 0x0f4f49,
  shadow: 0x000000
}

export const UI_FONT = {
  body: 'monospace'
}

export function addPanel(scene, x, y, width, height, options = {}) {
  const {
    fill = UI_COLORS.panel,
    alpha = 0.92,
    border = UI_COLORS.borderBright,
    borderWidth = 2,
    shadow = true,
    depth = 10,
    origin = 0
  } = options

  const elements = []

  if (shadow) {
    elements.push(
      scene.add.rectangle(x + 4, y + 4, width, height, UI_COLORS.shadow, 0.32)
        .setOrigin(origin)
        .setScrollFactor(0)
        .setDepth(depth - 1)
    )
  }

  elements.push(
    scene.add.rectangle(x, y, width, height, fill, alpha)
      .setOrigin(origin)
      .setStrokeStyle(borderWidth, border)
      .setScrollFactor(0)
      .setDepth(depth)
  )

  return elements
}
