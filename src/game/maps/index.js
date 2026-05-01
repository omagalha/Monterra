import { townConfig } from './town/config'
import { townEnemies } from './town/enemies'
import { townNpcs } from './town/npcs'

import { forestConfig } from './forest/config'
import { forestEnemies } from './forest/enemies'
import { forestNpcs } from './forest/npcs'

import { beachConfig } from './beach/config'
import { beachEnemies } from './beach/enemies'
import { beachNpcs } from './beach/npcs'

import { desertConfig } from './desert/config'
import { desertEnemies } from './desert/enemies'
import { desertNpcs } from './desert/npcs'

import { graveyardConfig } from './graveyard/config'
import { graveyardEnemies } from './graveyard/enemies'
import { graveyardNpcs } from './graveyard/npcs'

import { mountainConfig } from './mountain/config'
import { mountainEnemies } from './mountain/enemies'
import { mountainNpcs } from './mountain/npcs'

import { caveConfig } from './cave/config'
import { caveEnemies } from './cave/enemies'
import { caveNpcs } from './cave/npcs'

import { undergroundConfig } from './underground/config'
import { undergroundEnemies } from './underground/enemies'
import { undergroundNpcs } from './underground/npcs'

export const maps = {
  town: {
    config: townConfig,
    enemies: townEnemies,
    npcs: townNpcs
  },
  forest: {
    config: forestConfig,
    enemies: forestEnemies,
    npcs: forestNpcs
  },
  beach: {
    config: beachConfig,
    enemies: beachEnemies,
    npcs: beachNpcs
  },
  desert: {
    config: desertConfig,
    enemies: desertEnemies,
    npcs: desertNpcs
  },
  graveyard: {
    config: graveyardConfig,
    enemies: graveyardEnemies,
    npcs: graveyardNpcs
  },
  mountain: {
    config: mountainConfig,
    enemies: mountainEnemies,
    npcs: mountainNpcs
  },
  cave: {
    config: caveConfig,
    enemies: caveEnemies,
    npcs: caveNpcs
  },
  underground: {
    config: undergroundConfig,
    enemies: undergroundEnemies,
    npcs: undergroundNpcs
  }
}
