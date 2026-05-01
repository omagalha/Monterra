import Phaser from 'phaser'

export function createHud(scene) {
  const hud = {}

  const x = 14
  const y = 14

  // painel base
  hud.panelShadow = scene.add.rectangle(x + 4, y + 4, 285, 118, 0x000000, 0.28)
    .setOrigin(0)
    .setScrollFactor(0)

  hud.panel = scene.add.rectangle(x, y, 285, 118, 0xc89455, 0.95)
    .setOrigin(0)
    .setStrokeStyle(4, 0x5a3418)
    .setScrollFactor(0)

  hud.inner = scene.add.rectangle(x + 8, y + 8, 269, 102, 0xe7bd7a, 0.9)
    .setOrigin(0)
    .setStrokeStyle(2, 0x7a4a21)
    .setScrollFactor(0)

  // retrato player
  hud.playerPortraitBg = scene.add.rectangle(x + 15, y + 17, 54, 54, 0xffd8a8)
    .setOrigin(0)
    .setStrokeStyle(3, 0x6b3f1d)
    .setScrollFactor(0)

  hud.playerFace = scene.add.circle(x + 42, y + 44, 16, 0xf0c27b)
    .setStrokeStyle(2, 0x3a2412)
    .setScrollFactor(0)

  hud.playerHair = scene.add.rectangle(x + 42, y + 32, 28, 8, 0x3a2412)
    .setScrollFactor(0)

  hud.playerEye = scene.add.rectangle(x + 48, y + 44, 3, 3, 0x111111)
    .setScrollFactor(0)

  // nome
  hud.nameText = scene.add.text(x + 82, y + 14, 'THALES', {
    fontSize: '15px',
    color: '#ffffff',
    fontFamily: 'monospace'
  }).setScrollFactor(0)

  // HP player
  hud.playerHpBack = scene.add.rectangle(x + 82, y + 38, 180, 16, 0x4a1c1c)
    .setOrigin(0)
    .setStrokeStyle(2, 0x2a0d0d)
    .setScrollFactor(0)

  hud.playerHpFill = scene.add.rectangle(x + 84, y + 40, 176, 12, 0xe63946)
    .setOrigin(0)
    .setScrollFactor(0)

  hud.playerHpText = scene.add.text(x + 92, y + 37, '100/100', {
    fontSize: '12px',
    color: '#ffffff',
    fontFamily: 'monospace'
  }).setScrollFactor(0)

  // ícone companheiro
  hud.companionPortraitBg = scene.add.circle(x + 42, y + 89, 20, 0xffd8a8)
    .setStrokeStyle(3, 0x6b3f1d)
    .setScrollFactor(0)

  hud.companionIcon = scene.add.circle(x + 42, y + 89, 13, 0x1ec98b)
    .setStrokeStyle(2, 0x0b4f3a)
    .setScrollFactor(0)

  hud.companionEye = scene.add.rectangle(x + 47, y + 86, 3, 3, 0x111111)
    .setScrollFactor(0)

  // HP companheiro
  hud.companionHpBack = scene.add.rectangle(x + 82, y + 79, 180, 16, 0x123222)
    .setOrigin(0)
    .setStrokeStyle(2, 0x061a10)
    .setScrollFactor(0)

  hud.companionHpFill = scene.add.rectangle(x + 84, y + 81, 176, 12, 0x22c55e)
    .setOrigin(0)
    .setScrollFactor(0)

  hud.companionHpText = scene.add.text(x + 92, y + 78, '100/100', {
    fontSize: '12px',
    color: '#ffffff',
    fontFamily: 'monospace'
  }).setScrollFactor(0)

  // level / xp
  hud.levelText = scene.add.text(x + 82, y + 98, 'Lv. 1  XP 0  $ 0', {
    fontSize: '12px',
    color: '#3a2412',
    fontFamily: 'monospace'
  }).setScrollFactor(0)

  // botão inventário
  hud.inventoryButton = scene.add.rectangle(345, 36, 42, 42, 0x111111, 0.7)
    .setStrokeStyle(2, 0xffffff)
    .setScrollFactor(0)
    .setInteractive()

  hud.inventoryText = scene.add.text(333, 24, '🎒', {
    fontSize: '24px'
  }).setScrollFactor(0)

  Object.values(hud).forEach(obj => { if (obj && obj.setDepth) obj.setDepth(10) })

  return hud
}

export function updateHudHp(hud, playerHp, playerMaxHp, companionHp, companionMaxHp) {
  const playerPercent = Phaser.Math.Clamp(playerHp / playerMaxHp, 0, 1)
  const companionPercent = Phaser.Math.Clamp(companionHp / companionMaxHp, 0, 1)

  hud.playerHpFill.width = 176 * playerPercent
  hud.companionHpFill.width = 176 * companionPercent

  hud.playerHpText.setText(`${Math.max(playerHp, 0)}/${playerMaxHp}`)
  hud.companionHpText.setText(`${Math.max(companionHp, 0)}/${companionMaxHp}`)
}

export function updateHudStats(hud, level, xp, coins) {
  hud.levelText.setText(`Lv. ${level}  XP ${xp}  $ ${coins}`)
}
