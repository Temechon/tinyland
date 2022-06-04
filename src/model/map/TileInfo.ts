export interface TileInfo {
    /** The tile type */
    type: TileType;
    /** The sprite key (or list of keys) used to display this kind of tile */
    key: string | Array<string>;

    /** Used when two units attack */
    defenseModifier: number;

    /** Resources given each turn by this kind of tile */
    resources: {
        food?: string,
        science?: string,
        gold?: string,
    }

}
/**
 * Hexagons on the map can be one of these kind
 */
export enum TileType {
    Land = "land", /* Resource can grow on it */
    Water = "water", /* Only boat can go through */
    Beach = "beach", /* Only boat can go through */
    Forest = "forest",
    Mountain = "mountain",
    DeepWater = "deepwater", /* Only bigger boat can navigate here */
    Toundra = "toundra" /* Nothing much to do here... Maybe except some awesome resources ? */
}