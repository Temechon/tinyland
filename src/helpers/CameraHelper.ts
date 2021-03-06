import { Constants } from '../model/Constants';

export class CameraHelper {

    static TOUCH0 = 0;
    static TOUCH1 = 1;
    static TOUCH2 = 2;

    static IDLE = 'IDLE';
    static BEGIN = 'BEGIN';
    static RECOGNIZED = 'RECOGNIZED';

    pointers = [];
    movedState: any = {};
    tracerState: number = CameraHelper.TOUCH0;

    scaleFactor: number;
    prevDistance: number = undefined;


    state = CameraHelper.IDLE;

    distanceDragged = 0;

    static MOVING = false;

    constructor(public scene: Phaser.Scene) {


        this.scene.input.addPointer(1);
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {


            var index = this.pointers.indexOf(pointer);
            if (index !== -1) { // Already in catched pointers
                return;
            }

            if (this.pointers.length === 2) {
                return;
            } else {
                this.movedState[pointer.id] = false;
                this.pointers.push(pointer);
            }


            switch (this.tracerState) {
                case CameraHelper.TOUCH0:
                    // this.onDrag1Start();
                    this.tracerState = CameraHelper.TOUCH1;
                    // text2.text = "TOUCH 0 -> TOUCH1"
                    break;
                case CameraHelper.TOUCH1:
                    // this.onDrag2Start();
                    this.tracerState = CameraHelper.TOUCH2;
                    // text2.text = "TOUCH 1 -> TOUCH2"

                    this.scaleFactor = 1;
                    this.prevDistance = this.distanceBetween;
                    this.state = CameraHelper.RECOGNIZED;
                    break;
            }

        });


        this.scene.input.on('pointerup', (pointer) => {

            var index = this.pointers.indexOf(pointer);
            if (index === -1) { // Not in catched pointers
                return;
            } else {
                delete this.movedState[pointer.id];
                this.pointers.splice(index, 1);
            }

            this.distanceDragged = 0;
            switch (this.tracerState) {
                case CameraHelper.TOUCH1:
                    this.tracerState = CameraHelper.TOUCH0;
                    CameraHelper.MOVING = false;
                    // text2.text = "TOUCH 1 -> TOUCH0"
                    // this.onDrag1End();
                    break;
                case CameraHelper.TOUCH2:
                    this.tracerState = CameraHelper.TOUCH1;
                    // text2.text = "TOUCH 2 -> TOUCH1"
                    // this.onDrag2End();
                    this.state = "IDLE";
                    // this.onDrag1Start();
                    break;
            }
        })

        this.scene.input.on('wheel', (pointer, CameraHelperObjects, deltaX, deltaY, deltaZ) => {

            // console.log("CAMERA - Zoom:", this.scene.cameras.main.zoom);
            this.scene.cameras.main.zoom -= deltaY / 1000;
        });


        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            // text2.text = "Moving " + this.state
            // console.log("moving")

            if (pointer.isDown) {
                if (!this.movedState[pointer.id]) {
                    this.movedState[pointer.id] = (pointer.x !== pointer.downX) || (pointer.y !== pointer.downY);
                }
                if (this.movedState[pointer.id]) {
                    let camera = this.scene.cameras.main;
                    this.scene.events.emit(Constants.EVENTS.UI_OFF)
                    switch (this.tracerState) {
                        case CameraHelper.TOUCH1:
                            // this.onDrag1();
                            // this.scene.events.emit("circularmenuoff")
                            let drag1Vector = this.drag1Vector;
                            this.distanceDragged += drag1Vector.x * drag1Vector.x + drag1Vector.y * drag1Vector.y;
                            if (this.distanceDragged > 100) {
                                CameraHelper.MOVING = true;
                            }

                            camera.scrollX -= drag1Vector.x / camera.zoom;
                            camera.scrollY -= drag1Vector.y / camera.zoom;
                            break;
                        case CameraHelper.TOUCH2:
                            this.onDrag2();
                            camera.zoom *= this.scaleFactor;
                            break;
                    }
                }
            }
        });

    }



    private onDrag2() {
        switch (this.state) {
            case CameraHelper.BEGIN:
                if ((this.pointers[0].getDistance() >= 0) &&
                    (this.pointers[1].getDistance() >= 0)) {
                    var curDistance = this.distanceBetween;
                    this.scaleFactor = curDistance / this.prevDistance;
                    this.prevDistance = curDistance;
                    this.state = CameraHelper.RECOGNIZED;
                }
                break;
            case CameraHelper.RECOGNIZED:
                var curDistance = this.distanceBetween;
                this.scaleFactor = curDistance / this.prevDistance;
                // this.emit('pinch', this);
                this.prevDistance = curDistance;
                CameraHelper.MOVING = true;
                break;
        }
    }



    get drag1Vector() {
        let tmpDragVector = { x: 0, y: 0 };
        var pointer = this.pointers[0];
        if (pointer && this.movedState[pointer.id]) {
            var p1 = pointer.position;
            var p0 = pointer.prevPosition;
            tmpDragVector.x = p1.x - p0.x;
            tmpDragVector.y = p1.y - p0.y;
        } else {
            tmpDragVector.x = 0;
            tmpDragVector.y = 0;
        }
        return tmpDragVector;
    }

    get distanceBetween() {
        if (this.tracerState !== CameraHelper.TOUCH2) {
            return 0;
        }
        var p0 = this.pointers[0],
            p1 = this.pointers[1];
        return Phaser.Math.Distance.Between(p0.x, p0.y, p1.x, p1.y);
    }

    static animateTo(cam: Phaser.Cameras.Scene2D.Camera, pos: Phaser.Types.Math.Vector2Like): Promise<any> {
        return new Promise(resolve => {

            var originX = cam.width / 2;
            var originY = cam.height / 2;
            cam.scene.add.tween({
                targets: cam,
                duration: 250,
                ease: Phaser.Math.Easing.Circular.Out,
                scrollX: pos.x - originX,
                scrollY: pos.y - originY,
                onComplete: resolve
            })
        })
    }
}