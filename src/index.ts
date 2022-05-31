import Phaser from 'phaser';
import Demo from './scenes/Game';

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#112E40',
  scale: {
    mode: Phaser.Scale.FIT,
    width: window.innerWidth * devicePixelRatio,
    height: window.innerHeight * devicePixelRatio,
  },
  scene: [
    Demo
  ]
}
);
