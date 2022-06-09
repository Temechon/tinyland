import { Helpers } from "../helpers/Helpers";
import { ratio } from "../scenes/Boot";
import { Constants } from "./Constants";
import { IClickable } from "./IClickable";
import { Tile } from "./map/Tile";
import { WorldMap } from "./map/WorldMap";
import { Tribe } from "./Tribe";

export class City extends Phaser.GameObjects.Container implements IClickable {

    /** The tribe this city belongs to */
    private _tribe: Tribe;
    private _map: WorldMap;

    /** The tile this city is on */
    tile: Tile;

    /** The number of hexagon around this city that can be used by this city */
    public influenceRadius: number = 1;

    /** All tiles in the influence area of this city */
    private _influenceTiles: Tile[] = [];



    constructor(config: {
        scene: Phaser.Scene,
        tile: Tile,
        tribe: Tribe,
        map: WorldMap
    }) {
        super(config.scene, config.tile.worldPosition.x, config.tile.worldPosition.y);

        this.tile = config.tile;
        this._tribe = config.tribe;
        this._map = config.map;

        this.tile.addCity(this);

        let cityImage = this.scene.make.image({
            x: 0,
            y: 0,
            key: 'city',
            scale: ratio,
            add: false
        });
        this.name = Helpers.getCityName();
        console.log(this.name, ratio);

        this.add(cityImage)

        let nameText = this.scene.make.bitmapText({
            x: this.tile.worldPosition.x,
            y: this.tile.worldPosition.y,
            font: "font_normal",
            size: 45 * ratio,
            text: this.name,

        }).setOrigin(0.5, -1.5);

        nameText.depth = Constants.LAYER.CITY_NAMES;
        this.scene.add.existing(nameText);
        console.log(nameText.x, nameText.y);

        // Get all tiles around this city and add them to the influence area
        this.updateInfluenceArea();

    }

    activate() {
        console.log("🏘️ --> Selected")
        // Display all its influence tiles
        for (let tile of this._influenceTiles) {
            // tile.displayInfluence(this._tribe);
            tile.highlight();
        }

    }
    deactivate() {
        console.log("🏘️ --> Unselected")
    }

    updateInfluenceArea() {

        // Clear the array of influence tiles
        for (let t of this._influenceTiles) {
            t.belongsTo = null;
        }
        this._influenceTiles = []

        let r = this.influenceRadius;
        let ring = this._map.getRing(this.tile, r);
        // Remove all tiles that belong to another city
        ring = ring.filter(t => t.belongsTo === null);

        for (let r of ring) {
            this._influenceTiles.push(r);
        }

        for (let t of this._influenceTiles) {
            t.belongsTo = this;
        }
    }


}