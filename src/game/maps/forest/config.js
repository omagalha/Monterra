export const forestConfig = {
  id: 'forest',
  name: 'Floresta',
  type: 'combat',
  background: 0x2f7d4a,
  worldWidth: 2200,
  worldHeight: 1800,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 1100, y: 1650 },
  exits: [
    {
      id: 'forest_to_town',
      to: 'town',
      x: 1100,
      y: 1720,
      width: 240,
      height: 70,
      label: 'Cidade Inicial'
    },
    {
      id: 'forest_to_mountain',
      to: 'mountain',
      x: 2050,
      y: 520,
      width: 80,
      height: 240,
      label: 'Montanha'
    },
    {
      id: 'forest_to_cave',
      to: 'cave',
      x: 140,
      y: 720,
      width: 80,
      height: 240,
      label: 'Caverna'
    }
  ]
}
