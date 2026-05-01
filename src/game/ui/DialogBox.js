export function createDialogBox(scene) {
  const dialog = {}

  dialog.isOpen = false
  dialog.currentNpc = null
  dialog.currentLineIndex = 0

  dialog.panel = scene.add.rectangle(422, 335, 800, 100, 0x111111, 0.88)
    .setStrokeStyle(3, 0xffffff)
    .setScrollFactor(0)
    .setDepth(15)
    .setVisible(false)

  dialog.nameText = scene.add.text(28, 292, '', {
    fontSize: '14px',
    color: '#facc15',
    fontFamily: 'monospace'
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.contentText = scene.add.text(28, 314, '', {
    fontSize: '14px',
    color: '#ffffff',
    fontFamily: 'monospace',
    wordWrap: { width: 760 }
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.hintText = scene.add.text(660, 368, 'E / A para continuar', {
    fontSize: '11px',
    color: '#cccccc',
    fontFamily: 'monospace'
  }).setScrollFactor(0).setDepth(15).setVisible(false)

  dialog.open = (npcData, lines) => {
    dialog.isOpen = true
    dialog.currentNpc = npcData
    dialog.currentLines = lines
    dialog.currentLineIndex = 0

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

    dialog.panel.setVisible(false)
    dialog.nameText.setVisible(false)
    dialog.contentText.setVisible(false)
    dialog.hintText.setVisible(false)
  }

  return dialog
}
