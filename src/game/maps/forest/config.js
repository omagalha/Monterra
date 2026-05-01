export const forestConfig = {
  id: 'forest',
  name: 'Floresta',
  type: 'combat',
  background: 0x2f7d4a,

  // Macro-região vertical
  worldWidth: 2400,
  worldHeight: 3200,

  hasEnemies: true,
  hasVillagers: false,

  // Entrada pela parte mais baixa da floresta
  spawn: { x: 1200, y: 3010 },

  exits: [
    {
      id: 'forest_to_town',
      to: 'town',
      x: 1200,
      y: 3120,
      width: 260,
      height: 90,
      label: 'Cidade Inicial'
    },

    {
      id: 'forest_to_cave',
      to: 'cave',
      x: 180,
      y: 1680,
      width: 90,
      height: 280,
      label: 'Caverna'
    },

    {
      id: 'forest_to_mountain',
      to: 'mountain',
      x: 2220,
      y: 1180,
      width: 90,
      height: 280,
      label: 'Montanha'
    }
  ]
}
