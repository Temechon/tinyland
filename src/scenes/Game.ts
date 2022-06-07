import Phaser from 'phaser';
import { CameraHelper } from '../helpers/CameraHelper';
import { WorldMap } from '../model/map/WorldMap';
import { Tribe } from '../model/Tribe';
import { Unit } from '../model/Unit';



class Debug {

  scene: Phaser.Scene;
  player: Tribe;
  map: WorldMap;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  unit() {
    let units = this.scene.cache.json.get('units');

    let unit = new Unit({
      scene: this.scene,
      infos: units[0],
      map: this.map,
      tile: this.player.capital.tile,
      tribe: this.player
    });
    this.player.add(unit)
  }

}

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {

    let debug = new Debug(this);

    let ch = new CameraHelper(this);

    let map = new WorldMap(this, 5);
    debug.map = map;

    let player = new Tribe(this, "player");
    player.isPlayer = true;
    debug.player = player;


    let tiles = map.getEvenlyLocatedTiles(2, 10, t => map.isStartingLocationCorrect(t));

    player.setCityOn(tiles[0]);


    // Debug
    window['tl'] = debug;
  }
}
