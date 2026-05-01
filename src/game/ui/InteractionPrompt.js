export function createInteractionPrompt(scene) {
  const prompt = {}

  prompt.isVisible = false

  prompt.bg = scene.add.rectangle(422, 354, 250, 42, 0x111111, 0.88)
    .setStrokeStyle(2, 0xffffff)
    .setScrollFactor(0)
    .setDepth(15)
    .setVisible(false)

  prompt.text = scene.add.text(422, 354, '', {
    fontSize: '14px',
    color: '#ffffff',
    fontFamily: 'monospace'
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
