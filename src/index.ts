import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import Game from './scenes/Game';

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#112E40',
  scale: {
    mode: Phaser.Scale.FIT,
    width: window.innerWidth * devicePixelRatio,
    height: window.innerHeight * devicePixelRatio,
  },
  scene: [
    Boot,
    Game
  ]
}
);
