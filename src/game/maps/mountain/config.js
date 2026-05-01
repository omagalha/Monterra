export const mountainConfig = {
  id: 'mountain',
  name: 'Montanha',
  type: 'combat',
  background: 0x6b7a8f,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 150, y: 600 },
  exits: [
    {
      id: 'mountain_to_forest',
      to: 'forest',
      x: 80,
      y: 600,
      width: 60,
      height: 220,
      label: 'Floresta'
    }
  ]
}
