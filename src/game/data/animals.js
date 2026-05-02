export const animalData = {
  embravos: {
    id: 'embravos',
    name: 'Embravos',
    species: 'Raposa de Chama',
    family: 'canideo',
    tier: 'common_uncommon',
    base: 'Raposa + chama',
    role: 'Skirmisher inicial / dano leve / mobilidade curta',
    captureRate: 0.7,
    captureFood: 'berry',
    color: 0xf97316,
    baseHp: 64,
    baseSpeed: 0.95,
    baseDamage: 18,
    habitat: 'forest',
    passive: {
      id: 'instinto_fulgor',
      name: 'Instinto Fulgor',
      description: 'Quando a vida fica baixa, ganha bonus curto de velocidade.'
    },
    abilities: [
      {
        id: 'mordida_brasa',
        name: 'Mordida Brasa',
        type: 'Ativo / Fogo / Alvo unico',
        cooldown: 4,
        damage: 'Leve',
        description: 'Ataque basico com fogo, com pequena chance de queimadura.'
      },
      {
        id: 'salto_faiscante',
        name: 'Salto Faiscante',
        type: 'Ativo / Mobilidade',
        cooldown: 7,
        damage: 'Leve',
        description: 'Avanca rapidamente em curta distancia, deixando faiscas no chao.'
      },
      {
        id: 'cauda_viva',
        name: 'Cauda Viva',
        type: 'Ativo / Area curta / Fogo',
        cooldown: 9,
        damage: 'Leve / moderado',
        description: 'Gira a cauda em chamas e atinge inimigos proximos.'
      }
    ]
  },

  vayote: {
    id: 'vayote',
    name: 'Vayote',
    species: 'Coiote de Vento',
    family: 'canideo',
    tier: 'uncommon',
    base: 'Coiote + vento + poeira de trilha',
    role: 'Mobilidade, evasao e perseguicao',
    captureRate: 0.58,
    captureFood: 'spiced_seed',
    color: 0xd6b56d,
    baseHp: 78,
    baseSpeed: 1.1,
    baseDamage: 20,
    habitat: 'desert',
    passive: {
      id: 'rastreador_nomade',
      name: 'Rastreador Nomade',
      description: 'Recebe bonus de velocidade em campos abertos, trilhas e areas de transicao.'
    },
    abilities: [
      {
        id: 'corrente_de_trilha',
        name: 'Corrente de Trilha',
        type: 'Ativo / Vento / Linha frontal',
        cooldown: 5,
        damage: 'Leve / moderado',
        description: 'Dispara um golpe veloz de vento na frente.'
      },
      {
        id: 'passo_errante',
        name: 'Passo Errante',
        type: 'Ativo / Mobilidade / Evasao',
        cooldown: 6,
        damage: 'Nenhum',
        description: 'Da um avanco lateral ou diagonal curto para reposicionamento.'
      },
      {
        id: 'poeira_de_caminho',
        name: 'Poeira de Caminho',
        type: 'Ativo / Controle / Area',
        cooldown: 11,
        damage: 'Baixo',
        description: 'Levanta poeira que reduz precisao ou visao do alvo por pouco tempo.'
      }
    ]
  },

  brumel: {
    id: 'brumel',
    name: 'Brumel',
    species: 'Cao de Nevoa',
    family: 'canideo',
    tier: 'rare',
    base: 'Cao selvagem + nevoa',
    role: 'Furtividade, confusao e desgaste',
    captureRate: 0.4,
    captureFood: 'glow_mushroom',
    color: 0x94a3b8,
    baseHp: 88,
    baseSpeed: 0.85,
    baseDamage: 21,
    habitat: 'forest',
    passive: {
      id: 'corpo_nebuloso',
      name: 'Corpo Nebuloso',
      description: 'O primeiro ataque recebido em combate causa dano reduzido.'
    },
    abilities: [
      {
        id: 'nevoa_fria',
        name: 'Nevoa Fria',
        type: 'Ativo / Area / Nevoa',
        cooldown: 10,
        damage: 'Leve continuo',
        description: 'Lanca nevoa em area que reduz visao e causa dano leve continuo.'
      },
      {
        id: 'passo_velado',
        name: 'Passo Velado',
        type: 'Ativo / Furtividade',
        cooldown: 12,
        damage: 'Nenhum',
        description: 'Fica quase invisivel por alguns segundos ou reduz muito a chance de ser acertado.'
      },
      {
        id: 'olhar_de_bruma',
        name: 'Olhar de Bruma',
        type: 'Ativo / Debuff / Alvo unico',
        cooldown: 8,
        damage: 'Baixo',
        description: 'Marca um inimigo e reduz sua reacao ou velocidade por curto periodo.'
      }
    ]
  },

  luphorn: {
    id: 'luphorn',
    name: 'Luphorn',
    species: 'Lobo do Vale Antigo',
    family: 'canideo',
    tier: 'high_rare',
    base: 'Lobo + floresta antiga + musgo/pedra',
    role: 'Tanque nobre, controle e presenca florestal',
    captureRate: 0.28,
    captureFood: 'meat',
    color: 0x5f7f2f,
    baseHp: 145,
    baseSpeed: 0.7,
    baseDamage: 30,
    habitat: 'forest',
    passive: {
      id: 'guardiao_do_vale',
      name: 'Guardiao do Vale',
      description: 'Ganha resistencia extra em floresta, mata profunda ou areas naturais.'
    },
    abilities: [
      {
        id: 'investida_raiz',
        name: 'Investida Raiz',
        type: 'Ativo / Impacto / Alvo ou linha',
        cooldown: 8,
        damage: 'Moderado',
        description: 'Avanca com peso e empurra o inimigo.'
      },
      {
        id: 'couraca_de_musgo',
        name: 'Couraca de Musgo',
        type: 'Ativo / Defesa / Buff',
        cooldown: 14,
        damage: 'Nenhum',
        description: 'Cria protecao natural, reduzindo dano por alguns segundos.'
      },
      {
        id: 'chamado_da_mata_antiga',
        name: 'Chamado da Mata Antiga',
        type: 'Ativo / Controle / Area',
        cooldown: 16,
        damage: 'Moderado',
        description: 'Invoca raizes ou energia da floresta, prendendo ou desacelerando.'
      }
    ]
  },

  noctharu: {
    id: 'noctharu',
    name: 'Noctharu',
    species: 'Lobo Noturno',
    family: 'canideo',
    tier: 'alpha',
    base: 'Lobo noturno + sombra + lua',
    role: 'Predador de elite, controle e pressao psicologica',
    captureRate: 0.16,
    captureFood: 'meat',
    color: 0x4338ca,
    baseHp: 130,
    baseSpeed: 1.05,
    baseDamage: 38,
    habitat: 'graveyard',
    passive: {
      id: 'sombra_soberana',
      name: 'Sombra Soberana',
      description: 'Inimigos proximos sofrem leve reducao de velocidade ou defesa.'
    },
    abilities: [
      {
        id: 'garra_lunar',
        name: 'Garra Lunar',
        type: 'Ativo / Sombra-Lua / Alvo unico',
        cooldown: 5,
        damage: 'Alto',
        description: 'Ataque sombrio veloz com alto dano em alvo unico.'
      },
      {
        id: 'uivo_do_eclipse',
        name: 'Uivo do Eclipse',
        type: 'Ativo / Debuff / Area',
        cooldown: 14,
        damage: 'Baixo',
        description: 'Enfraquece inimigos proximos, reduzindo ataque ou coragem.'
      },
      {
        id: 'cacada_noturna',
        name: 'Cacada Noturna',
        type: 'Ativo / Marca / Caca',
        cooldown: 12,
        damage: 'Escalavel',
        description: 'Marca um alvo e ganha bonus de dano e perseguicao contra ele.'
      },
      {
        id: 'lua_predatoria',
        name: 'Lua Predatoria',
        type: 'Ativo / Zona alfa',
        cooldown: 22,
        damage: 'Moderado continuo',
        description: 'Cria uma zona escura onde Noctharu fica mais rapido e perigoso.'
      }
    ]
  },

  velkaris: {
    id: 'velkaris',
    name: 'Velkaris',
    species: 'Canideo Ancestral',
    family: 'canideo',
    tier: 'mythic',
    base: 'Canideo ancestral + aurora + chama espiritual',
    role: 'Presenca sagrada, aura, dano refinado e controle mistico',
    captureRate: 0.08,
    captureFood: 'crystal',
    color: 0xd7ba77,
    baseHp: 180,
    baseSpeed: 0.98,
    baseDamage: 46,
    habitat: 'mythic',
    passive: {
      id: 'rastro_ancestral',
      name: 'Rastro Ancestral',
      description: 'Ataques basicos ganham dano extra elemental ou espiritual.'
    },
    abilities: [
      {
        id: 'chama_astral',
        name: 'Chama Astral',
        type: 'Ativo / Magia-Fogo espiritual / Linha ou arco',
        cooldown: 7,
        damage: 'Alto',
        description: 'Projeta fogo espiritual em linha ou arco, causando dano magico alto.'
      },
      {
        id: 'passo_da_aurora',
        name: 'Passo da Aurora',
        type: 'Ativo / Mobilidade mitica',
        cooldown: 10,
        damage: 'Leve / contato',
        description: 'Movimento rapido que deixa rastro de energia.'
      },
      {
        id: 'aura_primordial',
        name: 'Aura Primordial',
        type: 'Ativo / Aura / Buff-Debuff',
        cooldown: 18,
        damage: 'Nenhum',
        description: 'Fortalece aliados ou enfraquece inimigos ao redor.'
      },
      {
        id: 'cauda_celeste',
        name: 'Cauda Celeste',
        type: 'Ativo / Area ampla / Energia',
        cooldown: 13,
        damage: 'Moderado / alto',
        description: 'Golpe amplo em area usando a cauda energetica.'
      },
      {
        id: 'canto_do_primeiro_rastro',
        name: 'Canto do Primeiro Rastro',
        type: 'Ativo / Ultimate mitica',
        cooldown: 30,
        damage: 'Muito alto',
        description: 'Explosao sagrada de luz e chama espiritual.'
      }
    ]
  },

  wild_slime: {
    id: 'wild_slime',
    name: 'Slime',
    species: 'Gel Verde',
    family: 'gel',
    tier: 'common',
    role: 'Criatura inicial simples',
    captureRate: 0.75,
    captureFood: 'berry',
    color: 0x7be07b,
    baseHp: 60,
    baseSpeed: 0.6,
    baseDamage: 14,
    habitat: 'forest',
    passive: {
      id: 'soft_step',
      name: 'Passo Macio',
      description: 'Aumenta levemente a cadencia de ataque.'
    },
    abilities: []
  },

  forest_spirit: {
    id: 'forest_spirit',
    name: 'Espirito',
    species: 'Luz da Mata',
    family: 'spirit',
    tier: 'rare',
    role: 'Kiter magico da floresta',
    captureRate: 0.45,
    captureFood: 'glow_mushroom',
    color: 0xb089ff,
    baseHp: 90,
    baseSpeed: 0.85,
    baseDamage: 22,
    habitat: 'forest',
    passive: {
      id: 'forest_sense',
      name: 'Sentido da Mata',
      description: 'Aumenta o alcance do minimapa.'
    },
    abilities: []
  },

  thorn_beast: {
    id: 'thorn_beast',
    name: 'Fera Espinhosa',
    species: 'Guardiao de Espinhos',
    family: 'beast',
    tier: 'rare',
    role: 'Investida pesada',
    captureRate: 0.2,
    captureFood: 'meat',
    color: 0x5f7f2f,
    baseHp: 140,
    baseSpeed: 1,
    baseDamage: 32,
    habitat: 'forest',
    passive: {
      id: 'thorn_hide',
      name: 'Casca Espinhosa',
      description: 'Reduz um pouco o dano recebido.'
    },
    abilities: []
  },

  water_blob: {
    id: 'water_blob',
    name: "Blob d'Agua",
    species: 'Nucleo de Mare',
    family: 'gel',
    tier: 'uncommon',
    role: 'Criatura aquatica inicial',
    captureRate: 0.55,
    captureFood: 'fish',
    color: 0x4dabf7,
    baseHp: 95,
    baseSpeed: 0.55,
    baseDamage: 18,
    habitat: 'beach',
    passive: {
      id: 'tidal_luck',
      name: 'Sorte da Mare',
      description: 'Aumenta recompensas de moeda em rotas de agua.'
    },
    abilities: []
  },

  sand_spirit: {
    id: 'sand_spirit',
    name: 'Espirito da Areia',
    species: 'Vento Dourado',
    family: 'spirit',
    tier: 'uncommon',
    role: 'Pressao leve no deserto',
    captureRate: 0.5,
    captureFood: 'spiced_seed',
    color: 0xf4a261,
    baseHp: 105,
    baseSpeed: 0.65,
    baseDamage: 20,
    habitat: 'desert',
    passive: {
      id: 'desert_stride',
      name: 'Passo das Dunas',
      description: 'Aumenta movimento em areas abertas.'
    },
    abilities: []
  }
}
