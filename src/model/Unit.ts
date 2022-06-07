import { Game } from "phaser";
import * as _ from 'underscore';
import { Helpers } from "../helpers/Helpers";
import { ratio } from "../scenes/Boot";
import { City } from "./City";
import { Constants } from "./Constants";
import { IClickable } from "./IClickable";
import { Tile } from "./map/Tile";
import { TileType } from "./map/TileInfo";
import { WorldMap } from "./map/WorldMap";
import { Tribe } from "./Tribe";
import { UnitInfo } from "./UnitInfo";

enum UnitState {
    IDLE,
    /** This unit has been selected */
    ACTIVATED,
    /** This unit is moving */
    MOVING,
    /** This unit can attack */
    CAN_ATTACK,
    /** This unit is attacking */
    ATTACKING,
    /** This unit is waiting on the next turn to be able to move again */
    WAITING_NEXT_TURN
}

export class Unit extends Phaser.GameObjects.Container implements IClickable {

    infos: UnitInfo;

    /** The set of tile this unit can mvoe to */
    private _moveRange: Array<Tile>;
    private _moveRangeGraphics: Array<Phaser.GameObjects.Graphics>;
    /** HP of this unit */
    private _text: Phaser.GameObjects.BitmapText;
    /** Instance of the worldmap - used to display move range, attack range... */
    private _map: WorldMap;

    /** The main image of this unit */
    private _image: Phaser.GameObjects.Image;

    public currentTile: Tile;
    // public map: WorldMap;
    /** The tribe this unit belong to */
    private _tribe: Tribe;
    state: UnitState = UnitState.IDLE;

    /** Create a city for a settler, heal, improve unit... */
    private _specialAction: Phaser.GameObjects.Image;

    constructor(config: {
        scene: Phaser.Scene,
        infos: UnitInfo,
        tile: Tile,
        map: WorldMap,
        tribe: Tribe
    }) {
        super(config.scene);

        this.infos = _.extend({}, config.infos);
        this.infos.hp = this.infos.hpmax

        this._map = config.map;
        this.currentTile = config.tile;
        this._tribe = config.tribe;
        this.depth = Constants.LAYER.UNITS;

        this.x = this.currentTile.worldPosition.x;
        this.y = this.currentTile.worldPosition.y;

        let image = this.scene.make.image({ x: 0, y: 0, scale: ratio, key: config.infos.key, add: false });
        this.add(image);
        this._image = image;

        // Display HP
        let style = {
            fontSize: Helpers.font(30),
            fontFamily: Constants.FONT.NUMBERS,
            color: "#fff",
            stroke: '#000',
            strokeThickness: 5 * ratio,
        };
        this._text = this.scene.make.bitmapText({
            x: image.x,
            y: image.y + image.displayHeight / 1.5,
            font: "font_normal",
            size: 30 * ratio,
            text: `${this.infos.hp}`,
            add: false
        }).setOrigin(0.5);

        this.add(this._text);

        this.currentTile.addClickable(this);
    }

    get tribe(): Tribe {
        return this._tribe;
    }

    /**
     * True if this unit can move
     */
    get canMove(): boolean {
        return this.state === UnitState.IDLE;
    }

    setWaitingNextTurn() {
        if (this._tribe.isPlayer) {
            this._image.setTint(0x555555);
        }

        this.state = UnitState.WAITING_NEXT_TURN;
    }

    setIdle() {
        this._image.setTint(0xffffff);
        this.state = UnitState.IDLE;
    }

    deactivate() {

        console.log("⚔️ --> Deactivating unit");
        // this.scene.events.emit(Constants.EVENTS.UI_OFF);

        if (this._moveRangeGraphics) {
            this._moveRangeGraphics.forEach(i => i.destroy());
            this._moveRangeGraphics = null;
        }
        if (this.state === UnitState.ACTIVATED) {
            this.state = UnitState.IDLE
        }
        if (this._specialAction) {
            this._specialAction.destroy();
        }
    }

