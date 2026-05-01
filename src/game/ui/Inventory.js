import { items } from '../data/items'

export function createInventory(scene) {
  const inventory = {
    visible: false,
    items: {
      coin: 0,
      leaf: 0,
      bone: 0,
      crystal: 0
    },
    elements: []
  }

  const panel = scene.add.rectangle(195, 422, 330, 430, 0xd8a96a, 0.95)
    .setScrollFactor(0)
    .setStrokeStyle(4, 0x5a3418)
    .setVisible(false)

  const title = scene.add.text(58, 225, 'Inventário', {
    fontSize: '22px',
    color: '#3a2412',
    fontFamily: 'monospace'
  }).setScrollFactor(0).setVisible(false)

  inventory.elements.push(panel, title)

  inventory.refresh = () => {
    inventory.elements.slice(2).forEach(el => el.destroy())
    inventory.elements = inventory.elements.slice(0, 2)

    Object.values(items).forEach((item, index) => {
      const col = index % 4
      const row = Math.floor(index / 4)

      const x = 70 + col * 70
      const y = 290 + row * 70

      const slot = scene.add.rectangle(x, y, 52, 52, 0xeed5b7, 1)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0x5a3418)
        .setVisible(inventory.visible)

      const icon = scene.add.image(x, y - 5, 'items', item.icon)
        .setScale(1.6)
        .setScrollFactor(0)
        .setVisible(inventory.visible)

      const amount = scene.add.text(x + 10, y + 10, String(inventory.items[item.id] || 0), {
        fontSize: '13px',
        color: '#3a2412',
        fontFamily: 'monospace'
      }).setScrollFactor(0).setVisible(inventory.visible)

      inventory.elements.push(slot, icon, amount)
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

  return inventory
}
