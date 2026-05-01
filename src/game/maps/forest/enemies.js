import { forestZones } from './zones'

const points = {
  southEntry: [
    { x: 1080, y: 2780 },
    { x: 1260, y: 2720 }
  ],

  lowerTrail: [
    { x: 980, y: 2480 },
    { x: 1180, y: 2380 },
    { x: 1360, y: 2460 }
  ],

  centralClearing: [
    { x: 920, y: 2100 },
    { x: 1120, y: 1980 },
    { x: 1320, y: 2080 }
  ],

  westCaveRoute: [
    { x: 520, y: 1720 },
    { x: 680, y: 1600 }
  ],

  eastMountainRoute: [
    { x: 1680, y: 1340 },
    { x: 1880, y: 1180 }
  ],

  denseWilds: [
    { x: 860, y: 1460 },
    { x: 1120, y: 1360 },
    { x: 1400, y: 1420 }
  ],

  deepNorth: [
    { x: 860, y: 780 },
    { x: 1120, y: 700 },
    { x: 1420, y: 760 }
  ],

  northernCrown: [
    { x: 980, y: 260 },
    { x: 1280, y: 220 }
  ]
}

export const forestEnemies = [
  {
    id: 'wild_slime',
    name: 'Slime Selvagem',
    hp: 100,
    speed: 0.6,
    color: 0xff6b6b,
    xpReward: 20,
    contactDamage: 10,
    zones: [
      forestZones.southEntry.id,
      forestZones.lowerTrail.id,
      forestZones.centralClearing.id
    ],
    spawnPoints: [
      ...points.southEntry,
      ...points.lowerTrail,
      ...points.centralClearing
    ]
  },
  {
    id: 'forest_spirit',
    name: 'Espírito da Floresta',
    hp: 155,
    speed: 0.9,
    color: 0x8b5cf6,
    xpReward: 35,
    contactDamage: 15,
    zones: [
      forestZones.westCaveRoute.id,
      forestZones.eastMountainRoute.id,
      forestZones.denseWilds.id,
      forestZones.deepNorth.id
    ],
    spawnPoints: [
      ...points.westCaveRoute,
      ...points.eastMountainRoute,
      ...points.denseWilds,
      ...points.deepNorth
    ]
  },
  {
    id: 'thorn_beast',
    name: 'Fera Espinhosa',
    hp: 220,
    speed: 1.05,
    color: 0x365314,
    xpReward: 55,
    contactDamage: 22,
    zones: [forestZones.northernCrown.id],
    spawnPoints: [...points.northernCrown]
  }
]
