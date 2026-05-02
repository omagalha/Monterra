import { UI_COLORS, UI_FONT } from './theme'

export function createInteractionPrompt(scene) {
  const prompt = {}

  prompt.isVisible = false

  const cx = scene.scale.width / 2
  const cy = scene.scale.height - 40

  prompt.bg = scene.add.rectangle(cx, cy, 250, 42, UI_COLORS.panel, 0.9)
    .setStrokeStyle(2, UI_COLORS.borderBright)
    .setScrollFactor(0)
    .setDepth(15)
    .setVisible(false)

  prompt.text = scene.add.text(cx, cy, '', {
    fontSize: '14px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(15)
    .setVisible(false)

  prompt.show = (message) => {
    prompt.isVisible = true
    prompt.text.setText(message)

    const padding = 28
    prompt.bg.width = Math.max(180, prompt.text.width + padding)

    prompt.bg.setVisible(true)
    prompt.text.setVisible(true)
  }

  prompt.hide = () => {
    prompt.isVisible = false
    prompt.bg.setVisible(false)
    prompt.text.setVisible(false)
  }

  return prompt
}
