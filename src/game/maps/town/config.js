export const townConfig = {
  id: 'town',
  name: 'Vila Raiz',
  type: 'safe',
  background: 0x62a875,
  worldWidth: 1800,
  worldHeight: 1600,
  hasEnemies: false,
  hasVillagers: true,
  spawn: { x: 900, y: 1370 },
  exits: [
    {
      id: 'town_to_forest',
      to: 'forest',
      x: 900,
      y: 80,
      width: 240,
      height: 60,
      label: 'Floresta'
    },
    {
      id: 'town_to_beach',
      to: 'beach',
      x: 1720,
      y: 760,
      width: 60,
      height: 260,
      label: 'Praia'
    },
    {
      id: 'town_to_desert',
      to: 'desert',
      x: 80,
      y: 760,
      width: 60,
      height: 260,
      label: 'Deserto'
    },
    {
      id: 'town_to_graveyard',
      to: 'graveyard',
      x: 900,
      y: 1520,
      width: 240,
      height: 60,
      label: 'Cemiterio'
    }
  ]
}
