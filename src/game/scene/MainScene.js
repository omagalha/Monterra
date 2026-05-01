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
import itemsSpriteUrl from '../../assets/icons/items.png'

export default class MainScene extends Phaser.Scene {
  currentMapId = 'town'
  currentMap = null

  mapObjects = []
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

    this.transitionOverlay = this.add.rectangle(195, 422, 390, 844, 0x000000)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0)

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

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

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

    const followSpeed = 0.04
    this.companion.x += (this.player.x - 35 - this.companion.x) * followSpeed
    this.companion.y += (this.player.y + 25 - this.companion.y) * followSpeed

    this.updateEnemies()
    this.checkEnemyDamage(time)
    this.checkDrops()
    this.updateInteractionPrompt()
    this.checkNpcInteraction()
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
    this.mapObjects.push(bg)

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

      this.mapObjects.push(roadHorizontal, roadVertical)
    }

    const title = this.add.text(30, 30, config.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    title.setScrollFactor(0)
    this.mapObjects.push(title)

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
    this.collisionZones.push(zone)
    return zone
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

  createHouse(x, y) {
    const body = this.add.rectangle(x, y, 180, 120, 0x8b5a2b)
    const roof = this.add.rectangle(x, y - 50, 200, 42, 0x5a2d14)
    const door = this.add.rectangle(x, y + 24, 28, 46, 0x4a2f1a)
    const windowLeft = this.add.rectangle(x - 45, y, 26, 26, 0x93c5fd)
    const windowRight = this.add.rectangle(x + 45, y, 26, 26, 0x93c5fd)

    body.setStrokeStyle(3, 0x5b3718)
    roof.setStrokeStyle(3, 0x2f1408)
    door.setStrokeStyle(2, 0x2b1a0d)
    windowLeft.setStrokeStyle(2, 0x1e3a8a)
    windowRight.setStrokeStyle(2, 0x1e3a8a)

    this.mapObjects.push(body, roof, door, windowLeft, windowRight)
    this.createCollisionZone(x, y + 10, 180, 110)
  }

  createTree(x, y) {
    const trunk = this.add.rectangle(x, y + 22, 18, 34, 0x6b3f1d)
    const leavesMain = this.add.circle(x, y, 30, 0x166534)
    const leavesLeft = this.add.circle(x - 18, y + 10, 22, 0x15803d)
    const leavesRight = this.add.circle(x + 18, y + 10, 22, 0x15803d)

    trunk.setStrokeStyle(2, 0x3b220f)
    leavesMain.setStrokeStyle(2, 0x0b3b1d)

    this.mapObjects.push(trunk, leavesMain, leavesLeft, leavesRight)
    this.createCollisionZone(x, y + 12, 56, 60)
  }

  createFenceRow(startX, y, amount) {
    for (let i = 0; i < amount; i++) {
      const fence = this.add.rectangle(startX + i * 24, y, 16, 28, 0xd6b37a)
      fence.setStrokeStyle(2, 0x7c4a21)
      this.mapObjects.push(fence)
    }
  }

  createFlower(x, y) {
    const center = this.add.circle(x, y, 4, 0xfacc15)
    const petal1 = this.add.circle(x - 6, y, 4, 0xf472b6)
    const petal2 = this.add.circle(x + 6, y, 4, 0xf472b6)
    const petal3 = this.add.circle(x, y - 6, 4, 0xf472b6)
    const petal4 = this.add.circle(x, y + 6, 4, 0xf472b6)

    this.mapObjects.push(center, petal1, petal2, petal3, petal4)
  }

  createRock(x, y) {
    const rock = this.add.ellipse(x, y, 34, 24, 0x8d99ae)
    rock.setStrokeStyle(2, 0x5c677d)
    this.mapObjects.push(rock)

    this.createCollisionZone(x, y, 28, 20)
  }

  createPathRect(x, y, width, height, color = 0xb98a4a) {
    const path = this.add.rectangle(x, y, width, height, color)
    path.setStrokeStyle(3, 0x7a5428)
    this.mapObjects.push(path)
    return path
  }

  createPathEllipse(x, y, width, height, color = 0xb98a4a) {
    const path = this.add.ellipse(x, y, width, height, color)
    path.setStrokeStyle(3, 0x7a5428)
    this.mapObjects.push(path)
    return path
  }

  createGroundPatch(x, y, width, height, color = 0x3f8f55, alpha = 1) {
    const patch = this.add.ellipse(x, y, width, height, color, alpha)
    patch.setStrokeStyle(2, 0x2d5a36, 0.35)
    this.mapObjects.push(patch)
    return patch
  }

  createTreeCluster(positions) {
    positions.forEach(([x, y]) => this.createTree(x, y))
  }

  createRockCluster(positions) {
    positions.forEach(([x, y]) => this.createRock(x, y))
  }

  createFlowerPatch(positions) {
    positions.forEach(([x, y]) => this.createFlower(x, y))
  }

  createForestPond(x, y, width, height, collisionWidth, collisionHeight) {
    const pond = this.add.ellipse(x, y, width, height, 0x4dabf7)
    pond.setStrokeStyle(4, 0x1d4ed8)

    const pondInner = this.add.ellipse(x, y, width * 0.72, height * 0.62, 0x7dd3fc)

    this.mapObjects.push(pond, pondInner)
    this.createCollisionZone(x, y, collisionWidth, collisionHeight)

    return pond
  }

  drawTownDecoration() {
    this.createHouse(250, 260)
    this.createHouse(920, 260)
    this.createHouse(260, 930)

    const pond = this.add.ellipse(920, 880, 180, 120, 0x4dabf7)
    pond.setStrokeStyle(4, 0x1d4ed8)
    const pondInner = this.add.ellipse(920, 880, 130, 80, 0x7dd3fc)
    this.mapObjects.push(pond, pondInner)
    this.createCollisionZone(920, 880, 150, 90)

    this.createTree(120, 140)
    this.createTree(150, 420)
    this.createTree(1080, 150)
    this.createTree(1030, 420)
    this.createTree(160, 1080)
    this.createTree(1020, 1040)
    this.createTree(920, 1040)

    this.createFenceRow(470, 340, 6)
    this.createFenceRow(810, 340, 5)
    this.createFenceRow(170, 860, 4)

    this.createFlower(820, 760)
    this.createFlower(860, 740)
    this.createFlower(980, 760)
    this.createFlower(1010, 920)
    this.createFlower(870, 940)

    // this.drawCollisionDebug()
  }

  drawForestDecoration() {
    this.drawForestTerrain()
    this.drawForestPaths()
    this.drawForestWater()

    this.drawForestSouthEntry()
    this.drawForestLowerTrail()
    this.drawForestCentralClearing()
    this.drawForestWestCaveRoute()
    this.drawForestEastMountainRoute()
    this.drawForestDenseWilds()
    this.drawForestDeepNorth()
    this.drawForestNorthernCrown()

    // Use durante desenvolvimento para validar colisões
    // this.drawCollisionDebug()

    // Use quando adicionar o debug das zonas
    // this.drawForestZoneDebug()
  }

  drawForestTerrain() {
    // Grandes manchas de variação no solo.
    // Isso evita que o mapa grande pareça uma cor chapada.
    this.createGroundPatch(1200, 2580, 900, 520, 0x3f8f55, 0.55)
    this.createGroundPatch(1200, 2100, 1050, 620, 0x4f9a5f, 0.75)
    this.createGroundPatch(560, 1680, 760, 520, 0x3a7f4d, 0.7)
    this.createGroundPatch(1800, 1260, 760, 560, 0x376f45, 0.75)
    this.createGroundPatch(1200, 1460, 1180, 640, 0x356b43, 0.75)
    this.createGroundPatch(1200, 820, 1220, 520, 0x2f623d, 0.82)
    this.createGroundPatch(1200, 300, 1020, 320, 0x294f34, 0.88)
  }

  drawForestPaths() {
    // Entrada da cidade para dentro da floresta
    this.createPathRect(1200, 3020, 360, 230)
    this.createPathRect(1200, 2670, 240, 560)

    // Trilha baixa
    this.createPathEllipse(1200, 2420, 460, 220)
    this.createPathRect(1200, 2220, 210, 360)

    // Clareira central
    this.createPathEllipse(1200, 2050, 760, 360)

    // Bifurcação oeste para caverna
    this.createPathRect(760, 1780, 720, 130)
    this.createPathEllipse(520, 1680, 420, 240)

    // Subida central para mata densa
    this.createPathRect(1200, 1650, 190, 440)
    this.createPathEllipse(1200, 1440, 520, 240)

    // Rota leste para montanha
    this.createPathRect(1660, 1320, 680, 120)
    this.createPathEllipse(1900, 1180, 460, 260)

    // Passagem para floresta profunda
    this.createPathRect(1200, 1050, 170, 500)
    this.createPathEllipse(1200, 820, 520, 240)

    // Topo selvagem
    this.createPathRect(1200, 520, 150, 350)
    this.createPathEllipse(1200, 300, 520, 220)
  }

  drawForestWater() {
    // Lago principal perto da clareira
    this.createForestPond(1540, 2180, 300, 180, 230, 125)

    // Lago menor na mata densa
    this.createForestPond(760, 1320, 220, 140, 170, 95)

    // Água pequena no norte para dar sensação de área mais rara
    this.createForestPond(1540, 720, 220, 130, 165, 90)
  }

  drawForestSouthEntry() {
    this.createTreeCluster([
      [260, 3000], [420, 2920], [620, 3060],
      [1780, 3060], [1980, 2920], [2160, 3000],

      [360, 2780], [560, 2700],
      [1840, 2700], [2040, 2780]
    ])

    this.createRockCluster([
      [980, 2940],
      [1420, 2940],
      [900, 2780],
      [1500, 2760]
    ])

    this.createFlowerPatch([
      [1080, 2920],
      [1160, 2860],
      [1280, 2900],
      [1340, 2820]
    ])
  }

  drawForestLowerTrail() {
    this.createTreeCluster([
      [760, 2580], [860, 2480], [760, 2360],
      [1640, 2580], [1540, 2480], [1640, 2360],

      [620, 2280], [720, 2160],
      [1680, 2160], [1780, 2280]
    ])

    this.createRockCluster([
      [1020, 2480],
      [1380, 2460],
      [980, 2260],
      [1420, 2240]
    ])

    this.createFlowerPatch([
      [1120, 2520],
      [1260, 2500],
      [1160, 2320],
      [1320, 2320]
    ])
  }

  drawForestCentralClearing() {
    // A clareira precisa respirar: menos árvores no centro e mais borda natural.
    this.createTreeCluster([
      [620, 2160], [700, 2020], [760, 1900],
      [1760, 2160], [1680, 2020], [1620, 1900],

      [860, 1780], [1020, 1720],
      [1380, 1720], [1540, 1780],

      [700, 2300], [880, 2360],
      [1520, 2360], [1700, 2300]
    ])

    this.createRockCluster([
      [920, 2100],
      [1040, 1980],
      [1360, 2020],
      [1420, 2180],
      [1500, 2260]
    ])

    this.createFlowerPatch([
      [1040, 2120],
      [1140, 2060],
      [1260, 2080],
      [1320, 2160],
      [1160, 2220],
      [1460, 2100]
    ])
  }

  drawForestWestCaveRoute() {
    this.createTreeCluster([
      [220, 1380], [360, 1340], [520, 1380],
      [220, 1980], [380, 2020], [560, 1960],

      [760, 1500], [840, 1620], [760, 1860],
      [420, 1500], [360, 1820]
    ])

    this.createRockCluster([
      [360, 1660],
      [500, 1560],
      [640, 1740],
      [780, 1800]
    ])

    this.createFlowerPatch([
      [520, 1760],
      [620, 1660],
      [700, 1580]
    ])
  }

  drawForestEastMountainRoute() {
    this.createTreeCluster([
      [1540, 980], [1680, 900], [1840, 900],
      [2040, 960], [2160, 1060],

      [1520, 1540], [1680, 1600],
      [1900, 1540], [2080, 1460]
    ])

    this.createRockCluster([
      [1640, 1240],
      [1780, 1160],
      [1960, 1260],
      [2080, 1160],
      [1840, 1420]
    ])

    this.createFlowerPatch([
      [1740, 1320],
      [1880, 1340],
      [1980, 1220]
    ])
  }

  drawForestDenseWilds() {
    this.createTreeCluster([
      [540, 1120], [660, 1040], [820, 1100],
      [980, 1060], [1140, 1120], [1300, 1060],
      [1460, 1100], [1620, 1040], [1800, 1120],

      [520, 1540], [680, 1600], [860, 1540],
      [1540, 1540], [1720, 1600], [1880, 1540],

      [900, 1260], [1040, 1220], [1360, 1220], [1500, 1280]
    ])

    this.createRockCluster([
      [960, 1460],
      [1120, 1360],
      [1320, 1460],
      [1480, 1360],
      [700, 1240]
    ])

    this.createFlowerPatch([
      [1040, 1520],
      [1220, 1480],
      [1400, 1520]
    ])
  }

  drawForestDeepNorth() {
    this.createTreeCluster([
      [420, 620], [560, 540], [720, 600],
      [880, 520], [1040, 560], [1200, 500],
      [1360, 560], [1520, 520], [1680, 600],
      [1840, 540], [1980, 620],

      [520, 880], [700, 960], [900, 900],
      [1500, 900], [1700, 960], [1880, 880],

      [760, 740], [940, 700], [1460, 700], [1640, 760]
    ])

    this.createRockCluster([
      [860, 820],
      [1040, 760],
      [1340, 800],
      [1500, 860],
      [1180, 940]
    ])

    this.createFlowerPatch([
      [980, 880],
      [1240, 860],
      [1400, 940]
    ])
  }

  drawForestNorthernCrown() {
    this.createTreeCluster([
      [360, 180], [520, 260], [700, 180],
      [880, 260], [1040, 180], [1200, 260],
      [1360, 180], [1520, 260], [1700, 180],
      [1880, 260], [2040, 180],

      [620, 420], [820, 460], [1020, 430],
      [1380, 430], [1580, 460], [1780, 420]
    ])

    this.createRockCluster([
      [980, 300],
      [1160, 240],
      [1320, 320],
      [1480, 260]
    ])

    this.createFlowerPatch([
      [1080, 380],
      [1240, 360],
      [1400, 390]
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
      this.mapObjects.push(rect)

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

      this.mapObjects.push(label)
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
      this.mapObjects.push(rect)
    })
  }

  createMapExits(exits) {
    exits.forEach((exitData) => {
      const exitZone = this.add.zone(exitData.x, exitData.y, exitData.width, exitData.height)
      exitZone.exitData = exitData

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

      this.mapExits.push(exitZone)
      this.mapObjects.push(visual)
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

    if (this.nearbyNpc) {
      this.interactionPrompt.show('E para conversar')
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
      this.mapObjects.push(npc)
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

  spawnEnemy(x, y, enemyData = null) {
    const enemy = createEnemy(this, x, y)

    enemy.hp = enemyData?.hp ?? this.enemyMaxHP
    enemy.maxHp = enemyData?.hp ?? this.enemyMaxHP
    enemy.speed = enemyData?.speed ?? Phaser.Math.FloatBetween(0.4, 0.9)
    enemy.directionX = Phaser.Math.Between(-1, 1)
    enemy.directionY = Phaser.Math.Between(-1, 1)
    enemy.enemyType = enemyData?.id ?? 'wild_enemy'
    enemy.enemyName = enemyData?.name ?? 'Inimigo Selvagem'
    enemy.enemyColor = enemyData?.color ?? 0xff6b6b
    enemy.contactDamage = enemyData?.contactDamage ?? 10
    enemy.xpReward = enemyData?.xpReward ?? 20

    if (enemy.setFillStyle) {
      enemy.setFillStyle(enemy.enemyColor)
    } else if (enemy.list?.[1]?.setFillStyle) {
      enemy.list[1].setFillStyle(enemy.enemyColor)
    }

    enemy.healthBar = this.add.rectangle(enemy.x, enemy.y - 45, 46, 8, 0x000000)
    enemy.healthFill = this.add.rectangle(enemy.x - 21, enemy.y - 45, 42, 4, 0xff3b3b)
    enemy.healthFill.setOrigin(0, 0.5)

    enemy.setSize(40, 40)
    enemy.setInteractive()
    enemy.on('pointerdown', () => { this.attackEnemy(enemy) })

    this.enemies.push(enemy)
  }

  updateEnemies() {
    this.enemies.forEach((enemy) => {
      if (!enemy.active) return

      enemy.x += enemy.directionX * enemy.speed
      enemy.y += enemy.directionY * enemy.speed

      enemy.x = Phaser.Math.Clamp(enemy.x, 30, this.currentMap.config.worldWidth - 30)
      enemy.y = Phaser.Math.Clamp(enemy.y, 30, this.currentMap.config.worldHeight - 30)

      if (Math.random() < 0.015) {
        enemy.directionX = Phaser.Math.Between(-1, 1)
        enemy.directionY = Phaser.Math.Between(-1, 1)
      }

      enemy.healthBar.x = enemy.x
      enemy.healthBar.y = enemy.y - 45
      enemy.healthFill.x = enemy.x - 21
      enemy.healthFill.y = enemy.y - 45
    })
  }

  attackEnemy(enemy) {
    if (!enemy || enemy.hp <= 0) return

    enemy.hp -= 20

    const percent = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1)
    enemy.healthFill.width = 42 * percent

    this.tweens.add({
      targets: enemy,
      alpha: 0.2,
      duration: 80,
      yoyo: true
    })

    this.tweens.add({
      targets: this.companion,
      x: enemy.x - 20,
      y: enemy.y,
      duration: 120,
      yoyo: true
    })

    if (enemy.hp <= 0) this.killEnemy(enemy)
  }

  killEnemy(enemy) {
    this.handleQuestProgress(enemy.enemyType)

    const drop = createDrop(this, enemy.x, enemy.y, 'coin')
    this.drops.push(drop)

    this.xp += enemy.xpReward ?? 20

    while (this.xp >= 100) {
      this.xp -= 100
      this.level += 1
    }

    updateHudStats(this.hud, this.level, this.xp, this.coins)

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

  checkEnemyDamage(time) {
    if (time < this.lastDamageTime + this.damageCooldown) return

    const touchingEnemy = this.enemies.find(enemy =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 55
    )

    if (!touchingEnemy) return

    this.playerHp -= touchingEnemy.contactDamage ?? 10
    this.lastDamageTime = time

    updateHudHp(this.hud, this.playerHp, this.playerMaxHp, this.companionHp, this.companionMaxHp)

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 80,
      yoyo: true
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
