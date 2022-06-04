export var ratio: number;
// export var bounds: Phaser.Geom.Rectangle;

declare var Chance: any;

export class Boot extends Phaser.Scene {

    constructor() {
        super('boot');
    }

    preload() {
        // Fog of war
        this.load.image('hex', 'assets/hex/hex.png');

        this.load.image('toundra', 'assets/hex/hex_toundra.png');
        this.load.image('land', 'assets/hex/hex_land.png');
        this.load.image('land2', 'assets/hex/hex_land2.png');
        this.load.image('land3', 'assets/hex/hex_land3.png');
        this.load.image('land4', 'assets/hex/hex_land4.png');
        this.load.image('water', 'assets/hex/hex_water.png');
        this.load.image('beach', 'assets/hex/hex_beach.png');
        this.load.image('deepwater', 'assets/hex/hex_deepwater.png');

        this.load.image('tree', 'assets/hex/tree.png');
        this.load.image('tree2', 'assets/hex/tree2.png');
        this.load.image('mountain', 'assets/hex/mountain.png');
        this.load.image('mountain2', 'assets/hex/mountain2.png');

        // this.load.image('selector', 'assets/selector.png');

        // this.load.image('city', 'assets/city.png');

        // Units
        // this.load.image('warrior', 'assets/units/warrior.png');
        // this.load.image('settler', 'assets/units/settler.png');
        // this.load.image('settler_create', 'assets/units/settler_create.png');

        // UI
        // this.load.image('foodIcon', 'assets/hud/food.png');
        // this.load.image('goldIcon', 'assets/hud/gold.png');
        // this.load.image('scienceIcon', 'assets/hud/research.png');
        // this.load.image('skull', 'assets/hud/skull.png');

        // Special resources
        // this.load.image('wheat', 'assets/resources/wheat.png');
        // this.load.image('iron', 'assets/resources/iron.png');
        // this.load.image('gold', 'assets/resources/gold.png');

        // Units
        // this.load.json("units", "assets/jsons/units.json");
        // this.load.json("resources", "assets/jsons/resources.json");
        this.load.json("tiles", "assets/jsons/tiles.json");

        this.load.bitmapFont('font_normal', 'assets/fonts/font_normal.png', 'assets/fonts/font_normal.xml');
    }

    create() {

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;

        let baseW = 360 * 2;
        let baseH = 740 * 2;

        let ratioW = w / baseW;
        let ratioH = h / baseH;

        if (ratioW > ratioH) {
            ratio = ratioH;
        } else {
            ratio = ratioW;
        }

        let bounds = new Phaser.Geom.Rectangle(
            w / 2 - baseW / 2 * ratio,
            h / 2 - baseH / 2 * ratio,
            baseW * ratio,
            baseH * ratio);

        console.log('Bounds - ', bounds);
        console.log('Game width - ', w);
        console.log('Game height - ', h);
        console.log('Window - ', window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);
        console.log('ratio - ', ratio);


        // this.scene.start('gameui');
        this.scene.start('game');
        // this.scene.start('home');
    }

}