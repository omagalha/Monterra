import { UI_COLORS, UI_FONT, addPanel } from './theme'

export function createDialogBox(scene) {
  const dialog = {}

  dialog.isOpen = false
  dialog.currentNpc = null
  dialog.currentLineIndex = 0

  const w = scene.scale.width
  const h = scene.scale.height

  const [panelShadow, panel] = addPanel(scene, 22, h - 104, w - 44, 94, {
    fill: UI_COLORS.panel,
    alpha: 0.92,
    border: UI_COLORS.borderBright,
    borderWidth: 3,
    depth: 15
  })
  dialog.panelShadow = panelShadow.setVisible(false)
  dialog.panel = panel.setVisible(false)

  dialog.nameText = scene.add.text(28, h - 98, '', {
    fontSize: '14px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.contentText = scene.add.text(28, h - 76, '', {
    fontSize: '14px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body,
    wordWrap: { width: w - 60 }
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.hintText = scene.add.text(w - 180, h - 22, 'E / A para continuar', {
    fontSize: '11px',
    color: UI_COLORS.muted,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.open = (npcData, lines) => {
    dialog.isOpen = true
    dialog.currentNpc = npcData
    dialog.currentLines = lines
    dialog.currentLineIndex = 0

    dialog.panelShadow.setVisible(true)
    dialog.panel.setVisible(true)
    dialog.nameText.setVisible(true)
    dialog.contentText.setVisible(true)
    dialog.hintText.setVisible(true)

    dialog.nameText.setText(npcData.name)
    dialog.contentText.setText(lines[0] || '')
  }

  dialog.next = () => {
    if (!dialog.currentLines) return

    dialog.currentLineIndex += 1

    if (dialog.currentLineIndex >= dialog.currentLines.length) {
      dialog.close()
      return
    }

    dialog.contentText.setText(dialog.currentLines[dialog.currentLineIndex])
  }

  dialog.close = () => {
    dialog.isOpen = false
    dialog.currentNpc = null
    dialog.currentLineIndex = 0

    dialog.panelShadow.setVisible(false)
    dialog.panel.setVisible(false)
    dialog.nameText.setVisible(false)
    dialog.contentText.setVisible(false)
    dialog.hintText.setVisible(false)
  }

  return dialog
}
