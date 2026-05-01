export const maps = {
  town: {
    id: 'town',
    name: 'Cidade Inicial',
    background: 0x5fa86f,
    hasEnemies: false,
    spawn: { x: 600, y: 600 },
    exits: [
      {
        to: 'forest',
        x: 600,
        y: 40,
        width: 180,
        height: 50,
        label: 'Floresta'
      }
    ]
  },

  forest: {
    id: 'forest',
    name: 'Floresta',
    background: 0x2f7d4a,
    hasEnemies: true,
    spawn: { x: 600, y: 1080 },
    exits: [
      {
        to: 'town',
        x: 600,
        y: 1160,
        width: 180,
        height: 50,
        label: 'Cidade'
      }
    ]
  }
}
