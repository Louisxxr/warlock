let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.has_init = false;
        this.time_diff = 0; // 本帧与上一帧的时间间隔（用于计算速度，单位：ms）
    }

    start() { // 在第一帧执行（初始化）
    }

    update() { // 在每一帧都执行
    }

    render() { // 渲染
    }

    on_destroy() { // 在销毁对象前执行
    }

    destroy() { // 销毁对象
        this.on_destroy();

        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        if (!obj.has_init) {
            obj.start();
            obj.has_init = true;
        } else {
            obj.time_diff = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION);