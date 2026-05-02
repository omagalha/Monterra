import { items } from '../data/items'
import { UI_COLORS, UI_FONT, addPanel } from './theme'

const DEPTH = 40

export function createInventory(scene) {
  const inventory = {
    visible: false,
    items: {
      coin: 0,
      leaf: 0,
      bone: 0,
      crystal: 0,
      berry: 3,
      glow_mushroom: 1,
      meat: 1,
      fish: 1,
      spiced_seed: 1
    },
    elements: []
  }

  const panelWidth = Math.min(320, scene.scale.width - 28)
  const columns = panelWidth < 260 ? 2 : 3
  const itemRows = Math.ceil(Object.values(items).length / columns)
  const panelHeight = Math.min(scene.scale.height - 96, 68 + itemRows * 66)
  const panelX = scene.scale.width >= 720
    ? scene.scale.width - panelWidth - 14
    : 14
  const panelY = scene.scale.height >= 520
    ? 138
    : Math.max(74, scene.scale.height - panelHeight - 14)

  const panelParts = addPanel(scene, panelX, panelY, panelWidth, panelHeight, {
    fill: UI_COLORS.panel,
    alpha: 0.96,
    border: UI_COLORS.borderBright,
    borderWidth: 3,
    depth: DEPTH
  })

  const title = scene.add.text(panelX + 18, panelY + 16, 'Inventario', {
    fontSize: '18px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(DEPTH + 2)

  const hint = scene.add.text(panelX + panelWidth - 18, panelY + 20, 'I', {
    fontSize: '13px',
    color: UI_COLORS.muted,
    fontFamily: UI_FONT.body
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 2)

  inventory.elements.push(...panelParts, title, hint)
  const baseElementCount = inventory.elements.length

  inventory.refresh = () => {
    inventory.elements.slice(baseElementCount).forEach(el => el.destroy())
    inventory.elements = inventory.elements.slice(0, baseElementCount)

    const itemList = Object.values(items)
    const gap = 8
    const slotW = Math.floor((panelWidth - 36 - gap * (columns - 1)) / columns)
    const slotH = 58
    const startX = panelX + 18
    const startY = panelY + 58

    itemList.forEach((item, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      const x = startX + col * (slotW + gap)
      const y = startY + row * (slotH + gap)
      const amountValue = inventory.items[item.id] || 0
      const itemName = item.name.length > 8 ? `${item.name.slice(0, 7)}.` : item.name

      const slot = scene.add.rectangle(x, y, slotW, slotH, UI_COLORS.panelAlt, 1)
        .setOrigin(0)
        .setScrollFactor(0)
        .setStrokeStyle(2, UI_COLORS.border)
        .setDepth(DEPTH + 1)
        .setVisible(inventory.visible)

      const iconX = x + slotW / 2
      const iconBg = scene.add.rectangle(iconX, y + 23, 32, 32, UI_COLORS.panelSoft, 1)
        .setScrollFactor(0)
        .setStrokeStyle(1, UI_COLORS.borderBright)
        .setDepth(DEPTH + 2)
        .setVisible(inventory.visible)

      const icon = scene.add.image(iconX, y + 21, 'items', item.icon)
        .setScale(1.25)
        .setScrollFactor(0)
        .setDepth(DEPTH + 3)
        .setVisible(inventory.visible)

      const name = scene.add.text(iconX, y + 41, itemName, {
        fontSize: '9px',
        color: UI_COLORS.text,
        fontFamily: UI_FONT.body
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH + 3).setVisible(inventory.visible)

      const amount = scene.add.text(x + slotW - 8, y + 6, `x${amountValue}`, {
        fontSize: '11px',
        color: amountValue > 0 ? UI_COLORS.gold : UI_COLORS.muted,
        fontFamily: UI_FONT.body
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 3).setVisible(inventory.visible)

      inventory.elements.push(slot, iconBg, icon, name, amount)
    })
  }

  inventory.setVisible = (value) => {
    inventory.visible = value
    inventory.elements.forEach(el => el.setVisible(value))
  }

  inventory.addItem = (itemId, amount = 1) => {
    inventory.items[itemId] = (inventory.items[itemId] || 0) + amount
    inventory.refresh()
  }

  inventory.refresh()
  inventory.setVisible(false)

  return inventory
}
