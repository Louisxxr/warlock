class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app6621.acapp.acwing.com.cn/wss/multi_mode/");

        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        let that = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === that.uuid) {
                return false;
            }
            let event = data.event;
            if (event === "create_player") {
                that.receive_create_player(uuid, data.username, data.photo);
            }
        };
    }

    send_create_player(username, photo) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "create_player",
            "uuid": that.uuid,
            "username": username,
            "photo": photo
        }))
    }

    receive_create_player(uuid, username, photo) {
        let player = new GamePlayer(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.id = uuid;
        this.playground.players.push(player);
    }
}