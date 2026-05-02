export const desertEnemies = [
  {
    id: 'sand_spirit',
    name: 'Espírito da Areia',
    hp: 120,
    speed: 0.65,
    color: 0xf4a261,
    spawnPoints: [
      { x: 260, y: 260 },
      { x: 540, y: 430 },
      { x: 760, y: 620 },
      { x: 940, y: 300 }
    ]
  },
  {
    id: 'vayote',
    name: 'Vayote',
    hp: 92,
    speed: 1.05,
    xpReward: 24,
    contactDamage: 10,
    behavior: 'kite',
    color: 0xd6b56d,
    spawnPoints: [
      { x: 360, y: 720 },
      { x: 860, y: 520 }
    ]
  }
]
