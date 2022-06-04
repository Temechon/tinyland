import { FastSimplexNoise } from "../../helpers/FastSimplexNoise";
import { HexGrid } from "../../helpers/HexGrid";
import { ratio } from "../../scenes/Boot";
import { Constants } from "../Constants";
import { Graph } from "./Graph";
import { Tile } from "./Tile";
import { TileInfo, TileType } from "./TileInfo";

export class WorldMap extends Phaser.GameObjects.Container {

    /** All tiles of this map, indexed by hexagon XY coordinates. Hex(q, r) is at array[x=r+SIZE][y=q+SIZE]  */
    private _tiles: Array<Array<Tile>> = [];

    /** The hex grid coordinates (q,r) */
    private _grid: HexGrid;

    /** The walking graph for land units */
    private _landgraph: Graph;

    /** The total number of tiles on this map */
    nbTiles: number;

    /* Contains coasts, trees, mountains and resources */
    allAssets: Phaser.GameObjects.Container;

    /** The number of tiles from the center to the left edge of the map */
    radius: number;

    constructor(scene: Phaser.Scene, radius: number) {
        super(scene);
        this.radius = radius;

        this.scene.add.existing(this);
        this.x = (this.scene.game.config.width as number) / 2;
        this.y = (this.scene.game.config.height as number) / 2;

        this.allAssets = this.scene.make.container({ x: this.x, y: this.y, add: true });
        // this.add(this.allTrees);
        this.allAssets.depth = Constants.LAYER.TREES_AND_RESOURCES

        this._grid = new HexGrid(97, true);

        this._landgraph = new Graph();

        // Load tiles type
        let tileKind = this.scene.cache.json.get('tiles');
        let allTilesType: TileInfo[] = [];
        for (let t of tileKind) {
            allTilesType[t.type] = t as TileInfo;
        }

        let mapCoords = this._grid.hexagon(0, 0, this.radius, true);
        this.nbTiles = mapCoords.length;
        this.depth = Constants.LAYER.MAP.ROOT;

        console.log("MAP - Radius : ", this.radius);
        console.log("MAP - Nb tiles : ", this.nbTiles);

        let noiseGen = new FastSimplexNoise(Constants.MAP.WATER.NOISE);
        let noiseForestGen = new FastSimplexNoise(Constants.MAP.FOREST.NOISE);
        let noiseMountainGen = new FastSimplexNoise(Constants.MAP.MOUNTAIN.NOISE);

        /** Set tiles type (grass, tree, mountains or water) */
        for (let c of mapCoords) {

            let center = this._grid.getCenterXY(c.q, c.r);

            let tile = new Tile({
                scene: this.scene,
                x: center.x * ratio,
                y: center.y * ratio,
                r: c.r,
                q: c.q,
                key: 'land'
            });
            this.push(tile);
            this.add(tile);

            let noise = noiseGen.scaled([c.q, c.r]);
            let noiseForest = noiseForestGen.scaled([c.q, c.r]);
            let noiseMountain = noiseMountainGen.scaled([c.q, c.r]);

            if (noise < Constants.MAP.DEEPWATER) {
                tile.setInfos(allTilesType[TileType.DeepWater]);
                continue
            }

            // if (noise < Constants.MAP.WATER.THRESHOLD) {
            // tile.setInfos(allTilesType[TileType.Water]);
            // continue
            // }

            // if (noise < Constants.MAP.BEACH) {
            //     tile.setInfos(allTilesType[TileType.Water]);
            //     tile.infos.type = TileType.Beach;
            //     tile.setTexture("beach")
            //     tile.infos.key = "beach";
            //     continue
            // }

            if (noiseForest < Constants.MAP.FOREST.THRESHOLD) {
                tile.setInfos(allTilesType[TileType.Forest]);
                continue
            }
            if (noiseMountain > Constants.MAP.MOUNTAIN.THRESHOLD) {
                tile.setInfos(allTilesType[TileType.Mountain]);
                continue
            }

            tile.setInfos(allTilesType[TileType.Land]);

        }

    }

    /**
     * Add the given tile to the map storage data
     */
    private push(t: Tile) {
        let coords = {
            x: t.rq.r + this.radius,
            y: t.rq.q + this.radius
        };
        if (!this._tiles[coords.x]) {
            this._tiles[coords.x] = [];
        }
        this._tiles[coords.x][coords.y] = t;
    }

    public getTile(x: number, y: number): Tile | null {
        return this._tiles[x][y] || null;
    }

}