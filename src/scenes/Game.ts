import Phaser from 'phaser';
import { CameraHelper } from '../helpers/CameraHelper';
import { WorldMap } from '../model/map/WorldMap';
import { Tribe } from '../model/Tribe';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {

    let ch = new CameraHelper(this);

    let map = new WorldMap(this, 5);

    let player = new Tribe(this, "player");

    let tiles = map.getEvenlyLocatedTiles(2, 10, t => map.isStartingLocationCorrect(t));

    player.setCityOn(tiles[0]);
  }
}
