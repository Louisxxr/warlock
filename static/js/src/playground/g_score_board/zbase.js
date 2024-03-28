class ScoreBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;

        this.state = null; // win / lose

        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    
        this.start();
    }

    start() {
    }

    add_listening_events() {
        let that = this;
        let $canvas = this.playground.map.$canvas;

        $canvas.on('click', function() {
            that.playground.hide();
            that.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";

        let that = this;
        setTimeout(function() {
            that.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";

        let that = this;
        setTimeout(function() {
            that.add_listening_events();
        }, 1000);
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.context.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.context.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}