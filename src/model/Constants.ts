/**
 * Contains all constants of the game
 */
export abstract class Constants {

    static FONT = {
        TEXT: "OpenSans",
        NUMBERS: "KeepCalm"
    };

    /** The name of a settler in units.json */
    public static SETTLER_NAME = "Settler";

    public static MAP = {
        /** The map size */
        SIZE: 10, // 15 will be the final size

        /** Noise parameters for water */
        DEEPWATER: 50,
        WATER: {
            NOISE: {
                min: 0,
                max: 200,
                octaves: 1,
                frequency: 0.06
            },
            THRESHOLD: 70 // Less is less water
        },

        BEACH: 75,

        /** Noise parameters for forest */
        FOREST: {
            NOISE: {
                min: 0,
                max: 200,
                octaves: 5,
                frequency: 0.1
            },
            THRESHOLD: 75 // [min; max] : Less is more trees
        },
        MOUNTAIN: {
            NOISE: {
                min: 0,
                max: 200,
                octaves: 3,
                frequency: 1.04
            },
            THRESHOLD: 140
        },
    };
    public static LAYER = {
        FOG_OF_WAR: 30,
        CITY_NAMES: 20,
        UNITS: 11,
        TREES_AND_RESOURCES: 9,
        SELECTOR: 7,
        TRIBE: 3,
        MAP: 1
    }

    static EVENTS = {
        CIRCULAR_MENU_ON: "circularmenuon",
        CIRCULAR_MENU_OFF: "circularmenuoff",
        UI_UPDATE: "uiupdate",
        BOT_PANEL_TILE_ON: "botpaneltileon",
        BOT_PANEL_UNIT_ON: "botpaneluniton",
        UI_OFF: "uioff"
    }
}