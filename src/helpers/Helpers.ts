import { ratio } from "../scenes/Boot";

export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export class Helpers {


    static getCityName() {
        let pre = ['Ply', 'Ex', 'Nor', 'Fat', 'Yar', 'Stoke', 'Castle', 'Ash', 'Wil', 'Tam', 'Nak', 'Plo', 'Tyr', 'Wood', 'New'];
        let suf = ['mont', 'pol', 'die', 'ville', 'stone', 'west', 'gow', 'hill', 'ham'];

        let qualif = ['Great ', 'New ', 'Old ', ''];

        return Phaser.Math.RND.pick(qualif) +
            Phaser.Math.RND.pick(pre) +
            Phaser.Math.RND.pick(suf);
    }

    /**
     * Returns the string to be used as a style to create a phaser text
     * @param _size 
     * @param _family 
     */
    public static font(_size: number): string {
        let px = _size * ratio;
        return px + "px ";
    }

}