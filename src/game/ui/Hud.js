import Phaser from 'phaser'
import { UI_COLORS, UI_FONT, addPanel } from './theme'

export function createHud(scene) {
  const hud = {}

  const x = 14
  const y = 14

  const [panelShadow, panel] = addPanel(scene, x, y, 285, 118, {
    fill: UI_COLORS.panel,
    alpha: 0.94,
    border: UI_COLORS.borderBright,
    borderWidth: 3
  })
  hud.panelShadow = panelShadow
  hud.panel = panel

  hud.inner = scene.add.rectangle(x + 8, y + 8, 269, 102, UI_COLORS.panelAlt, 0.92)
    .setOrigin(0)
    .setStrokeStyle(1, UI_COLORS.border)
    .setScrollFactor(0)

  hud.playerPortraitBg = scene.add.rectangle(x + 15, y + 17, 54, 54, UI_COLORS.panelSoft)
    .setOrigin(0)
    .setStrokeStyle(2, UI_COLORS.borderBright)
    .setScrollFactor(0)

  hud.playerFace = scene.add.circle(x + 42, y + 44, 16, 0xf0c27b)
    .setStrokeStyle(2, UI_COLORS.ink)
    .setScrollFactor(0)

  hud.playerHair = scene.add.rectangle(x + 42, y + 32, 28, 8, 0x3a2412)
    .setScrollFactor(0)

  hud.playerEye = scene.add.rectangle(x + 48, y + 44, 3, 3, UI_COLORS.ink)
    .setScrollFactor(0)

  hud.nameText = scene.add.text(x + 82, y + 14, 'THALES', {
    fontSize: '15px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0)

  hud.playerHpBack = scene.add.rectangle(x + 82, y + 38, 180, 16, UI_COLORS.redDark)
    .setOrigin(0)
    .setStrokeStyle(2, UI_COLORS.ink)
    .setScrollFactor(0)

  hud.playerHpFill = scene.add.rectangle(x + 84, y + 40, 176, 12, UI_COLORS.red)
    .setOrigin(0)
    .setScrollFactor(0)

  hud.playerHpText = scene.add.text(x + 92, y + 37, '100/100', {
    fontSize: '12px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0)

  hud.companionPortraitBg = scene.add.circle(x + 42, y + 89, 20, UI_COLORS.panelSoft)
    .setStrokeStyle(2, UI_COLORS.borderBright)
    .setScrollFactor(0)

  hud.companionIcon = scene.add.circle(x + 42, y + 89, 13, UI_COLORS.teal)
    .setStrokeStyle(2, UI_COLORS.tealDark)
    .setScrollFactor(0)

  hud.companionEye = scene.add.rectangle(x + 47, y + 86, 3, 3, UI_COLORS.ink)
    .setScrollFactor(0)

  hud.companionHpBack = scene.add.rectangle(x + 82, y + 79, 180, 16, UI_COLORS.greenDark)
    .setOrigin(0)
    .setStrokeStyle(2, UI_COLORS.ink)
    .setScrollFactor(0)

  hud.companionHpFill = scene.add.rectangle(x + 84, y + 81, 176, 12, UI_COLORS.green)
    .setOrigin(0)
    .setScrollFactor(0)

  hud.companionHpText = scene.add.text(x + 92, y + 78, '100/100', {
    fontSize: '12px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0)

  hud.levelText = scene.add.text(x + 82, y + 98, 'Lv. 1  XP 0  $ 0', {
    fontSize: '12px',
    color: UI_COLORS.muted,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0)

  const btnX = scene.scale.width - 35
  hud.inventoryButton = scene.add.rectangle(btnX, 36, 42, 42, UI_COLORS.panel, 0.9)
    .setStrokeStyle(2, UI_COLORS.borderBright)
    .setScrollFactor(0)
    .setInteractive()

  hud.inventoryText = scene.add.text(btnX, 36, 'BAG', {
    fontSize: '11px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setOrigin(0.5).setScrollFactor(0)

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
  hud.levelText.setText(`Lv. ${level}  XP ${xp}  G ${coins}`)
}