    activate() {
        console.log("⚔️ --> Activating unit");

        // IF this unit does not belong to the player, nothing to do
        if (!this._tribe.isPlayer) {
            return;
        }

        // this.scene.events.emit(Constants.EVENTS.BOT_PANEL_UNIT_ON, this.infos);

        if (this.state === UnitState.WAITING_NEXT_TURN) {
            // Only display something like stat, but can't move

        } else if (this.state === UnitState.CAN_ATTACK) {
            // Check if this unit can attack someone
            // this._displayAttack(this.canAttackOnTiles());
        }


        else if (this.canMove) {
            this.state = UnitState.ACTIVATED;

            // Check if this unit can attack someone
            // this._displayAttack(this.canAttackOnTiles());

            // Display move range
            this._moveRange = this._map.getMoveRange({
                from: this.currentTile,
                movement: this.infos.movement
            });
            console.log("⚔️ --> Unit can move on", this._moveRange);

            this._moveRangeGraphics = [];
            for (let tile of this._moveRange) {
                let h = this.scene.make.graphics({ x: tile.worldPosition.x, y: tile.worldPosition.y, add: false });
                h.fillStyle(0x00ffaa);
                h.fillCircle(0, 0, 75 * ratio);
                h.setInteractive(
                    new Phaser.Geom.Circle(0, 0, 75 * ratio),
                    Phaser.Geom.Circle.Contains
                );

                h.x -= this.x
                h.y -= this.y
                h.scale *= 0.75;
                this._moveRangeGraphics.push(h);
                this.add(h);
                h.on('pointerup', this.move.bind(this, tile));
            }
        }
    }

    /**
     * Display hexes where the unit can attack
     */
    // private _displayAttack(attackTiles: Tile[]) {
    //     this._moveRangeGraphics = [];
    //     for (let tile of attackTiles) {
    //         let h = tile.getHexPrint(0xff3388);
    //         h.x -= this.x
    //         h.y -= this.y
    //         h.scale *= 0.75;
    //         this._moveRangeGraphics.push(h);
    //         h.alpha = 0.5
    //         this.add(h);
    //         h.on('pointerup', this.attack.bind(this, tile));
    //     }

    // }

    /**
     * Move this unit to the given tile.
     */
    move(tile: Tile): Promise<void> {

        this.state = UnitState.MOVING;

        // Deactivate this unit
        this.deactivate();

        return new Promise(resolve => {

            this.scene.add.tween({
                targets: this,
                x: tile.worldPosition.x,
                y: tile.worldPosition.y,
                duration: 50,
                onComplete: () => {
                    this.afterMove(tile);
                    resolve();
                }
            })
        });


    }

    /**
     * Attack the unit on the given tile.
     */
    // attack(tile: Tile) {
    //     this.state = UnitState.ATTACKING;

    //     // Get unit on the other side
    //     let enemy = tile.unit;

    //     // get terrain modifier for defence
    //     let terrainModifierAttacker = this.currentTile.infos.defenseModifier;
    //     let terrainModifierDefencer = tile.infos.defenseModifier;

    //     // Animation and compute damage
    //     // Here, the unit is attacking the enemy
    //     Game.INSTANCE.add.tween({
    //         targets: this,
    //         x: tile.worldPosition.x,
    //         y: tile.worldPosition.y,
    //         duration: 150,
    //         ease: Phaser.Math.Easing.Expo.InOut,
    //         onComplete: () => {
    //             // Compute damage
    //             let hpRatio = this.infos.hp / this.infos.hpmax * 2;
    //             let baseDamageAttacker = this.infos.strength * (chance.floating({ min: 1, max: 1.2 }) - terrainModifierDefencer) * hpRatio;
    //             console.log("Attacker deals", Phaser.Math.Clamp(Math.round(baseDamageAttacker), 0, enemy.infos.hp))
    //             enemy.infos.hp -= Phaser.Math.Clamp(Math.round(baseDamageAttacker), 0, enemy.infos.hp);
    //             enemy._text.text = enemy.infos.hp.toString();

    //             if (enemy.infos.hp <= 0) {
    //                 enemy.die();
    //                 // Move to the enemy tile
    //                 this.move(tile);
    //             } else {
    //                 // Move the attacker back to its tile
    //                 Game.INSTANCE.add.tween({
    //                     targets: this,
    //                     x: this.currentTile.worldPosition.x,
    //                     y: this.currentTile.worldPosition.y,
    //                     duration: 150,
    //                     ease: Phaser.Math.Easing.Expo.InOut
    //                 });

