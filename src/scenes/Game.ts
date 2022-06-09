import Phaser from 'phaser';
import { CameraHelper } from '../helpers/CameraHelper';
import { WorldMap } from '../model/map/WorldMap';
import { Tribe } from '../model/Tribe';
import { Unit } from '../model/Unit';



class Debug {

  scene: Game;
  player: Tribe;
  map: WorldMap;

  constructor(scene: Game) {
    this.scene = scene;
  }

  unit() {
    let units = this.scene.cache.json.get('units');

    this.player.addUnit(units[0], this.player.capital.tile)
  }

  next() {
    this.scene.nextTurn();
  }

}

export default class Game extends Phaser.Scene {

  /** If false, the player cannot do any actions */
  static CAN_PLAY = true;
  /** The current turn */
  turn: number = 0;
  /** The worlmap */
  map: WorldMap;
  /** All tribes playing on this map */
  tribes: Array<Tribe> = [];

  constructor() {
    super('game');
  }

  create() {

    let debug = new Debug(this);

    let ch = new CameraHelper(this);

    let map = new WorldMap(this, 5);
    debug.map = map;
    this.map = map;

    let player = new Tribe({
      scene: this,
      name: "player",
      map: map
    });
    player.isPlayer = true;
    debug.player = player;
    this.tribes.push(player);

    let tiles = map.getEvenlyLocatedTiles(2, 10, t => map.isStartingLocationCorrect(t));

    player.setCityOn(tiles[0]);


    // Debug
    window['tl'] = debug;
  }

  /**
         * For all tribes: 
         * - reset their unit state.
         * - Increase the production of all cities 
         */
  nextTurn() {
    Game.CAN_PLAY = false;
    console.log("⌛ --> End turn");
    this.turn++;

    // Deactivate all tiles
    this.map.doForAllTiles(t => t.deactivate());

    for (let tribe of this.tribes) {
      tribe.nextTurn();

      // Add ressources
      // tribe.productionManager.collect();

      // if (tribe instanceof AI) {
      //   let ai = tribe as AI;
      //   ai.play();
      // }
    }

    Game.CAN_PLAY = true;
  }
}
