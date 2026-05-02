import { UI_COLORS, addPanel } from './theme'

export function createMiniMap(scene, worldWidth, worldHeight) {
  const miniMap = {}

  const PANEL_X = scene.scale.width - 124
  const PANEL_Y = 14
  const PANEL_W = 110
  const PANEL_H = 110
  const INNER_X = PANEL_X + 5
  const INNER_Y = PANEL_Y + 5
  const INNER_W = PANEL_W - 10
  const INNER_H = PANEL_H - 10

  const GRID_COLS = 20
  const GRID_ROWS = 20
  const CELL_W = INNER_W / GRID_COLS
  const CELL_H = INNER_H / GRID_ROWS

  miniMap.worldWidth = worldWidth
  miniMap.worldHeight = worldHeight
  miniMap.revealedCells = new Set()

  const [panelShadow, panel] = addPanel(scene, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, {
    fill: UI_COLORS.panel,
    alpha: 0.9,
    border: UI_COLORS.borderBright,
    depth: 10
  })
  miniMap.panelShadow = panelShadow
  miniMap.panel = panel

  miniMap.mapBg = scene.add.rectangle(INNER_X, INNER_Y, INNER_W, INNER_H, 0x203126)
    .setOrigin(0).setScrollFactor(0).setDepth(10)

  miniMap.fogGraphics = scene.add.graphics()
    .setScrollFactor(0)
    .setDepth(11)

  miniMap.playerDot = scene.add.circle(0, 0, 3, UI_COLORS.borderBright)
    .setScrollFactor(0)
    .setDepth(12)

  miniMap.drawFog = () => {
    miniMap.fogGraphics.clear()
    miniMap.fogGraphics.fillStyle(UI_COLORS.ink, 0.82)

    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        if (!miniMap.revealedCells.has(`${col},${row}`)) {
          miniMap.fogGraphics.fillRect(
            INNER_X + col * CELL_W,
            INNER_Y + row * CELL_H,
            CELL_W,
            CELL_H
          )
        }
      }
    }
  }

  miniMap.drawFog()

  miniMap.revealAt = (playerX, playerY) => {
    const mapX = (playerX / worldWidth) * INNER_W
    const mapY = (playerY / worldHeight) * INNER_H
    const col = Math.floor(mapX / CELL_W)
    const row = Math.floor(mapY / CELL_H)

    let changed = false
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const nc = col + dc
        const nr = row + dr
        if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS) {
          const key = `${nc},${nr}`
          if (!miniMap.revealedCells.has(key)) {
            miniMap.revealedCells.add(key)
            changed = true
          }
        }
      }
    }

    if (changed) miniMap.drawFog()
  }

  miniMap.updatePlayer = (playerX, playerY) => {
    miniMap.playerDot.x = INNER_X + (playerX / worldWidth) * INNER_W
    miniMap.playerDot.y = INNER_Y + (playerY / worldHeight) * INNER_H
  }

  miniMap.destroy = () => {
    miniMap.panelShadow.destroy()
    miniMap.panel.destroy()
    miniMap.mapBg.destroy()
    miniMap.fogGraphics.destroy()
    miniMap.playerDot.destroy()
  }

  return miniMap
}
