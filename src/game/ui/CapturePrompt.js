import { items } from '../data/items'
import { UI_COLORS, UI_FONT, addPanel } from './theme'

export function createCapturePrompt(scene) {
  const prompt = {
    visible: false,
    enemy: null,
    elements: []
  }

  const width = 340
  const height = 78
  const x = Math.max(14, scene.scale.width / 2 - width / 2)
  const y = scene.scale.height - height - 18
  const depth = 42

  const panelParts = addPanel(scene, x, y, width, height, {
    fill: UI_COLORS.panel,
    alpha: 0.94,
    border: UI_COLORS.teal,
    borderWidth: 2,
    depth
  })

  const title = scene.add.text(x + 16, y + 12, '', {
    fontSize: '14px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(depth + 2)

  const body = scene.add.text(x + 16, y + 36, '', {
    fontSize: '12px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(depth + 2)

  const key = scene.add.text(x + width - 18, y + 24, 'E', {
    fontSize: '18px',
    color: UI_COLORS.teal ? '#30c0b0' : UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(depth + 2)

  prompt.elements.push(...panelParts, title, body, key)

  prompt.show = ({ enemy, animal, foodId, hasFood }) => {
    prompt.visible = true
    prompt.enemy = enemy

    const foodName = items[foodId]?.name ?? foodId ?? 'comida'
    title.setText(`Dar comida para ${animal.name}`)
    body.setText(hasFood ? `${foodName} pronta - pressione E` : `Precisa de ${foodName}`)

    key.setColor(hasFood ? '#30c0b0' : '#b89f82')
    prompt.elements.forEach((element) => element.setVisible(true))
  }

  prompt.hide = () => {
    prompt.visible = false
    prompt.enemy = null
    prompt.elements.forEach((element) => element.setVisible(false))
  }

  prompt.hide()

  return prompt
}
