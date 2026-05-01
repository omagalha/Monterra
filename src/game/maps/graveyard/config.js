export const graveyardConfig = {
  id: 'graveyard',
  name: 'Cemitério',
  type: 'combat',
  background: 0x5a4b6e,
  worldWidth: 1200,
  worldHeight: 1200,
  hasEnemies: true,
  hasVillagers: false,
  spawn: { x: 600, y: 150 },
  exits: [
    {
      id: 'graveyard_to_town',
      to: 'town',
      x: 600,
      y: 80,
      width: 200,
      height: 60,
      label: 'Cidade Inicial'
    },
    {
      id: 'graveyard_to_underground',
      to: 'underground',
      x: 600,
      y: 1120,
      width: 200,
      height: 60,
      label: 'Subterrâneo'
    }
  ]
}
