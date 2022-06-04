import { guid } from "../../helpers/Helpers";
import { HexGrid } from "../../helpers/HexGrid";
import { ratio } from "../../scenes/Boot";
import { TileInfo } from "./TileInfo";

import * as _ from 'underscore';

enum NEIGHBOURS_DIRECTIONS {
    NORTH_WEST = 0,
    NORTH_EAST = 1,
    EAST = 2,
    SOUTH_EAST = 3,
    SOUTH_WEST = 4,
    WEST = 5
}

export enum ResourceType {
    gold,
    food,
    science
}

export type Vertex = { coords: Phaser.Types.Math.Vector2Like, neighbours: number[] };
export type RQ = { r: number, q: number };

export class Tile extends Phaser.GameObjects.Image {

    /** Row and col number */
    public rq: RQ;

    /** Coordinates of each vertex of this tile */
    private _vertices: Array<Vertex> = [];

    /** All resources that can be found on this tile. Index: Resource type, value : number of this type */
    public resources: number[] = [];

    /** This tile info : kind of tile, defense modifier, resource bonus... */
    infos: TileInfo;


    constructor(config: {
        scene: Phaser.Scene,
        x: number,
        y: number,
        r: number,
        q: number,
        key: string
    }) {
        super(config.scene, config.x, config.y, config.key);

        this.scale = ratio;
        this.rq = { r: config.r, q: config.q };
        this.name = guid();
        this.setInteractive();
        this.on('pointerup', this.onPointerUp.bind(this));
    }

    /** Set the given infos to this tile */
    setInfos(infos: TileInfo) {
        this.infos = _.extend({}, infos);

        // Update texture
        let key = infos.key;
        if (Array.isArray(key)) {
            key = Phaser.Math.RND.pick(infos.key as string[]);
        }
        this.setTexture(key)
        this.infos.key = key;

        // Update resources
        this.resources[ResourceType.gold] = parseInt(infos.resources.gold) || 0;
        this.resources[ResourceType.food] = parseInt(infos.resources.food) || 0;
        this.resources[ResourceType.science] = parseInt(infos.resources.science) || 0;
    }

    get worldPosition(): Phaser.Types.Math.Vector2Like {
        let x = this.parentContainer.x + this.x;
        let y = this.parentContainer.y + this.y;
        return { x: x, y: y };
    }

    get vertices(): Array<Vertex> {
        return this._vertices;
    }

    /**
     * Returns true if the given vertex is shared with this tile
     */
    hasVertex(vex: Vertex): boolean {
        for (let v of this._vertices) {
            if (Phaser.Math.Distance.BetweenPointsSquared(vex.coords, v.coords) < 100 * ratio) {
                return true;
            }
        }
        return false;
    }

