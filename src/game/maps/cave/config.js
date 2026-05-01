export const caveConfig = {
  id: 'cave',
  name: 'Caverna',
  type: 'combat',
  background: 0x4b4b57,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 1050, y: 600 },
  exits: [
    {
      id: 'cave_to_forest',
      to: 'forest',
      x: 1120,
      y: 600,
      width: 60,
      height: 220,
      label: 'Floresta'
    }
  ]
}