    //                 // IF the enemy didn't die and the attacker is in its range, it defends itself
    //                 if (!enemy.hasOtherInRange(this)) {
    //                     return
    //                 }

    //                 Game.INSTANCE.add.tween({
    //                     targets: enemy,
    //                     delay: 150,
    //                     x: this.currentTile.worldPosition.x,
    //                     y: this.currentTile.worldPosition.y,
    //                     ease: Phaser.Math.Easing.Expo.InOut,
    //                     duration: 150,
    //                     yoyo: true,
    //                     onComplete: () => {
    //                         let hpRatioDefencer = enemy.infos.hp / enemy.infos.hpmax * 2;
    //                         let baseDamageDefenser = enemy.infos.strength * (chance.floating({ min: 0.9, max: 1.1 }) - terrainModifierAttacker) * hpRatioDefencer;
    //                         console.log("Defencer deals", Phaser.Math.Clamp(Math.round(baseDamageDefenser), 0, enemy.infos.hp))

    //                         this.infos.hp -= Phaser.Math.Clamp(Math.round(baseDamageDefenser), 0, this.infos.hp);

    //                         this._text.text = this.infos.hp.toString();

    //                         if (this.infos.hp <= 0) {
    //                             this.die();
    //                         }
    //                     }
    //                 })
    //             }
    //         }
    //     })

    //     // Deactivate this unit
    //     this.deactivate();
    // }

    /**
     * After movement, we check if this unit can attack another one. If so, engage attack mode
     * The parameter is the tile the unit is on
     */
    afterMove(tile: Tile) {
        // Remove this unit from the current tile
        this.currentTile.removeClickable(this);
        this.currentTile.deactivate();
        Tile.TILE_SELECTED = tile;

        // Add this unit to the given tile
        this.currentTile = tile;
        this.currentTile.addClickable(this);

        // Update fog of war
        // let vision = this.getVision();
        // this._tribe.removeFogOfWar(vision);

        // Check if the unit is on a city
        // if (this.currentTile.hasCity) {
        //     let city = this.currentTile.city;
        //     if (city.tribe !== this._tribe) {
        //         city.isBeingCaptured = true;
        //     }

        //     if (this._tribe.isPlayer) {
        //         let t = new Toast({
        //             scene: this.scene.scene.get("gameui"),
        //             message: "This city will be captured next turn!",
        //             style: {
        //                 fontColor: "#ffffff",
        //                 backgroundColor: 0x5C69AD
        //             }
        //         });
        //     }

        // }

        if (this._tribe.isPlayer) {
            // let attackTiles = this.canAttackOnTiles();

            // if (attackTiles.length === 0) {
            //     this.setWaitingNextTurn();
            //     return;
            // }
            this.state = UnitState.CAN_ATTACK;
            // this._displayAttack(attackTiles);
        } else {
            // IA
            // TODO
            this.setWaitingNextTurn();
        }

        console.log("ATTACK MODE")
    }

    /**
     * Make this unit die... Destroy from the world and remove from the tribe
     */
    die() {
        // Deactivate this unit
        this.deactivate();

        // Was this unit on an enemy city ? IF so, remove the 'is being captured'
        // if (this.currentTile.hasCity) {
        //     let city = this.currentTile.city;
        //     if (city.tribe !== this._tribe) {
        //         city.isBeingCaptured = false;
        //     }
        // }

        // Remove this unit from the current tile
        this.currentTile.removeClickable(this);
        // Remove this unit from its tribe
        this._tribe.removeUnit(this);

        // DEAD
        this.destroy();
    }

    /**
     * Returns the list of tiles this unit can see, starting from the given tile.
     * If no tile is given, the vision is from the unit currentile
     */
    // getVision(tile?: Tile): Array<Tile> {
    //     let vision = this.infos.vision;

    //     // Increase if the unit is on a mountain
    //     if (this.currentTile.tileType === TileType.Mountain) {
    //         vision++;
    //     }

    //     if (!tile) {
    //         tile = this.currentTile;
    //     }

    //     let res = [];

    //     for (let i = vision; i >= 1; i--) {
    //         res.push(...this.map.getRing(tile, i))
    //     }
    //     return res;
    // }

    destroy() {
        if (this._moveRangeGraphics) {
            for (let g of this._moveRangeGraphics) {
                g.destroy();
            }
        }
        super.destroy();
    }
}