    hasVertexAsPoint(p: Phaser.Types.Math.Vector2Like): boolean {
        for (let v of this._vertices) {
            if (Phaser.Math.Distance.BetweenPointsSquared(p, v.coords) < 100 * ratio) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns all tiles from the given array that share the given vertex
     */
    static getTilesSharingVertex(vex: Vertex, tiles: Tile[]): Tile[] {
        let res = [];

        for (let t of tiles) {
            if (t.getVertex(vex)) {
                res.push(t);
            }
        }
        return res;
    }
    /**
     * Returns all tiles from the given array that share the given vertex
     */
    static getTilesSharingVertexAsPoint(vex: Phaser.Types.Math.Vector2Like, tiles: Tile[]): Tile[] {

        return Tile.getTilesSharingVertex({ coords: vex, neighbours: [] }, tiles)
    }

    /**
     * Returns the vertex corresponding to the given vertex position for this tile, null if not found
     */
    getVertex(vex: Vertex): Vertex {
        for (let v of this._vertices) {
            if (Phaser.Math.Distance.BetweenPointsSquared(vex.coords, v.coords) < 100 * ratio) {
                return v;
            }
        }
        return null;
    }

    getRandomVertex(): Vertex {
        return Phaser.Math.RND.pick(this._vertices);
    }

    /**
     * Returns all vertices shared with the given tile.
     */
    getVerticesSharedWith(tile: Tile): Array<Vertex> {
        let otherVertices = tile._vertices;
        let res: Vertex[] = [];
        for (let v of this._vertices) {
            for (let ov of otherVertices) {
                if (Phaser.Math.Distance.BetweenPointsSquared(v.coords, ov.coords) < 100 * ratio) {
                    res.push(v);
                }
            }
        }
        return res;
    }

    /**
     * Store all vertices for this tile and its edge in memory, in order to draw rivers
     */
    computePointsAndEdges() {

        let points = HexGrid.getPoints({
            width: this.displayWidth,
            height: this.displayHeight,
            x: this.x,
            y: this.y
        });

        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            this._vertices.push({
                coords: p,
                neighbours: [(i - 1) < 0 ? points.length - 1 : i - 1, (i + 1) % points.length]
            })
        }
    }

    /**
     * Returns a graphics texture that is the same hexagon than this tile
     * @param color 
     */
    public getHexPrint(color: number): Phaser.GameObjects.Graphics {

        let radius = this.scene.make.graphics({ x: this.worldPosition.x, y: this.worldPosition.y, add: false });
        radius.fillStyle(color, 1.0);
        radius.beginPath();
        radius.scale = ratio;
        // radius.alpha = 0.5

        let points = HexGrid.getPoints({
            width: this.width,
            height: this.height,
            x: 0,
            y: 0
        })

        radius.fillPoints(points);
        radius.setInteractive(
            new Phaser.Geom.Polygon(points),
            Phaser.Geom.Polygon.Contains
        );

        return radius;
    }

    public onPointerUp() {
        console.log("up");

    }

    /**
     * Return the direction the other hex is relative to this one.
     */
    getNeighbouringDirection(other: Tile): NEIGHBOURS_DIRECTIONS {
        // NORTH_EAST or SOUTH_WEST
        if (this.rq.q === other.rq.q) {
            // NORTH_WEST
            if (this.rq.r - 1 === other.rq.r) {
                return NEIGHBOURS_DIRECTIONS.SOUTH_WEST;
            }
            return NEIGHBOURS_DIRECTIONS.NORTH_EAST;

        }
        // EAST or WEST
        if (this.rq.r === other.rq.r) {
            // EAST
            if (this.rq.q + 1 === other.rq.q) {
                return NEIGHBOURS_DIRECTIONS.EAST;
            }
            return NEIGHBOURS_DIRECTIONS.WEST
        }

        if (this.rq.q + 1 === other.rq.q) {
            return NEIGHBOURS_DIRECTIONS.SOUTH_EAST
        }
        return NEIGHBOURS_DIRECTIONS.NORTH_WEST
    }

    /**
     * Draw the path from the 'from' vertex, to the 'to' vertex. Returns the list of vertex use to draw this path, including 'from' and 'to'
     */
    drawShortestEdgePath(from: Vertex, to: Vertex, graphics: Phaser.GameObjects.Graphics): Vertex[] {
        let path = this.getShortestEdgePath(from, to);

        for (let v = 0; v < path.length - 1; v++) {
            let vex = path[v];
            let vevex = path[v + 1]
            graphics.lineBetween(vex.coords.x, vex.coords.y, vevex.coords.x, vevex.coords.y);
        }
        return path;
    }

    getShortestEdgePath(from: Vertex, to: Vertex): Vertex[] {
        let dir1 = this._getEdgesPath(from, to, 0);
        let dir2 = this._getEdgesPath(from, to, 1);

        if (dir1.length < dir2.length) {
            return dir1;
        }
        return dir2;
    }

    /**
     * Includes from and to in the result array
     */
    private _getEdgesPath(from: Vertex, to: Vertex, dir: number): Vertex[] {
        let res = [from];
        let start = from;

        if (from === to) {
            return [];
        }
        for (let v = 0; v < this._vertices.length; v++) {
            let neighbour = this._vertices[start.neighbours[dir]];
            res.push(neighbour);
            if (neighbour === to) {
                break;
            }
            start = neighbour;
        }

        return res;
    }

    equals(other: Tile) {
        return this.rq.q === other.rq.q && this.rq.r === other.rq.r;
    }

    destroy() {
        super.destroy();
    }
}