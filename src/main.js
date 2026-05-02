import './style.css'
import Phaser from 'phaser'
import StartMenuScene from './game/scene/StartMenuScene'
import MainScene from './game/scene/MainScene'

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a1a',
  parent: 'game-container',
  pixelArt: true,
  scene: [StartMenuScene, MainScene],
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER
  }
}

new Phaser.Game(config)
