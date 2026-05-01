import './style.css'
import Phaser from 'phaser'
import MainScene from './game/scene/MainScene'

const config = {
  type: Phaser.AUTO,
  width: 390,
  height: 844,
  backgroundColor: '#1a1a1a',
  parent: 'game-container',
  pixelArt: true,
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

new Phaser.Game(config)
