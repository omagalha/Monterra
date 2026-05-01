export const townConfig = {
  id: 'town',
  name: 'Cidade Inicial',
  type: 'safe',
  background: 0x5fa86f,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: false,
  hasVillagers: true,
  spawn: { x: 600, y: 1000 },
  exits: [
    {
      id: 'town_to_forest',
      to: 'forest',
      x: 600,
      y: 80,
      width: 200,
      height: 60,
      label: 'Floresta'
    },
    {
      id: 'town_to_beach',
      to: 'beach',
      x: 1120,
      y: 600,
      width: 60,
      height: 220,
      label: 'Praia'
    },
    {
      id: 'town_to_desert',
      to: 'desert',
      x: 80,
      y: 600,
      width: 60,
      height: 220,
      label: 'Deserto'
    },
    {
      id: 'town_to_graveyard',
      to: 'graveyard',
      x: 600,
      y: 1120,
      width: 200,
      height: 60,
      label: 'Cemitério'
    }
  ]
}
