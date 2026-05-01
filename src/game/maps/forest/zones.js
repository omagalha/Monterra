export const forestZones = {
  southEntry: {
    id: 'south_entry',
    name: 'Entrada Sul',
    kind: 'safe_transition',
    dangerLevel: 1,
    recommendedLevel: 1,
    bounds: {
      x: 760,
      y: 2860,
      width: 880,
      height: 260
    },
    description: 'Faixa de transição entre a cidade e a floresta.'
  },

  lowerTrail: {
    id: 'lower_trail',
    name: 'Trilha Baixa',
    kind: 'pathway',
    dangerLevel: 1,
    recommendedLevel: 1,
    bounds: {
      x: 860,
      y: 2400,
      width: 680,
      height: 420
    },
    description: 'Primeira trilha de avanço dentro da floresta.'
  },

  centralClearing: {
    id: 'central_clearing',
    name: 'Clareira Central',
    kind: 'hub',
    dangerLevel: 2,
    recommendedLevel: 2,
    bounds: {
      x: 700,
      y: 1860,
      width: 1000,
      height: 520
    },
    description: 'Área aberta que funciona como referência central da região.'
  },

  westCaveRoute: {
    id: 'west_cave_route',
    name: 'Rota da Caverna',
    kind: 'branch_route',
    dangerLevel: 2,
    recommendedLevel: 2,
    bounds: {
      x: 180,
      y: 1460,
      width: 760,
      height: 520
    },
    description: 'Caminho lateral oeste que conduz até a caverna.'
  },

  eastMountainRoute: {
    id: 'east_mountain_route',
    name: 'Rota da Montanha',
    kind: 'branch_route',
    dangerLevel: 3,
    recommendedLevel: 3,
    bounds: {
      x: 1480,
      y: 980,
      width: 740,
      height: 620
    },
    description: 'Subida lateral leste em direção à montanha.'
  },

  denseWilds: {
    id: 'dense_wilds',
    name: 'Mata Densa',
    kind: 'danger_field',
    dangerLevel: 3,
    recommendedLevel: 3,
    bounds: {
      x: 620,
      y: 1180,
      width: 1160,
      height: 560
    },
    description: 'Região mais fechada e perigosa, com menos respiro visual.'
  },

  deepNorth: {
    id: 'deep_north',
    name: 'Floresta Profunda',
    kind: 'deep_region',
    dangerLevel: 4,
    recommendedLevel: 4,
    bounds: {
      x: 560,
      y: 560,
      width: 1280,
      height: 500
    },
    description: 'Parte superior da floresta, com maior sensação de isolamento.'
  },

  northernCrown: {
    id: 'northern_crown',
    name: 'Topo Selvagem',
    kind: 'high_threat_peak',
    dangerLevel: 5,
    recommendedLevel: 5,
    bounds: {
      x: 620,
      y: 140,
      width: 1160,
      height: 320
    },
    description: 'Faixa mais extrema da floresta, reservada para ameaças maiores.'
  }
}
