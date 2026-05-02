import Phaser from 'phaser'
import { UI_COLORS, UI_FONT } from '../ui/theme'
import titleScreenUrl from '../../assets/monterra-title-screen.png'

export default class StartMenuScene extends Phaser.Scene {
  constructor() {
    super('StartMenuScene')
    this._starting = false
  }

  preload() {
    this.load.image('monterra-title-screen', titleScreenUrl)
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#080607')

    this.bg = this.add.image(width / 2, height / 2, 'monterra-title-screen').setDepth(0)
    const bgScale = Math.max(width / this.bg.width, height / this.bg.height) * 1.07
    this.bg.setScale(bgScale)

    this.addVignette(width, height)
    this.glowObjects = this.createCrystalGlows(width, height)
    this.buttonObjects = []
    this.createFeatureButtons(width, height)

    this.fadeOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1).setDepth(30)

    this.time.delayedCall(200, () => this.playEntranceSequence())
    this.time.addEvent({ delay: 350, repeat: -1, callback: () => this.spawnSparkle(width, height) })

    this.input.on('pointermove', p => this.onParallax(p, width, height))
    this.input.keyboard.once('keydown-ENTER', () => this.startGame())
    this.input.keyboard.once('keydown-SPACE', () => this.startGame())
  }

  addVignette(width, height) {
    const g = this.add.graphics().setDepth(2)

    // Top fade
    for (let i = 0; i < 80; i++) {
      g.fillStyle(0x000000, (1 - i / 80) * 0.72)
      g.fillRect(0, i, width, 1)
    }
    // Bottom fade
    for (let i = 0; i < 110; i++) {
      g.fillStyle(0x000000, (1 - i / 110) * 0.78)
      g.fillRect(0, height - i, width, 1)
    }
    // Side fades
    for (let i = 0; i < 55; i++) {
      const a = (1 - i / 55) * 0.32
      g.fillStyle(0x000000, a)
      g.fillRect(i, 0, 1, height)
      g.fillRect(width - i - 1, 0, 1, height)
    }
  }

  createSoftGlow(x, y, color, radius) {
    const g = this.add.graphics().setDepth(3).setAlpha(0)
    const steps = 7
    for (let i = steps; i >= 1; i--) {
      const r = radius * (i / steps)
      const a = 0.06 * (steps - i + 1) / steps
      g.fillStyle(color, a)
      g.fillCircle(x, y, r)
    }
    g.fillStyle(color, 0.35)
    g.fillCircle(x, y, radius * 0.12)
    return g
  }

  createCrystalGlows(width, height) {
    const glows = [
      // Central top crystal (above the logo in the image)
      this.createSoftGlow(width * 0.5, height * 0.19, 0x30c0b0, 110),
      // Left standing stone (~9% x, ~66% y)
      this.createSoftGlow(width * 0.09, height * 0.66, 0x30c0b0, 70),
      // Right standing stone (~91% x, ~66% y)
      this.createSoftGlow(width * 0.91, height * 0.66, 0x30c0b0, 70),
    ]
    return glows
  }

  startGlowPulse() {
    this.glowObjects.forEach((glow, i) => {
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.55, to: 1.0 },
        duration: 1900 + i * 400,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 500
      })
    })
  }

  spawnSparkle(width, height) {
    const isTeal = Math.random() > 0.38
    const color = isTeal ? 0x30c0b0 : 0xe8c050
    const size = Phaser.Math.FloatBetween(1.5, 5)
    const x = Phaser.Math.Between(width * 0.04, width * 0.96)
    const y = Phaser.Math.Between(height * 0.3, height * 0.82)
    const travelY = Phaser.Math.Between(25, 70)
    const travelX = Phaser.Math.FloatBetween(-18, 18)
    const duration = Phaser.Math.Between(1600, 3800)

    const g = this.add.graphics().setDepth(8).setAlpha(0)

    if (Math.random() > 0.55) {
      // Cross sparkle
      g.fillStyle(color, 1)
      g.fillRect(-size * 2, -1, size * 4, 2)
      g.fillRect(-1, -size * 2, 2, size * 4)
      g.fillCircle(0, 0, size * 0.8)
    } else {
      g.fillStyle(color, 1)
      g.fillCircle(0, 0, size)
    }
    g.setPosition(x, y)

    this.tweens.add({
      targets: g,
      alpha: { from: 0, to: Phaser.Math.FloatBetween(0.45, 0.9) },
      y: y - travelY,
      x: x + travelX,
      duration,
      ease: 'Sine.easeIn',
      yoyo: true,
      onComplete: () => g.destroy()
    })
  }

  createFeatureButtons(width, height) {
    const labels = ['EXPLORE', 'CAPTURE', 'BATTLE', 'GROW', 'CONQUER']
    const bottomPadding = Phaser.Math.Clamp(height * 0.045, 18, 40)
    const gap = 14
    const isCompact = width < 760
    const buttonCount = isCompact ? 3 : labels.length
    const buttonWidth = Phaser.Math.Clamp(
      (width - gap * (buttonCount + 1)) / buttonCount, 140, 240
    )
    const buttonHeight = 54
    const rowY = height - bottomPadding - buttonHeight / 2
    const startX = width / 2 - ((buttonWidth + gap) * (buttonCount - 1)) / 2

    labels.forEach((label, index) => {
      const row = isCompact && index >= 3 ? 1 : 0
      const col = isCompact && index >= 3 ? index - 3 : index
      const cols = row === 0 ? buttonCount : 2
      const xOffset = row === 0 ? startX : width / 2 - ((buttonWidth + gap) * (cols - 1)) / 2
      const x = xOffset + col * (buttonWidth + gap)
      const y = rowY - row * (buttonHeight + 10)

      const btn = this.createButton(x, y, buttonWidth, buttonHeight, label, () => this.startGame())
      this.buttonObjects.push({ ...btn, index })

      ;[btn.shadow, btn.button, btn.icon, btn.text].forEach(obj => {
        obj.setAlpha(0)
        obj.y += 55
      })
    })
  }

  createButton(x, y, bWidth, bHeight, label, onClick) {
    const shadow = this.add.rectangle(x + 4, y + 5, bWidth, bHeight, UI_COLORS.shadow, 0.45).setDepth(9)
    const button = this.add.rectangle(x, y, bWidth, bHeight, UI_COLORS.panel, 0.9)
      .setStrokeStyle(3, UI_COLORS.border)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
    const icon = this.add.rectangle(x - bWidth / 2 + 34, y, 11, 11, UI_COLORS.teal, 0.9)
      .setStrokeStyle(2, UI_COLORS.borderBright)
      .setRotation(Math.PI / 4)
      .setDepth(11)
    const text = this.add.text(x + 18, y + 1, label, {
      fontFamily: UI_FONT.body,
      fontSize: '15px',
      color: UI_COLORS.text,
      stroke: '#17100d',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(11)

    const group = [button, text, icon, shadow]

    button.on('pointerover', () => {
      this.tweens.killTweensOf(group)
      this.tweens.add({ targets: group, scaleX: 1.05, scaleY: 1.05, duration: 100, ease: 'Power2' })
      button.setFillStyle(UI_COLORS.panelSoft, 0.98)
      button.setStrokeStyle(3, UI_COLORS.borderBright)
      icon.setFillStyle(UI_COLORS.teal, 1)
      text.setColor(UI_COLORS.gold)
    })
    button.on('pointerout', () => {
      this.tweens.killTweensOf(group)
      this.tweens.add({ targets: group, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' })
      button.setFillStyle(UI_COLORS.panel, 0.9)
      button.setStrokeStyle(3, UI_COLORS.border)
      icon.setFillStyle(UI_COLORS.teal, 0.9)
      text.setColor(UI_COLORS.text)
    })
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: group,
        scaleX: 0.94, scaleY: 0.94,
        duration: 70,
        yoyo: true,
        onComplete: onClick
      })
    })

    return { shadow, button, icon, text }
  }

  playEntranceSequence() {
    // Phase 1: fade from black
    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => {
        // Phase 2: start glowing crystals
        this.startGlowPulse()

        // Phase 3: stagger buttons in
        this.buttonObjects.forEach(({ shadow, button, icon, text, index }) => {
          const delay = 80 + index * 110
          ;[shadow, button, icon, text].forEach(obj => {
            this.tweens.add({
              targets: obj,
              alpha: 1,
              y: obj.y - 55,
              duration: 550,
              delay,
              ease: 'Back.easeOut'
            })
          })
        })
      }
    })
  }

  onParallax(pointer, width, height) {
    const dx = (pointer.x - width / 2) / width
    const dy = (pointer.y - height / 2) / height
    this.tweens.killTweensOf(this.bg)
    this.tweens.add({
      targets: this.bg,
      x: width / 2 + dx * 20,
      y: height / 2 + dy * 12,
      duration: 850,
      ease: 'Power1'
    })
  }

  startGame() {
    if (this._starting) return
    this._starting = true
    this.cameras.main.fadeOut(650, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainScene'))
  }
}
