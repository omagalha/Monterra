export const desertConfig = {
  id: 'desert',
  name: 'Deserto',
  type: 'combat',
  background: 0xd9b36c,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 1050, y: 600 },
  exits: [
    {
      id: 'desert_to_town',
      to: 'town',
      x: 1120,
      y: 600,
      width: 60,
      height: 220,
      label: 'Cidade Inicial'
    }
  ]
}
