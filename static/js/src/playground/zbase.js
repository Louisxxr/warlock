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

    show(mode) { // 显示 playground 界面
        let that = this;
        this.$playground.show();
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // 多人模式可用，waiting -> fighting -> gameover
        this.player_count = 0;
        this.notice_board = new NoticeBoard(this);
        
        this.resize();
        this.players = [];
        this.players.push(new GamePlayer(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.2, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "sing_mode") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new GamePlayer(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.2, "robot"));
            }
        } else if (mode === "multi_mode") {
            this.socket = new MultiPlayerSocket(this);
            this.socket.uuid = this.players[0].id;
            this.socket.ws.onopen = function() {
                that.socket.send_create_player(that.root.settings.username, that.root.settings.photo);
            }
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