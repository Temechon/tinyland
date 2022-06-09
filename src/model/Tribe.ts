import { City } from "./City";
import { Constants } from "./Constants";
import { ResourceType, Tile } from "./map/Tile";
import { WorldMap } from "./map/WorldMap";
import { Unit } from "./Unit";
import { UnitInfo } from "./UnitInfo";

/**
 * A tribe is a set of cities, units and resources available on the map.
 */
export class Tribe extends Phaser.GameObjects.Container {

    map: WorldMap;

    public cities: City[] = [];
    public units: Unit[] = [];

    /** THe first city created for this tribe */
    capital: City;

    /** The color of the influence radius */
    public color: number;

    /** True if this tribe is the player, false otherwise */
    isPlayer: boolean = false;

    /** Has this tribe been exterminated ? */
    exterminated: boolean = false;


    constructor(config: {
        scene: Phaser.Scene,
        name: string,
        map: WorldMap
    }) {
        super(config.scene);
        this.name = config.name;
        this.map = config.map;
        this.scene.add.existing(this);
        this.depth = Constants.LAYER.TRIBE;
    }

    destroy() {
        for (let c of this.cities) {
            c.destroy();
        }

        for (let u of this.units) {
            u.destroy();
        }
        super.destroy();
    }

    /**
     * Set a city on the given tile, add ressources (1 gold, 2 science) on this tile (just because).
     */
    setCityOn(tile: Tile): City {

        let city = new City({
            scene: this.scene,
            tile: tile,
            tribe: this,
            map: this.map
        });
        // Update the tile resource : add one gold and one science
        tile.resources[ResourceType.gold]++
        tile.resources[ResourceType.science] += 2;

        // Make this city the capital if first one
        if (this.cities.length === 0) {
            this.capital = city;
        }

        this.cities.push(city);
        this.add(city);

        this.bringToTop(city);

        return city;
    }

    /**
     * Add the given unit to the tribe
     * @param info 
     */
    addUnit(info: UnitInfo, tile: Tile) {
        const unit = new Unit({
            scene: this.scene,
            infos: info,
            map: this.map,
            tile: tile,
            tribe: this
        });
        this.units.push(unit);
        this.scene.add.existing(unit);
    }

    /**
     * Remvoes the given unit from the tribe
     * @param unit 
     */
    removeUnit(unit: Unit) {
        let i = this.units.indexOf(unit);
        this.units.splice(i, 1);
    }

    /**
     * Reset the state of all units
     */
    nextTurn() {
        for (let u of this.units) {
            u.nextTurn();
        }
    }

}