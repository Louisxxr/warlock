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
            } else if (event === "move_to") {
                that.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                that.receive_shoot_fireball(uuid, data.tx, data.ty, data.fireball_uuid);
            } else if (event === "attack") {
                that.receive_attack(uuid, data.victim_uuid, data.x, data.y, data.angle, data.damage, data.fireball_uuid);
            } else if (event === "flash") {
                that.receive_flash(uuid, data.tx, data.ty);
            }
        };
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.id === uuid) {
                return player;
            }
        }

        return null;
    }

    send_create_player(username, photo) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "create_player",
            "uuid": that.uuid,
            "username": username,
            "photo": photo
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new GamePlayer(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.id = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "move_to",
            "uuid": that.uuid,
            "tx": tx,
            "ty": ty
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, fireball_uuid) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "shoot_fireball",
            "uuid": that.uuid,
            "tx": tx,
            "ty": ty,
            "fireball_uuid": fireball_uuid
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, fireball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = fireball_uuid;
        }
    }

    send_attack(victim_uuid, x, y, angle, damage, fireball_uuid) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "attack",
            "uuid": that.uuid,
            "victim_uuid": victim_uuid,
            "x": x,
            "y": y,
            "angle": angle,
            "damage": damage,
            "fireball_uuid": fireball_uuid
        }));
    }

    receive_attack(uuid, victim_uuid, x, y, angle, damage, fireball_uuid) {
        let attacker = this.get_player(uuid);
        let victim = this.get_player(victim_uuid);
        if (attacker && victim) {
            victim.receive_is_attacked(x, y, angle, damage, fireball_uuid, attacker);
        }
    }

    send_flash(tx, ty) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "flash",
            "uuid": that.uuid,
            "tx": tx,
            "ty": ty
        }));
    }

    receive_flash(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.flash(tx, ty);
        }
    }
}