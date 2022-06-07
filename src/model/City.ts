import { Helpers } from "../helpers/Helpers";
import { ratio } from "../scenes/Boot";
import { Constants } from "./Constants";
import { IClickable } from "./IClickable";
import { Tile } from "./map/Tile";
import { Tribe } from "./Tribe";

export class City extends Phaser.GameObjects.Container implements IClickable {

    /** The tribe this city belongs to */
    private _tribe: Tribe;

    /** The tile this city is on */
    tile: Tile;


    constructor(config: {
        scene: Phaser.Scene,
        tile: Tile,
        tribe: Tribe
    }) {
        super(config.scene, config.tile.worldPosition.x, config.tile.worldPosition.y);

        this.tile = config.tile;
        this._tribe = config.tribe;

        this.tile.addCity(this);

        let cityImage = this.scene.make.image({
            x: 0,
            y: 0,
            key: 'city',
            scale: ratio,
            add: false
        });
        this.name = Helpers.getCityName();
        this.add(cityImage)

        let nameText = this.scene.make.bitmapText({
            x: this.tile.worldPosition.x,
            y: this.tile.worldPosition.y,
            font: "font_normal",
            size: 45 * ratio,
            text: this.name,
            depth: Constants.LAYER.TRIBE_ROOT
        }).setOrigin(0.5, -1.5);
        this.add(nameText);
    }

    activate() {
        console.log("🏘️ --> Activated")
    }
    deactivate() {
        console.log("🏘️ --> Deactivated")
    }


}