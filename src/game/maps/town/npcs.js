export const townNpcs = [
  {
    id: 'elder_01',
    name: 'Anciao Orlan',
    x: 860,
    y: 690,
    questId: 'first_hunt_01',
    dialogue: {
      default: [
        'Bem-vindo a Vila Raiz.',
        'A floresta ao norte esta inquieta.',
        'Derrote 5 slimes selvagens e volte para falar comigo.'
      ],
      inProgress: [
        'Voce ja foi ate a floresta?',
        'Derrote 5 slimes selvagens e depois volte.'
      ],
      completed: [
        'Muito bem.',
        'Voce protegeu a entrada da vila.',
        'Aceite sua recompensa.'
      ],
      rewarded: [
        'Voce foi bem.',
        'Continue explorando Monterra.'
      ]
    }
  },
  {
    id: 'ranger_mira',
    name: 'Mira',
    x: 610,
    y: 430,
    bodyColor: 0x38bdf8,
    bodyStroke: 0x075985,
    questId: 'forest_spirits_01',
    dialogue: {
      default: [
        'Eu vigio a trilha norte.',
        'Alguns espiritos da floresta estao assustando os viajantes.',
        'Acalme 3 espiritos e eu te pago em cristais.'
      ],
      inProgress: [
        'Os espiritos ficam nas partes mais fechadas da floresta.',
        'Volte quando tiver derrotado 3 deles.'
      ],
      completed: [
        'A trilha esta respirando melhor de novo.',
        'Aqui esta sua recompensa.'
      ],
      rewarded: [
        'A floresta ainda e perigosa, mas agora ela sabe seu nome.'
      ]
    }
  },
  {
    id: 'fisher_nara',
    name: 'Nara',
    x: 1340,
    y: 930,
    bodyColor: 0x06b6d4,
    bodyStroke: 0x155e75,
    questId: 'beach_blobs_01',
    dialogue: {
      default: [
        'A estrada da praia esta cheia de blobs d agua.',
        'Derrote 4 deles para eu conseguir buscar suprimentos.',
        'Eu guardo boas moedas para quem ajuda.'
      ],
      inProgress: [
        'A praia fica pelo portao leste.',
        'Preciso que voce derrote 4 blobs d agua.'
      ],
      completed: [
        'Agora da para ouvir o mar sem medo.',
        'Voce mereceu essa recompensa.'
      ],
      rewarded: [
        'Quando a vila precisar de alguem, vou lembrar de voce.'
      ]
    }
  },
  {
    id: 'merchant_tavo',
    name: 'Tavo',
    x: 380,
    y: 900,
    bodyColor: 0xf59e0b,
    bodyStroke: 0x92400e,
    questId: 'sand_spirits_01',
    dialogue: {
      default: [
        'Meus mapas do deserto sumiram numa rajada estranha.',
        'Derrote 3 espiritos da areia para liberar a rota oeste.',
        'Tenho moedas e folhas raras para pagar.'
      ],
      inProgress: [
        'O deserto fica pelo portao oeste.',
        'Procure os espiritos da areia entre as dunas.'
      ],
      completed: [
        'Excelente. Minhas caravanas podem sair outra vez.',
        'Pegue sua recompensa.'
      ],
      rewarded: [
        'Negocio bom e caminho seguro. Voce ajudou nos dois.'
      ]
    }
  },
  {
    id: 'villager_lina',
    name: 'Lina',
    x: 1160,
    y: 620,
    bodyColor: 0x22c55e,
    bodyStroke: 0x14532d,
    dialogue: [
      'A vila cresceu em volta da grande praca.',
      'Cada portao leva para uma regiao diferente de Monterra.',
      'Um dia ainda vou montar minha propria equipe.'
    ]
  },
  {
    id: 'builder_breno',
    name: 'Breno',
    x: 1010,
    y: 1080,
    bodyColor: 0xa855f7,
    bodyStroke: 0x581c87,
    dialogue: [
      'Estou reforcando as pontes e cercas da vila.',
      'Se a gente trouxer mais moradores, aqui vira uma cidade de verdade.',
      'So falta alguem bravo o bastante para limpar as rotas.'
    ]
  },
  {
    id: 'child_ico',
    name: 'Ico',
    x: 1420,
    y: 520,
    bodyColor: 0xef4444,
    bodyStroke: 0x7f1d1d,
    dialogue: [
      'Eu vi um cristal brilhando perto da fonte!',
      'Ou talvez fosse so o sol.',
      'Mas em Monterra quase tudo que brilha vira historia.'
    ]
  }
]
