export const townNpcs = [
  {
    id: 'elder_01',
    name: 'Ancião',
    x: 520,
    y: 500,
    questId: 'first_hunt_01',
    dialogue: {
      default: [
        'Bem-vindo a Monterra.',
        'A floresta ao norte é perigosa.',
        'Derrote 5 criaturas selvagens e volte para falar comigo.'
      ],
      inProgress: [
        'Você já foi até a floresta?',
        'Derrote 5 criaturas selvagens e depois volte.'
      ],
      completed: [
        'Muito bem.',
        'Você completou sua primeira missão.',
        'Aceite sua recompensa.'
      ],
      rewarded: [
        'Você foi bem.',
        'Continue explorando Monterra.'
      ]
    }
  },
  {
    id: 'villager_01',
    name: 'Lina',
    x: 720,
    y: 620,
    bodyColor: 0x22c55e,
    bodyStroke: 0x14532d,
    dialogue: [
      'A cidade anda mais movimentada ultimamente.',
      'Dizem que criaturas raras aparecem em regiões mais distantes.',
      'Ainda não tive coragem de sair daqui sozinha.'
    ]
  },
  {
    id: 'villager_02',
    name: 'Breno',
    x: 360,
    y: 700,
    bodyColor: 0xf59e0b,
    bodyStroke: 0x92400e,
    dialogue: [
      'Eu costumo caminhar perto da entrada da praia.',
      'Cada região de Monterra parece ter criaturas próprias.',
      'Um dia ainda vou montar minha própria equipe.'
    ]
  }
]
