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
    const southRoad = this.add.rectangle(1100, 1600, 320, 140, 0xb98a4a)
    southRoad.setStrokeStyle(3, 0x7a5428)

    const centerPath = this.add.rectangle(1100, 1250, 180, 520, 0xb98a4a)
    centerPath.setStrokeStyle(3, 0x7a5428)

    const eastPath = this.add.rectangle(1640, 760, 520, 120, 0xb98a4a)
    eastPath.setStrokeStyle(3, 0x7a5428)

    const westPath = this.add.rectangle(480, 760, 420, 120, 0xb98a4a)
    westPath.setStrokeStyle(3, 0x7a5428)

    this.mapObjects.push(southRoad, centerPath, eastPath, westPath)

    const clearing = this.add.ellipse(1100, 960, 620, 360, 0x4f9a5f)
    clearing.setStrokeStyle(4, 0x2d5a36)
    this.mapObjects.push(clearing)

    const pond = this.add.ellipse(1500, 1220, 260, 160, 0x4dabf7)
    pond.setStrokeStyle(4, 0x1d4ed8)
    const pondInner = this.add.ellipse(1500, 1220, 190, 110, 0x7dd3fc)
    this.mapObjects.push(pond, pondInner)

    this.createCollisionZone(1500, 1220, 210, 120)

    const treePositions = [
      [180, 180], [300, 220], [460, 180], [620, 220], [1780, 180], [1940, 220], [2060, 180],
      [180, 420], [340, 520], [520, 400], [1820, 420], [1980, 500], [2100, 380],
      [220, 760], [340, 940], [420, 1120], [1880, 760], [1980, 920], [2100, 1080],
      [220, 1380], [380, 1520], [560, 1640], [1760, 1400], [1940, 1540], [2100, 1660],
      [860, 520], [980, 480], [1180, 500], [1320, 540],
      [760, 760], [880, 700], [980, 720], [1220, 680], [1360, 740],
      [760, 1160], [900, 1260], [1260, 1180], [1380, 1100]
    ]

    treePositions.forEach(([x, y]) => this.createTree(x, y))

    this.createRock(920, 850)
    this.createRock(1010, 820)
    this.createRock(1170, 880)
    this.createRock(1720, 580)
    this.createRock(620, 760)

    this.createFlower(1040, 1010)
    this.createFlower(1130, 920)
    this.createFlower(1210, 1000)
    this.createFlower(1460, 1090)
    this.createFlower(1580, 1100)
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

    this.xp += 20
    if (this.xp >= 100) {
      this.level += 1
      this.xp = 0
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

    this.playerHp -= 10
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
