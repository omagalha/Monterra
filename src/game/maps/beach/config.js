export const beachConfig = {
  id: 'beach',
  name: 'Praia',
  type: 'combat',
  background: 0x6fc2d6,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 150, y: 600 },
  exits: [
    {
      id: 'beach_to_town',
      to: 'town',
      x: 80,
      y: 600,
      width: 60,
      height: 220,
      label: 'Cidade Inicial'
    }
  ]
}
