class Playground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="game-playground">
        </div>
        `);
        this.hide();

        this.start();
    }

    start() {

    }

    show() { // 显示 playground 界面
        this.$playground.show();

        this.root.$game.append(this.$playground);
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.map = new GameMap(this);
        this.players = [];
        this.players.push(new GamePlayer(this, this.width / 2, this.height / 2, 0.05 * this.height, "white", 0.2 * this.height, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new GamePlayer(this, this.width / 2, this.height / 2, 0.05 * this.height, this.get_random_color(), 0.2 * this.height, false));
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