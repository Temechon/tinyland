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

            if (noise < Constants.MAP.WATER.THRESHOLD) {
                tile.setInfos(allTilesType[TileType.Water]);
                continue
            }

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

        // Arctic on north and south of the map (r = +-MAP.SIZE)
        let nbLineTop = Math.floor(this.radius * 3 / 15);
        let probamin = 1 / nbLineTop;

        for (let i = 0; i <= nbLineTop; i++) {
            let allTop = this.getAllTiles(t => t.rq.r === this.radius - i);
            allTop.push(...this.getAllTiles(t => t.rq.r === -this.radius + i));
            for (let t of allTop) {
                if (Phaser.Math.RND.frac() < (1 - probamin * i)) {
                    t.setTint(0xffffff)
                    t.setInfos(allTilesType[TileType.Toundra]);
                }
            }
        }

        // Add all land tiles to the walking graph
        this.doForAllTiles(t => this.addTileToGraph(t), t => !t.isWater)

        // TREES
        this.doForAllTiles(t => {
            let img;
            let trees = ['tree', 'tree2'];

            img = this.scene.add.image(t.x, t.y, Phaser.Math.RND.pick(trees));
            img.setOrigin(0.5, 0.65)
            img.scale = ratio;
            img.depth = Constants.LAYER.TREES_AND_RESOURCES;
            this.allAssets.add(img)

        }, t => t.isForest)


        //MOUNTAINS !
        this.doForAllTiles(t => {
            let img;
            let mountain = ['mountain', 'mountain2'];

            img = this.scene.add.image(t.x, t.y, Phaser.Math.RND.pick(mountain));
            img.scale = ratio;
            img.depth = Constants.LAYER.TREES_AND_RESOURCES;
            this.allAssets.add(img)

        }, t => t.isMountain)
        this.bringToTop(this.allAssets)
    }

    /**
     * A the given tile in the walking graph
     */
    public addTileToGraph(tile: Tile) {
        if (tile.isWater) {
            // Nothing to do
            return;
        }

        let neighboursSet = {};

        let neighbours = this.getTilesByAxialCoords(this._grid.neighbors(tile.rq.q, tile.rq.r));
        for (let n of neighbours) {
            if (n.isWater) {
                continue;
            }
            // Road from tile to n
            neighboursSet[n.name] = 1;
        }
        this._landgraph.addVertex(tile.name, neighboursSet);
    }

    /**
     * Do a specific action for all tiles where the given predicate is true.
     * Returns all tiles impacted by this action.
     * All tiles are browsed from the bottom left of the map to to top right
     */
    public doForAllTiles(action: (t: Tile) => void, predicate?: (t: Tile) => boolean): Array<Tile> {

        let res = [];
        if (!predicate) {
            predicate = (t) => true;
        }

        for (let x = this._tiles.length - 1; x >= 0; x--) {
            for (let y = this._tiles[0].length - 1; y >= 0; y--) {
                let t = this.getTile(x, y);

                // If the tile is empty, continue
                if (!t) {
                    continue;
                }
                if (predicate(t)) {
                    action(t);
                    res.push(t);
                }
            }
        }
        return res;
    }

    /**
     * Return the list of tiles corresponding to the given coordinates.
     * Removes all tile that are null (not in the map)
     */
    public getTilesByAxialCoords(coords: Array<{ q: number, r: number }>): Array<Tile> {
        let res = [];

        for (let coord of coords) {
            let tile = this.getTileByAxialCoords(coord.q, coord.r);
            if (tile) {
                res.push(tile);
            }
        }
        return res;
    }

    /**
     * Return a tile by its given axial coordinates. Uselful when ahg lib gives only coordinates
     */
    public getTileByAxialCoords(q: number, r: number): Tile | null {
        if (q < -this.radius || q > this.radius) {
            return null;
        }
        if (r < -this.radius || r > this.radius) {
            return null;
        }
        return this._tiles[r + this.radius][q + this.radius] || null;
    }

    /**
     * Returns all tile that satisfies the given predicate
     */
    public getAllTiles(predicate: (t: Tile) => boolean): Array<Tile> {

        let res = [];

        for (let x = 0; x < this._tiles.length; x++) {
            for (let y = 0; y < this._tiles[0].length; y++) {
                let t = this.getTile(x, y);

                // If the tile is empty, continue
                if (!t) {
                    continue;
                }
                if (predicate(t)) {
                    res.push(t);
                }
            }
        }
        return res;
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