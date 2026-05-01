import { forestZones } from './zones'

export const forestEnemyTypes = {
  slime: {
    key: 'slime',
    id: 'wild_slime',
    name: 'Slime Selvagem',
    color: 0x7be07b,
    hp: 70,
    speed: 0.62,
    xpReward: 10,
    contactDamage: 6,
    difficulty: 1,
    behavior: 'wander',
    aggroRadius: 115,
    preferredRange: 18,
    wanderRadius: 70,
    leashRadius: 150,
    attackCooldown: 900,
    habitat: 'southern_paths'
  },

  spirit: {
    key: 'spirit',
    id: 'forest_spirit',
    name: 'Espírito da Floresta',
    color: 0xb089ff,
    hp: 120,
    speed: 0.92,
    xpReward: 22,
    contactDamage: 12,
    difficulty: 3,
    behavior: 'kite',
    aggroRadius: 230,
    preferredRange: 105,
    wanderRadius: 95,
    leashRadius: 260,
    attackCooldown: 700,
    habitat: 'dense_wilds'
  },

  thornBeast: {
    key: 'thorn_beast',
    id: 'thorn_beast',
    name: 'Fera Espinhosa',
    color: 0x5f7f2f,
    hp: 190,
    speed: 1.04,
    xpReward: 40,
    contactDamage: 20,
    difficulty: 5,
    behavior: 'charge',
    aggroRadius: 210,
    preferredRange: 20,
    wanderRadius: 85,
    leashRadius: 280,
    attackCooldown: 1200,
    habitat: 'northern_crown'
  }
}

export const forestEnemyZones = {
  southEntry: {
    zoneId: forestZones.southEntry.id,
    zoneName: forestZones.southEntry.name,
    groups: [
      {
        type: 'slime',
        points: [
          { x: 960, y: 2860 },
          { x: 1120, y: 2790 },
          { x: 1280, y: 2830 }
        ]
      }
    ]
  },

  lowerTrail: {
    zoneId: forestZones.lowerTrail.id,
    zoneName: forestZones.lowerTrail.name,
    groups: [
      {
        type: 'slime',
        points: [
          { x: 930, y: 2550 },
          { x: 1110, y: 2440 },
          { x: 1280, y: 2370 },
          { x: 1440, y: 2480 }
        ]
      }
    ]
  },

  centralClearing: {
    zoneId: forestZones.centralClearing.id,
    zoneName: forestZones.centralClearing.name,
    groups: [
      {
        type: 'slime',
        points: [
          { x: 900, y: 2140 },
          { x: 1080, y: 1980 },
          { x: 1260, y: 2080 },
          { x: 1450, y: 2160 }
        ]
      }
    ]
  },

  westCaveRoute: {
    zoneId: forestZones.westCaveRoute.id,
    zoneName: forestZones.westCaveRoute.name,
    groups: [
      {
        type: 'slime',
        points: [
          { x: 500, y: 1790 },
          { x: 660, y: 1660 }
        ]
      },
      {
        type: 'spirit',
        points: [
          { x: 360, y: 1560 },
          { x: 760, y: 1510 }
        ]
      }
    ]
  },

  eastMountainRoute: {
    zoneId: forestZones.eastMountainRoute.id,
    zoneName: forestZones.eastMountainRoute.name,
    groups: [
      {
        type: 'spirit',
        points: [
          { x: 1600, y: 1450 },
          { x: 1810, y: 1320 },
          { x: 1970, y: 1160 }
        ]
      }
    ]
  },

  denseWilds: {
    zoneId: forestZones.denseWilds.id,
    zoneName: forestZones.denseWilds.name,
    groups: [
      {
        type: 'spirit',
        points: [
          { x: 760, y: 1540 },
          { x: 980, y: 1400 },
          { x: 1210, y: 1320 },
          { x: 1460, y: 1460 }
        ]
      }
    ]
  },

  deepNorth: {
    zoneId: forestZones.deepNorth.id,
    zoneName: forestZones.deepNorth.name,
    groups: [
      {
        type: 'spirit',
        points: [
          { x: 760, y: 860 },
          { x: 980, y: 720 },
          { x: 1220, y: 680 },
          { x: 1490, y: 820 }
        ]
      }
    ]
  },

  northernCrown: {
    zoneId: forestZones.northernCrown.id,
    zoneName: forestZones.northernCrown.name,
    groups: [
      {
        type: 'thornBeast',
        points: [
          { x: 980, y: 300 },
          { x: 1240, y: 220 },
          { x: 1490, y: 320 }
        ]
      }
    ]
  }
}

function flattenForestEnemies(zoneMap, typeMap) {
  const groupedByType = {}

  Object.values(zoneMap).forEach((zone) => {
    zone.groups.forEach((group) => {
      const enemyType = typeMap[group.type]

      if (!enemyType) {
        throw new Error(`[forest/enemies] Enemy type "${group.type}" not found.`)
      }

      if (!groupedByType[group.type]) {
        groupedByType[group.type] = {
          ...enemyType,
          zones: [],
          spawnPoints: []
        }
      }

      groupedByType[group.type].zones.push(zone.zoneId)
      groupedByType[group.type].spawnPoints.push(...group.points)
    })
  })

  return Object.values(groupedByType).map((enemy) => ({
    ...enemy,
    zones: [...new Set(enemy.zones)]
  }))
}

export const forestEnemies = flattenForestEnemies(
  forestEnemyZones,
  forestEnemyTypes
)
