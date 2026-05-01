export const undergroundConfig = {
  id: 'underground',
  name: 'Subterrâneo',
  type: 'combat',
  background: 0x2e2e3a,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 600, y: 150 },
  exits: [
    {
      id: 'underground_to_graveyard',
      to: 'graveyard',
      x: 600,
      y: 80,
      width: 200,
      height: 60,
      label: 'Cemitério'
    }
  ]
}
