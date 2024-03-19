class Playground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="game-playground">
        </div>
        `);
        this.root.$game.append(this.$playground);
        this.hide();

        this.start();
    }

    start() {
        let that = this;
        $(window).resize(function() {
            that.resize();
        });
    }

    resize() {
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.height = unit * 9;
        this.width = unit * 16;
        this.scale = this.height;
        
        if (this.map) {
            this.map.resize();
        }
    }

    show() { // 显示 playground 界面
        this.resize();
        this.$playground.show();
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.map = new GameMap(this);
        this.players = [];
        this.players.push(new GamePlayer(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.2, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new GamePlayer(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.2, false));
        }
    }

    hide() { // 隐藏 playground 界面
        this.$playground.hide();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "yellow", "grey", "green"];
        return colors[Math.floor(Math.random() * 6)];
    }
}