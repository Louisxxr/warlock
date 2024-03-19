class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app6621.acapp.acwing.com.cn/wss/multi_mode/");

        this.start();
    }

    start() {
    }

    send_create_player() {
        this.ws.send(JSON.stringify({
            "message": "hello, server"
        }))
    }

    receive_create_player() {
    }
}