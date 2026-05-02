export const quests = [
  {
    id: 'first_hunt_01',
    title: 'Primeiro Combate',
    description: 'Derrote 5 slimes selvagens.',
    type: 'defeat',
    targetEnemy: 'wild_slime',
    requiredAmount: 5,
    reward: {
      xp: 100,
      coins: 50,
      items: {
        leaf: 2
      }
    }
  },
  {
    id: 'forest_spirits_01',
    title: 'Sussurros na Mata',
    description: 'Derrote 3 espiritos da floresta.',
    type: 'defeat',
    targetEnemy: 'forest_spirit',
    requiredAmount: 3,
    reward: {
      xp: 160,
      coins: 80,
      items: {
        crystal: 1,
        leaf: 3
      }
    }
  },
  {
    id: 'beach_blobs_01',
    title: 'Mar Agitado',
    description: 'Derrote 4 blobs d agua.',
    type: 'defeat',
    targetEnemy: 'water_blob',
    requiredAmount: 4,
    reward: {
      xp: 120,
      coins: 90,
      items: {
        crystal: 1
      }
    }
  },
  {
    id: 'sand_spirits_01',
    title: 'Rota das Dunas',
    description: 'Derrote 3 espiritos da areia.',
    type: 'defeat',
    targetEnemy: 'sand_spirit',
    requiredAmount: 3,
    reward: {
      xp: 140,
      coins: 110,
      items: {
        leaf: 1,
        bone: 2
      }
    }
  }
]
