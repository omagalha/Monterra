import Phaser from 'phaser'
import { maps } from '../maps'
import { createPlayer } from '../entities/Player'
import { createCompanion } from '../entities/Companion'
import { createEnemy } from '../entities/Enemy'
import { createDrop } from '../entities/Drop'
import { createHud, updateHudHp, updateHudStats } from '../ui/Hud'
import { createInventory } from '../ui/Inventory'
import { createNpc } from '../entities/Npc'
import { createDialogBox } from '../ui/DialogBox'
import { quests } from '../data/quests'
import { createQuestTracker } from '../ui/QuestTracker'
import { createMiniMap } from '../ui/MiniMap'
import { createInteractionPrompt } from '../ui/InteractionPrompt'
import { forestZones } from '../maps/forest/zones'
import { applyPlayerAttack } from '../systems/CombatSystem'
import { updateEnemyAI } from '../systems/EnemyAISystem'
import { updateEnemyVisibility } from '../systems/EnemyVisibilitySystem'
import { canCapture, attemptCapture } from '../systems/CaptureSystem'
import itemsSpriteUrl from '../../assets/icons/items.png'

export default class MainScene extends Phaser.Scene {
  currentMapId = 'town'
  currentMap = null

  mapObjects = []
  staticMapObjects = []
  mapExits = []
  mapExitLabels = []

  player
  companion
  cursors

  hud
  inventory

  enemies = []
  drops = []

  playerHp = 100
  playerMaxHp = 100
  companionHp = 100
  companionMaxHp = 100

  xp = 0
  coins = 0
  level = 1

  lastEnemySpawn = 0
  enemyMaxHP = 100

  lastDamageTime = 0
  damageCooldown = 900

  isTransitioningMap = false

  npcs = []
  dialogBox
  interactKey

  questTracker
  activeQuest = null
  questStates = {}
  pendingQuestReward = null

  miniMap
  lastMiniMapRevealTime = 0

  interactionPrompt
  nearbyNpc = null
  nearbyExit = null
  nearbyCapturable = null

  capturedCreatures = []
  activeCreature = null

  pendingRespawns = []

  targetEnemy = null
  lastAutoAttackTime = 0
  targetRing = null

  currentZone = null
  currentZoneText = null
  lastZoneId = null

  transitionOverlay

  collisionZones = []

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.spritesheet('items', itemsSpriteUrl, {
      frameWidth: 16,
      frameHeight: 16
    })
  }

  create() {
    this.textures.get('items').setFilter(Phaser.Textures.FilterMode.NEAREST)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.player = createPlayer(this, 0, 0)
    this.player.setDepth(5)
    this.companion = createCompanion(this, 0, 0)
    this.companion.setDepth(5)

    this.hud = createHud(this)
    this.inventory = createInventory(this)

    updateHudHp(this.hud, this.playerHp, this.playerMaxHp, this.companionHp, this.companionMaxHp)
    updateHudStats(this.hud, this.level, this.xp, this.coins)

    this.dialogBox = createDialogBox(this)
    this.questTracker = createQuestTracker(this)
    this.initializeQuestStates()
    this.interactionPrompt = createInteractionPrompt(this)

    this.currentZoneText = this.add.text(30, 64, '', {
      fontSize: '14px',
      color: '#d1fae5',
      fontFamily: 'monospace',
      backgroundColor: '#00000066',
      padding: { x: 8, y: 4 }
    })

    this.currentZoneText.setScrollFactor(0)
    this.currentZoneText.setDepth(50)
    this.currentZoneText.setVisible(false)

    this.transitionOverlay = this.add.rectangle(422, 195, 844, 390, 0x000000)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0)

    this.targetRing = this.add.circle(0, 0, 26, 0x000000, 0)
    this.targetRing.setStrokeStyle(2, 0xfacc15, 0.9)
    this.targetRing.setDepth(4)
    this.targetRing.setVisible(false)

    this.interactKey = this.input.keyboard.addKeys({
      e: Phaser.Input.Keyboard.KeyCodes.E,
      a: Phaser.Input.Keyboard.KeyCodes.A
    })

    this.hud.inventoryButton.on('pointerdown', () => {
      this.inventory.setVisible(!this.inventory.visible)
    })

    this.input.keyboard.on('keydown-I', () => {
      this.inventory.setVisible(!this.inventory.visible)
    })

    this.cameras.main.setZoom(0.65)
    this.cameras.main.startFollow(this.player, true, 0.04, 0.04)

    this.loadMap(this.currentMapId)
  }

  update(time) {
    if (!this.currentMap) return

    if (this.dialogBox?.isOpen) {
      this.interactionPrompt.hide()

      if (
        Phaser.Input.Keyboard.JustDown(this.interactKey.e) ||
        Phaser.Input.Keyboard.JustDown(this.interactKey.a)
      ) {
        this.dialogBox.next()
        if (!this.dialogBox.isOpen && this.pendingQuestReward) {
          this.completeQuestReward(this.pendingQuestReward)
          this.pendingQuestReward = null
        }
      }
      return
    }

    const speed = 3
    let moveX = 0
    let moveY = 0

    if (this.cursors.left.isDown) moveX = -1
    else if (this.cursors.right.isDown) moveX = 1

    if (this.cursors.up.isDown) moveY = -1
    else if (this.cursors.down.isDown) moveY = 1

    const nextX = Phaser.Math.Clamp(this.player.x + moveX * speed, 20, this.currentMap.config.worldWidth - 20)
    const nextY = Phaser.Math.Clamp(this.player.y + moveY * speed, 20, this.currentMap.config.worldHeight - 20)

    if (!this.isCollidingAt(nextX, this.player.y)) {
      this.player.x = nextX
    }

    if (!this.isCollidingAt(this.player.x, nextY)) {
      this.player.y = nextY
    }

    this.updateCurrentZone()

    if (this.miniMap) {
      this.miniMap.updatePlayer(this.player.x, this.player.y)

      if (time > this.lastMiniMapRevealTime + 120) {
        this.miniMap.revealAt(this.player.x, this.player.y)
        this.lastMiniMapRevealTime = time
      }
    }

    const followSpeed = this.activeCreature
      ? 0.03 + this.activeCreature.speed * 0.03
      : 0.04
    this.companion.x += (this.player.x - 35 - this.companion.x) * followSpeed
    this.companion.y += (this.player.y + 25 - this.companion.y) * followSpeed

    this.updateEnemies()
    this.checkEnemyDamage(time)
    this.updateAutoAttack(time)
    this.checkRespawns()
    this.checkDrops()
    this.updateInteractionPrompt()
    this.checkNpcInteraction()
    this.checkCaptureInteraction()
    this.checkMapExits()
  }

  loadMap(mapId) {
    this.clearCurrentMap()

    this.currentMapId = mapId
    this.currentMap = maps[mapId]

    const { config, enemies } = this.currentMap

    if (this.miniMap) {
      this.miniMap.destroy()
    }
    this.miniMap = createMiniMap(this, config.worldWidth, config.worldHeight)

    this.cameras.main.setBackgroundColor(config.background)
    this.cameras.main.setBounds(0, 0, config.worldWidth, config.worldHeight)

    this.drawMapBase(config)
    this.createMapExits(config.exits)

    this.player.setPosition(config.spawn.x, config.spawn.y)
    this.companion.setPosition(config.spawn.x - 35, config.spawn.y + 25)

    if (config.hasEnemies) {
      enemies.forEach((enemyData) => {
        enemyData.spawnPoints.forEach((point) => {
          this.spawnEnemy(point.x, point.y, enemyData)
        })
      })
    }

    this.spawnMapNpcs(this.currentMap.npcs)
  }

  clearCurrentMap() {
    this.mapObjects.forEach((obj) => obj.destroy())
    this.mapObjects = []

    this.staticMapObjects.forEach((obj) => obj.destroy())
    this.staticMapObjects = []

    this.mapExits.forEach((exit) => exit.destroy())
    this.mapExits = []

    this.mapExitLabels.forEach((label) => label.destroy())
    this.mapExitLabels = []

    this.enemies.forEach((enemy) => {
      enemy.healthBar?.destroy()
      enemy.healthFill?.destroy()
      enemy.destroy()
    })
    this.enemies = []

    this.drops.forEach((drop) => drop.destroy())
    this.drops = []

    this.npcs.forEach((npc) => npc.destroy())
    this.npcs = []

    this.collisionZones.forEach((zone) => zone.destroy())
    this.collisionZones = []

    this.pendingRespawns = []

    this.targetEnemy = null
    if (this.targetRing) this.targetRing.setVisible(false)

    if (this.miniMap) {
      this.miniMap.destroy()
      this.miniMap = null
    }

    this.currentZone = null
    this.lastZoneId = null

    if (this.currentZoneText) {
      this.currentZoneText.setVisible(false)
    }
  }

  drawMapBase(config) {
    const bg = this.add.rectangle(
      config.worldWidth / 2,
      config.worldHeight / 2,
      config.worldWidth,
      config.worldHeight,
      config.background
    ).setDepth(-1)
    this.addStaticMapObject(bg)

    if (config.id === 'town') {
      const roadHorizontal = this.add.rectangle(
        config.worldWidth / 2,
        config.worldHeight / 2,
        config.worldWidth,
        110,
        0xc89b5a
      )

      const roadVertical = this.add.rectangle(
        config.worldWidth / 2,
        config.worldHeight / 2,
        110,
        config.worldHeight,
        0xc89b5a
      )

      this.addStaticMapObject(roadHorizontal, roadVertical)
    }

    const title = this.add.text(30, 30, config.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    title.setScrollFactor(0)
    this.addStaticMapObject(title)

    if (config.id === 'town') {
      this.drawTownDecoration()
    }

    if (config.id === 'forest') {
      this.drawForestDecoration()
    }
  }

  createCollisionZone(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height)
    zone.setOrigin(0.5)
    zone.setActive(false)
    this.collisionZones.push(zone)
    return zone
  }

  addStaticMapObject(...objects) {
    objects.forEach((obj) => {
      obj.setActive?.(false)
      this.staticMapObjects.push(obj)
    })
  }

  isCollidingAt(x, y) {
    const playerRect = new Phaser.Geom.Rectangle(x - 16, y - 16, 32, 32)

    return this.collisionZones.some((zone) => {
      const zoneRect = new Phaser.Geom.Rectangle(
        zone.x - zone.width / 2,
        zone.y - zone.height / 2,
        zone.width,
        zone.height
      )
      return Phaser.Geom.Intersects.RectangleToRectangle(playerRect, zoneRect)
    })
  }

  drawHouse(g, x, y) {
    g.fillStyle(0x8b5a2b)
    g.fillRect(x - 90, y - 60, 180, 120)
    g.lineStyle(3, 0x5b3718)
    g.strokeRect(x - 90, y - 60, 180, 120)

    g.fillStyle(0x5a2d14)
    g.fillRect(x - 100, y - 71, 200, 42)
    g.lineStyle(3, 0x2f1408)
    g.strokeRect(x - 100, y - 71, 200, 42)

    g.fillStyle(0x4a2f1a)
    g.fillRect(x - 14, y + 1, 28, 46)
    g.lineStyle(2, 0x2b1a0d)
    g.strokeRect(x - 14, y + 1, 28, 46)

    g.fillStyle(0x93c5fd)
    g.fillRect(x - 58, y - 13, 26, 26)
    g.lineStyle(2, 0x1e3a8a)
    g.strokeRect(x - 58, y - 13, 26, 26)

    g.fillStyle(0x93c5fd)
    g.fillRect(x + 32, y - 13, 26, 26)
    g.lineStyle(2, 0x1e3a8a)
    g.strokeRect(x + 32, y - 13, 26, 26)

    this.createCollisionZone(x, y + 10, 180, 110)
  }

  drawTree(g, x, y) {
    g.fillStyle(0x6b3f1d)
    g.fillRect(x - 9, y + 5, 18, 34)
    g.lineStyle(2, 0x3b220f)
    g.strokeRect(x - 9, y + 5, 18, 34)

    g.fillStyle(0x15803d)
    g.fillCircle(x - 18, y + 10, 22)
    g.fillCircle(x + 18, y + 10, 22)

    g.fillStyle(0x166534)
    g.fillCircle(x, y, 30)
    g.lineStyle(2, 0x0b3b1d)
    g.strokeCircle(x, y, 30)

    this.createCollisionZone(x, y + 12, 56, 60)
  }

  drawFenceRow(g, startX, y, amount) {
    for (let i = 0; i < amount; i++) {
      const fx = startX + i * 24
      g.fillStyle(0xd6b37a)
      g.fillRect(fx - 8, y - 14, 16, 28)
      g.lineStyle(2, 0x7c4a21)
      g.strokeRect(fx - 8, y - 14, 16, 28)
    }
  }

  drawFlower(g, x, y) {
    g.fillStyle(0xf472b6)
    g.fillCircle(x - 6, y, 4)
    g.fillCircle(x + 6, y, 4)
    g.fillCircle(x, y - 6, 4)
    g.fillCircle(x, y + 6, 4)
    g.fillStyle(0xfacc15)
    g.fillCircle(x, y, 4)
  }

  drawRock(g, x, y) {
    g.fillStyle(0x8d99ae)
    g.fillEllipse(x, y, 34, 24)
    g.lineStyle(2, 0x5c677d)
    g.strokeEllipse(x, y, 34, 24)
    this.createCollisionZone(x, y, 28, 20)
  }

  drawPathRect(g, x, y, width, height, color = 0xb98a4a) {
    g.fillStyle(color)
    g.fillRect(x - width / 2, y - height / 2, width, height)
    g.lineStyle(3, 0x7a5428)
    g.strokeRect(x - width / 2, y - height / 2, width, height)
  }

  drawPathEllipse(g, x, y, width, height, color = 0xb98a4a) {
    g.fillStyle(color)
    g.fillEllipse(x, y, width, height)
    g.lineStyle(3, 0x7a5428)
    g.strokeEllipse(x, y, width, height)
  }

  drawGroundPatch(g, x, y, width, height, color = 0x3f8f55, alpha = 1) {
    g.fillStyle(color, alpha)
    g.fillEllipse(x, y, width, height)
    g.lineStyle(2, 0x2d5a36, 0.35)
    g.strokeEllipse(x, y, width, height)
  }

  drawPond(g, x, y, width, height, collisionWidth, collisionHeight) {
    g.fillStyle(0x4dabf7)
    g.fillEllipse(x, y, width, height)
    g.lineStyle(4, 0x1d4ed8)
    g.strokeEllipse(x, y, width, height)
    g.fillStyle(0x7dd3fc)
    g.fillEllipse(x, y, width * 0.72, height * 0.62)
    this.createCollisionZone(x, y, collisionWidth, collisionHeight)
  }

  drawTreeCluster(g, positions) {
    positions.forEach(([x, y]) => this.drawTree(g, x, y))
  }

  drawRockCluster(g, positions) {
    positions.forEach(([x, y]) => this.drawRock(g, x, y))
  }

  drawFlowerPatch(g, positions) {
    positions.forEach(([x, y]) => this.drawFlower(g, x, y))
  }

  drawTownDecoration() {
    const g = this.add.graphics()
    this.addStaticMapObject(g)

    this.drawHouse(g, 250, 260)
    this.drawHouse(g, 920, 260)
    this.drawHouse(g, 260, 930)

    this.drawPond(g, 920, 880, 180, 120, 150, 90)

    this.drawTree(g, 120, 140)
    this.drawTree(g, 150, 420)
    this.drawTree(g, 1080, 150)
    this.drawTree(g, 1030, 420)
    this.drawTree(g, 160, 1080)
    this.drawTree(g, 1020, 1040)
    this.drawTree(g, 920, 1040)

    this.drawFenceRow(g, 470, 340, 6)
    this.drawFenceRow(g, 810, 340, 5)
    this.drawFenceRow(g, 170, 860, 4)

    this.drawFlower(g, 820, 760)
    this.drawFlower(g, 860, 740)
    this.drawFlower(g, 980, 760)
    this.drawFlower(g, 1010, 920)
    this.drawFlower(g, 870, 940)

    // this.drawCollisionDebug()
  }

  drawForestDecoration() {
    const g = this.add.graphics()
    this.addStaticMapObject(g)

    this.drawForestTerrain(g)
    this.drawForestPaths(g)
    this.drawForestWater(g)

    this.drawForestSouthEntry(g)
    this.drawForestLowerTrail(g)
    this.drawForestCentralClearing(g)
    this.drawForestWestCaveRoute(g)
    this.drawForestEastMountainRoute(g)
    this.drawForestDenseWilds(g)
    this.drawForestDeepNorth(g)
    this.drawForestNorthernCrown(g)

    // this.drawCollisionDebug()
    // this.drawForestZoneDebug()
  }

  drawForestTerrain(g) {
    this.drawGroundPatch(g, 1200, 2580, 900, 520, 0x3f8f55, 0.55)
    this.drawGroundPatch(g, 1200, 2100, 1050, 620, 0x4f9a5f, 0.75)
    this.drawGroundPatch(g, 560, 1680, 760, 520, 0x3a7f4d, 0.7)
    this.drawGroundPatch(g, 1800, 1260, 760, 560, 0x376f45, 0.75)
    this.drawGroundPatch(g, 1200, 1460, 1180, 640, 0x356b43, 0.75)
    this.drawGroundPatch(g, 1200, 820, 1220, 520, 0x2f623d, 0.82)
    this.drawGroundPatch(g, 1200, 300, 1020, 320, 0x294f34, 0.88)
  }

  drawForestPaths(g) {
    this.drawPathRect(g, 1200, 3020, 360, 230)
    this.drawPathRect(g, 1200, 2670, 240, 560)
    this.drawPathEllipse(g, 1200, 2420, 460, 220)
    this.drawPathRect(g, 1200, 2220, 210, 360)
    this.drawPathEllipse(g, 1200, 2050, 760, 360)
    this.drawPathRect(g, 760, 1780, 720, 130)
    this.drawPathEllipse(g, 520, 1680, 420, 240)
    this.drawPathRect(g, 1200, 1650, 190, 440)
    this.drawPathEllipse(g, 1200, 1440, 520, 240)
    this.drawPathRect(g, 1660, 1320, 680, 120)
    this.drawPathEllipse(g, 1900, 1180, 460, 260)
    this.drawPathRect(g, 1200, 1050, 170, 500)
    this.drawPathEllipse(g, 1200, 820, 520, 240)
    this.drawPathRect(g, 1200, 520, 150, 350)
    this.drawPathEllipse(g, 1200, 300, 520, 220)
  }

  drawForestWater(g) {
    this.drawPond(g, 1540, 2180, 300, 180, 230, 125)
    this.drawPond(g, 760, 1320, 220, 140, 170, 95)
    this.drawPond(g, 1540, 720, 220, 130, 165, 90)
  }

  drawForestSouthEntry(g) {
    this.drawTreeCluster(g, [
      [260, 3000], [420, 2920], [620, 3060],
      [1780, 3060], [1980, 2920], [2160, 3000],
      [360, 2780], [560, 2700],
      [1840, 2700], [2040, 2780]
    ])
    this.drawRockCluster(g, [
      [980, 2940], [1420, 2940], [900, 2780], [1500, 2760]
    ])
    this.drawFlowerPatch(g, [
      [1080, 2920], [1160, 2860], [1280, 2900], [1340, 2820]
    ])
  }

  drawForestLowerTrail(g) {
    this.drawTreeCluster(g, [
      [760, 2580], [860, 2480], [760, 2360],
      [1640, 2580], [1540, 2480], [1640, 2360],
      [620, 2280], [720, 2160],
      [1680, 2160], [1780, 2280]
    ])
    this.drawRockCluster(g, [
      [1020, 2480], [1380, 2460], [980, 2260], [1420, 2240]
    ])
    this.drawFlowerPatch(g, [
      [1120, 2520], [1260, 2500], [1160, 2320], [1320, 2320]
    ])
  }

  drawForestCentralClearing(g) {
    this.drawTreeCluster(g, [
      [620, 2160], [700, 2020], [760, 1900],
      [1760, 2160], [1680, 2020], [1620, 1900],
      [860, 1780], [1020, 1720],
      [1380, 1720], [1540, 1780],
      [700, 2300], [880, 2360],
      [1520, 2360], [1700, 2300]
    ])
    this.drawRockCluster(g, [
      [920, 2100], [1040, 1980], [1360, 2020], [1420, 2180], [1500, 2260]
    ])
    this.drawFlowerPatch(g, [
      [1040, 2120], [1140, 2060], [1260, 2080],
      [1320, 2160], [1160, 2220], [1460, 2100]
    ])
  }

  drawForestWestCaveRoute(g) {
    this.drawTreeCluster(g, [
      [220, 1380], [360, 1340], [520, 1380],
      [220, 1980], [380, 2020], [560, 1960],
      [760, 1500], [840, 1620], [760, 1860],
      [420, 1500], [360, 1820]
    ])
    this.drawRockCluster(g, [
      [360, 1660], [500, 1560], [640, 1740], [780, 1800]
    ])
    this.drawFlowerPatch(g, [
      [520, 1760], [620, 1660], [700, 1580]
    ])
  }

  drawForestEastMountainRoute(g) {
    this.drawTreeCluster(g, [
      [1540, 980], [1680, 900], [1840, 900],
      [2040, 960], [2160, 1060],
      [1520, 1540], [1680, 1600],
      [1900, 1540], [2080, 1460]
    ])
    this.drawRockCluster(g, [
      [1640, 1240], [1780, 1160], [1960, 1260], [2080, 1160], [1840, 1420]
    ])
    this.drawFlowerPatch(g, [
      [1740, 1320], [1880, 1340], [1980, 1220]
    ])
  }

  drawForestDenseWilds(g) {
    this.drawTreeCluster(g, [
      [540, 1120], [660, 1040], [820, 1100],
      [980, 1060], [1140, 1120], [1300, 1060],
      [1460, 1100], [1620, 1040], [1800, 1120],
      [520, 1540], [680, 1600], [860, 1540],
      [1540, 1540], [1720, 1600], [1880, 1540],
      [900, 1260], [1040, 1220], [1360, 1220], [1500, 1280]
    ])
    this.drawRockCluster(g, [
      [960, 1460], [1120, 1360], [1320, 1460], [1480, 1360], [700, 1240]
    ])
    this.drawFlowerPatch(g, [
      [1040, 1520], [1220, 1480], [1400, 1520]
    ])
  }

  drawForestDeepNorth(g) {
    this.drawTreeCluster(g, [
      [420, 620], [560, 540], [720, 600],
      [880, 520], [1040, 560], [1200, 500],
      [1360, 560], [1520, 520], [1680, 600],
      [1840, 540], [1980, 620],
      [520, 880], [700, 960], [900, 900],
      [1500, 900], [1700, 960], [1880, 880],
      [760, 740], [940, 700], [1460, 700], [1640, 760]
    ])
    this.drawRockCluster(g, [
      [860, 820], [1040, 760], [1340, 800], [1500, 860], [1180, 940]
    ])
    this.drawFlowerPatch(g, [
      [980, 880], [1240, 860], [1400, 940]
    ])
  }

  drawForestNorthernCrown(g) {
    this.drawTreeCluster(g, [
      [360, 180], [520, 260], [700, 180],
      [880, 260], [1040, 180], [1200, 260],
      [1360, 180], [1520, 260], [1700, 180],
      [1880, 260], [2040, 180],
      [620, 420], [820, 460], [1020, 430],
      [1380, 430], [1580, 460], [1780, 420]
    ])
    this.drawRockCluster(g, [
      [980, 300], [1160, 240], [1320, 320], [1480, 260]
    ])
    this.drawFlowerPatch(g, [
      [1080, 380], [1240, 360], [1400, 390]
    ])
  }

  drawForestZoneDebug() {
    Object.values(forestZones).forEach((zoneData) => {
      const { x, y, width, height } = zoneData.bounds

      const rect = this.add.rectangle(
        x + width / 2,
        y + height / 2,
        width,
        height,
        0xffffff,
        0.04
      )

      rect.setStrokeStyle(2, 0xffffff, 0.18)
      this.addStaticMapObject(rect)

      const label = this.add.text(
        x + 12,
        y + 12,
        `${zoneData.name} [${zoneData.dangerLevel}]`,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace',
          backgroundColor: '#00000066'
        }
      )

      this.addStaticMapObject(label)
    })
  }

  isPointInsideZone(x, y, zoneBounds) {
    return (
      x >= zoneBounds.x &&
      x <= zoneBounds.x + zoneBounds.width &&
      y >= zoneBounds.y &&
      y <= zoneBounds.y + zoneBounds.height
    )
  }

  getCurrentForestZone(playerX, playerY) {
    const zones = Object.values(forestZones)

    return zones.find((zone) =>
      this.isPointInsideZone(playerX, playerY, zone.bounds)
    ) ?? null
  }

  updateCurrentZone() {
    if (this.currentMapId !== 'forest') {
      this.currentZone = null
      this.lastZoneId = null

      if (this.currentZoneText) {
        this.currentZoneText.setVisible(false)
      }

      return
    }

    const zone = this.getCurrentForestZone(this.player.x, this.player.y)
    this.currentZone = zone

    if (!zone) {
      this.lastZoneId = null
      this.currentZoneText.setVisible(false)
      return
    }

    if (zone.id !== this.lastZoneId) {
      this.lastZoneId = zone.id
      this.currentZoneText.setText(`Área: ${zone.name} | Perigo ${zone.dangerLevel}`)
      this.currentZoneText.setVisible(true)
      this.currentZoneText.setAlpha(0)

      this.tweens.add({
        targets: this.currentZoneText,
        alpha: 1,
        duration: 180
      })
    }
  }

  drawCollisionDebug() {
    this.collisionZones.forEach((zone) => {
      const rect = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0xff0000, 0.15)
      rect.setStrokeStyle(1, 0xff0000)
      this.addStaticMapObject(rect)
    })
  }

  createMapExits(exits) {
    exits.forEach((exitData) => {
      const exitZone = this.add.zone(exitData.x, exitData.y, exitData.width, exitData.height)
      exitZone.exitData = exitData
      exitZone.setActive(false)

      const visual = this.add.rectangle(
        exitData.x,
        exitData.y,
        exitData.width,
        exitData.height,
        0xffffff,
        0.08
      ).setStrokeStyle(2, 0xffffff, 0.35)

      const label = this.add.text(
        exitData.x - 40,
        exitData.y - 10,
        exitData.label,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace',
          backgroundColor: '#00000055'
        }
      )
      label.setActive(false)

      this.mapExits.push(exitZone)
      this.addStaticMapObject(visual)
      this.mapExitLabels.push(label)
    })
  }

  updateInteractionPrompt() {
    this.nearbyNpc = this.npcs.find((npc) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 70
    ) ?? null

    const playerArea = new Phaser.Geom.Rectangle(
      this.player.x - 16,
      this.player.y - 16,
      32,
      32
    )

    this.nearbyExit = this.mapExits.find((exitZone) =>
      Phaser.Geom.Intersects.RectangleToRectangle(
        playerArea,
        new Phaser.Geom.Rectangle(
          exitZone.x - exitZone.width / 2 - 24,
          exitZone.y - exitZone.height / 2 - 24,
          exitZone.width + 48,
          exitZone.height + 48
        )
      )
    ) ?? null

    this.nearbyCapturable = this.enemies.find((enemy) => {
      if (!enemy.active || enemy.hp <= 0) return false
      if (!canCapture(enemy)) return false
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 65
    }) ?? null

    if (this.nearbyNpc) {
      this.interactionPrompt.show('E para conversar')
      return
    }

    if (this.nearbyCapturable) {
      this.interactionPrompt.show(`E para capturar ${this.nearbyCapturable.name}`)
      return
    }

    if (this.nearbyExit) {
      this.interactionPrompt.show(`E para entrar em ${this.nearbyExit.exitData.label}`)
      return
    }

    this.interactionPrompt.hide()
  }

  checkMapExits() {
    if (this.isTransitioningMap) return
    if (!this.nearbyExit) return
    if (this.nearbyNpc || this.nearbyCapturable) return

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey.e) ||
      Phaser.Input.Keyboard.JustDown(this.interactKey.a)
    ) {
      this.transitionToMap(this.nearbyExit.exitData.to)
    }
  }

  transitionToMap(mapId) {
    if (this.isTransitioningMap) return
    this.isTransitioningMap = true
    this.interactionPrompt.hide()

    this.tweens.add({
      targets: this.transitionOverlay,
      alpha: 1,
      duration: 250,
      onComplete: () => {
        this.loadMap(mapId)
        this.tweens.add({
          targets: this.transitionOverlay,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            this.isTransitioningMap = false
          }
        })
      }
    })
  }

  spawnMapNpcs(npcsData = []) {
    npcsData.forEach((npcData) => {
      const npc = createNpc(this, npcData)
      this.updateNpcQuestIndicator(npc)
      this.npcs.push(npc)
    })
  }

  updateNpcQuestIndicator(npc) {
    const npcData = npc.npcData

    if (!npcData.questId) {
      npc.questIndicatorBg.setVisible(false)
      npc.questIndicatorText.setVisible(false)
      return
    }

    const quest = this.questStates[npcData.questId]

    if (!quest) {
      npc.questIndicatorBg.setVisible(false)
      npc.questIndicatorText.setVisible(false)
      return
    }

    if (!quest.started && !quest.rewarded) {
      npc.questIndicatorBg.setFillStyle(0x7f1d1d, 0.95)
      npc.questIndicatorBg.setVisible(true)
      npc.questIndicatorText.setText('!')
      npc.questIndicatorText.setColor('#ff4d4d')
      npc.questIndicatorText.setPosition(-4, -66)
      npc.questIndicatorText.setVisible(true)
      return
    }

    if (quest.completed && !quest.rewarded) {
      npc.questIndicatorBg.setFillStyle(0x5c4300, 0.95)
      npc.questIndicatorBg.setVisible(true)
      npc.questIndicatorText.setText('?')
      npc.questIndicatorText.setColor('#ffd24d')
      npc.questIndicatorText.setPosition(-4, -66)
      npc.questIndicatorText.setVisible(true)
      return
    }

    npc.questIndicatorBg.setVisible(false)
    npc.questIndicatorText.setVisible(false)
  }

  initializeQuestStates() {
    quests.forEach((quest) => {
      this.questStates[quest.id] = {
        ...quest,
        progress: 0,
        started: false,
        completed: false,
        rewarded: false
      }
    })
  }

  checkNpcInteraction() {
    if (!this.nearbyNpc) return

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey.e) ||
      Phaser.Input.Keyboard.JustDown(this.interactKey.a)
    ) {
      const npcData = this.nearbyNpc.npcData

      if (!this.dialogBox.isOpen) {
        const lines = this.getNpcDialogue(npcData)
        this.dialogBox.open(npcData, lines)

        if (npcData.questId) {
          this.startQuest(npcData.questId)
        }
      }
    }
  }

  getNpcDialogue(npcData) {
    if (!npcData.questId) {
      return Array.isArray(npcData.dialogue) ? npcData.dialogue : ['...']
    }

    const quest = this.questStates[npcData.questId]
    if (!quest) return npcData.dialogue.default ?? ['...']

    if (quest.rewarded) {
      return npcData.dialogue.rewarded
    }

    if (quest.completed) {
      this.pendingQuestReward = quest.id
      return npcData.dialogue.completed
    }

    if (quest.started) {
      return npcData.dialogue.inProgress
    }

    return npcData.dialogue.default
  }

  startQuest(questId) {
    const quest = this.questStates[questId]

    if (!quest || quest.started || quest.rewarded) return

    quest.started = true
    this.activeQuest = quest

    this.questTracker.show(quest)

    this.npcs.forEach((npc) => {
      if (npc.npcData.questId === questId) {
        this.updateNpcQuestIndicator(npc)
      }
    })
  }

  handleQuestProgress(enemyType) {
    if (!this.activeQuest) return
    if (!this.activeQuest.started || this.activeQuest.completed) return

    if (
      this.activeQuest.type === 'defeat' &&
      this.activeQuest.targetEnemy === enemyType
    ) {
      this.activeQuest.progress += 1

      if (this.activeQuest.progress >= this.activeQuest.requiredAmount) {
        this.activeQuest.progress = this.activeQuest.requiredAmount
        this.activeQuest.completed = true

        this.npcs.forEach((npc) => {
          if (npc.npcData.questId === this.activeQuest.id) {
            this.updateNpcQuestIndicator(npc)
          }
        })
      }

      this.questTracker.update(this.activeQuest)
    }
  }

  completeQuestReward(questId) {
    const quest = this.questStates[questId]
    if (!quest || !quest.completed || quest.rewarded) return

    quest.rewarded = true

    this.xp += quest.reward.xp
    this.coins += quest.reward.coins

    while (this.xp >= 100) {
      this.xp -= 100
      this.level += 1
    }

    updateHudStats(this.hud, this.level, this.xp, this.coins)

    if (this.activeQuest?.id === questId) {
      this.questTracker.update({
        ...quest,
        description: `${quest.description} (recompensa recebida)`
      })
    }

    this.npcs.forEach((npc) => {
      if (npc.npcData.questId === questId) {
        this.updateNpcQuestIndicator(npc)
      }
    })
  }

  spawnEnemy(x, y, enemyData = {}) {
    const enemy = createEnemy(this, x, y, enemyData)

    enemy.id = enemyData.id ?? 'wild_enemy'
    enemy.key = enemyData.key || enemyData.id
    enemy.name = enemyData.name ?? 'Inimigo Selvagem'
    enemy.enemyType = enemyData.id ?? 'wild_enemy'
    enemy.enemyName = enemyData.name ?? 'Inimigo Selvagem'
    enemy.maxHp = enemyData.hp ?? this.enemyMaxHP
    enemy.hp = enemyData.hp ?? this.enemyMaxHP
    enemy.speed = enemyData.speed ?? Phaser.Math.FloatBetween(0.4, 0.9)
    enemy.color = enemyData.color ?? 0xff6b6b
    enemy.xpReward = enemyData.xpReward ?? 0
    enemy.contactDamage = enemyData.contactDamage ?? 5
    enemy.behavior = enemyData.behavior ?? 'wander'
    enemy.aggroRadius = enemyData.aggroRadius ?? 120
    enemy.preferredRange = enemyData.preferredRange ?? 20
    enemy.wanderRadius = enemyData.wanderRadius ?? 60
    enemy.leashRadius = enemyData.leashRadius ?? 180
    enemy.attackCooldown = enemyData.attackCooldown ?? 900

    enemy.spawnX = x
    enemy.spawnY = y
    enemy.enemyData = enemyData
    enemy.state = 'idle'
    enemy.directionX = Phaser.Math.Between(0, 1) ? 1 : -1
    enemy.directionY = Phaser.Math.Between(0, 1) ? 1 : -1
    enemy.nextDecisionTime = 0
    enemy.lastAttackTime = 0
    enemy.chargeUntil = 0
    enemy.chargeCooldownUntil = 0
    enemy.chargeDirX = 0
    enemy.chargeDirY = 0
    enemy.floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2)
    enemy.homeBias = Phaser.Math.FloatBetween(0.8, 1.25)

    enemy.healthBar = this.add.rectangle(x, y - 34, 34, 5, 0x1f2937)
    enemy.healthBar.setDepth(9)
    enemy.healthBar.setVisible(false)

    enemy.healthFill = this.add.rectangle(x - 17, y - 34, 34, 5, 0x22c55e)
    enemy.healthFill.setOrigin(0, 0.5)
    enemy.healthFill.setDepth(10)
    enemy.healthFill.setVisible(false)

    enemy.setSize(40, 40)
    enemy.setInteractive()
    enemy.on('pointerdown', () => { this.selectEnemy(enemy) })

    enemy.setDepth(6)
    this.enemies.push(enemy)
  }

  updateEnemyHealthBar(enemy) {
    if (!enemy.healthBar || !enemy.healthFill) return

    enemy.healthBar.setPosition(enemy.x, enemy.y - 34)
    enemy.healthFill.setPosition(enemy.x - 17, enemy.y - 34)

    const ratio = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1)
    enemy.healthFill.width = 34 * ratio
  }

  updateEnemies() {
    updateEnemyAI(this, this.enemies)
    updateEnemyVisibility(this, this.enemies)
  }

  selectEnemy(enemy) {
    if (!enemy || enemy.hp <= 0 || !enemy.active) return
    this.targetEnemy = enemy
  }

  updateAutoAttack(time) {
    const target = this.targetEnemy

    if (!target || !target.active || target.hp <= 0) {
      this.targetEnemy = null
      this.targetRing.setVisible(false)
      return
    }

    this.targetRing.setPosition(target.x, target.y)
    this.targetRing.setVisible(true)

    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, target.x, target.y
    )

    if (dist > 160) return

    const interval = this.activeCreature
      ? Math.max(450, 1200 - this.activeCreature.speed * 400)
      : 900

    if (time < this.lastAutoAttackTime + interval) return

    this.lastAutoAttackTime = time
    this.attackEnemy(target)
  }

  attackEnemy(enemy) {
    if (!enemy || enemy.hp <= 0) return

    const damage = this.activeCreature?.damage ?? 20

    const result = applyPlayerAttack(this, enemy, {
      damage,
      attacker: this.player,
      companion: this.companion
    })

    if (result.damage > 0) {
      this.spawnDamageNumber(enemy.x, enemy.y - 20, result.damage)
    }

    if (result.killed) this.killEnemy(enemy)
  }

  spawnDamageNumber(x, y, amount) {
    const offsetX = Phaser.Math.Between(-10, 10)

    const text = this.add.text(x + offsetX, y, `-${amount}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ff4d4d',
      stroke: '#000000',
      strokeThickness: 3
    })
      .setOrigin(0.5)
      .setDepth(11)

    this.tweens.add({
      targets: text,
      y: y - 38,
      alpha: 0,
      duration: 580,
      ease: 'Cubic.Out',
      onComplete: () => text.destroy()
    })
  }

  checkCaptureInteraction() {
    if (!this.nearbyCapturable) return
    if (this.nearbyNpc) return

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey.e) ||
      Phaser.Input.Keyboard.JustDown(this.interactKey.a)
    ) {
      this.tryCapture(this.nearbyCapturable)
    }
  }

  tryCapture(enemy) {
    const result = attemptCapture(enemy)

    if (result.success) {
      this.capturedCreatures.push(result.creature)

      if (!this.activeCreature) {
        this.activeCreature = result.creature
        this.updateCompanionAppearance(result.creature)
      }

      this.showCaptureResult(enemy.x, enemy.y - 30, true, result.creature.name)
      this.killEnemy(enemy)
    } else {
      this.showCaptureResult(enemy.x, enemy.y - 30, false, enemy.name)
    }
  }

  showCaptureResult(x, y, success, name) {
    const label = success ? `${name} capturado!` : `${name} escapou!`
    const color = success ? '#facc15' : '#ff6b6b'

    const text = this.add.text(x, y, label, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 3
    })
      .setOrigin(0.5)
      .setDepth(12)

    this.tweens.add({
      targets: text,
      y: y - 44,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.Out',
      onComplete: () => text.destroy()
    })
  }

  updateCompanionAppearance(creature) {
    if (this.companion.setAppearance) {
      this.companion.setAppearance(creature.color)
    }
  }

  killEnemy(enemy) {
    if (this.targetEnemy === enemy) {
      this.targetEnemy = null
      this.targetRing.setVisible(false)
    }

    this.handleQuestProgress(enemy.enemyType)

    const drop = createDrop(this, enemy.x, enemy.y, 'coin')
    this.drops.push(drop)

    this.xp += enemy.xpReward ?? 20

    while (this.xp >= 100) {
      this.xp -= 100
      this.level += 1
    }

    updateHudStats(this.hud, this.level, this.xp, this.coins)

    this.pendingRespawns.push({
      x: enemy.spawnX,
      y: enemy.spawnY,
      enemyData: enemy.enemyData,
      respawnAt: this.time.now + 30000
    })

    this.tweens.add({
      targets: enemy,
      scale: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        enemy.healthBar.destroy()
        enemy.healthFill.destroy()
        enemy.destroy()
        this.enemies = this.enemies.filter(e => e !== enemy)
      }
    })
  }

  checkRespawns() {
    const now = this.time.now

    this.pendingRespawns = this.pendingRespawns.filter((entry) => {
      if (now < entry.respawnAt) return true

      const distToPlayer = Phaser.Math.Distance.Between(
        entry.x, entry.y, this.player.x, this.player.y
      )

      if (distToPlayer < 220) return true

      this.spawnEnemy(entry.x, entry.y, entry.enemyData)
      return false
    })
  }

  checkEnemyDamage(time) {
    this.enemies.forEach((enemy) => {
      if (!enemy.active) return
      if (enemy.hp <= 0) return

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      )

      const contactRange =
        enemy.behavior === 'kite'
          ? enemy.preferredRange * 0.55
          : enemy.behavior === 'charge'
            ? 34
            : 28

      if (distance <= contactRange && time >= enemy.lastAttackTime + enemy.attackCooldown) {
        enemy.lastAttackTime = time
        enemy.lastCombatTime = time

        this.playerHp = Math.max(0, this.playerHp - enemy.contactDamage)

        updateHudHp(
          this.hud,
          this.playerHp,
          this.playerMaxHp,
          this.companionHp,
          this.companionMaxHp
        )

        this.tweens.add({
          targets: this.player,
          alpha: 0.35,
          duration: 80,
          yoyo: true,
          repeat: 2
        })
      }
    })

    if (this.playerHp <= 0) {
      this.playerHp = 0
      this.gameOver()
    }
  }

  gameOver() {
    this.add.rectangle(
      this.cameras.main.scrollX + 195,
      this.cameras.main.scrollY + 422,
      390,
      844,
      0x000000,
      0.7
    ).setDepth(20)

    this.add.text(
      this.cameras.main.scrollX + 92,
      this.cameras.main.scrollY + 380,
      'GAME OVER',
      {
        fontSize: '36px',
        color: '#ff4d4d',
        fontFamily: 'monospace'
      }
    ).setDepth(20)

    this.scene.pause()
  }

  checkDrops() {
    this.drops.forEach(drop => {
      if (drop.collected) return

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        drop.x, drop.y
      )

      if (distance < 40) {
        drop.collected = true
        this.inventory.addItem(drop.type, 1)

        if (drop.type === 'coin') this.coins += drop.value

        updateHudStats(this.hud, this.level, this.xp, this.coins)

        this.tweens.add({
          targets: drop,
          y: drop.y - 20,
          alpha: 0,
          duration: 200,
          onComplete: () => { drop.destroy() }
        })
      }
    })

    this.drops = this.drops.filter(drop => !drop.collected)
  }
}
