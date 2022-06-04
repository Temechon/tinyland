import Phaser from 'phaser';
import { CameraHelper } from '../helpers/CameraHelper';
import { HexGrid } from '../helpers/HexGrid';
import { Tile } from '../model/map/Tile';
import { WorldMap } from '../model/map/WorldMap';
import { ratio } from './Boot';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {

    let ch = new CameraHelper(this);

    let map = new WorldMap(this, 10);
  }
}
