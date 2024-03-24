class Menu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
        <div class="game-menu">
            <div class="game-menu-box">
                <div class="game-menu-box-item game-menu-box-item-sing_mode">
                    单人模式
                </div>
                <br>
                <div class="game-menu-box-item game-menu-box-item-multi_mode">
                    多人模式
                </div>
                <br>
                <div class="game-menu-box-item game-menu-box-item-settings">
                    退出
                </div>
            </div>
        </div>
        `);
        this.hide();
        this.root.$game.append(this.$menu);
        this.$sing_mode = this.$menu.find(".game-menu-box-item-sing_mode");
        this.$multi_mode = this.$menu.find(".game-menu-box-item-multi_mode");
        this.$settings = this.$menu.find(".game-menu-box-item-settings");

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let that = this;
        this.$sing_mode.click(function() {
            that.hide();
            that.root.playground.show("sing_mode");
        });
        this.$multi_mode.click(function() {
            that.hide();
            that.root.playground.show("multi_mode");
        });
        this.$settings.click(function() {
            that.root.settings.logout_on_remote();
        });
    }

    show() { // 显示 menu 界面
        this.$menu.show();
    }

    hide() { // 隐藏 menu 界面
        this.$menu.hide();
    }
}let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.has_init = false;
        this.time_diff = 0; // 本帧与上一帧的时间间隔（用于计算速度，单位：ms）
    
        this.id = this.create_id();
    }

    create_id() {
        let id = ""
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            id += x;
        }
        return id;
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

requestAnimationFrame(GAME_ANIMATION);class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.context = this.$canvas[0].getContext('2d');
        this.context.canvas.height = this.playground.height;
        this.context.canvas.width = this.playground.width;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        // this.$canvas.on("contextmenu", function() {
        //     return false;
        // });

        this.$canvas.focus();
    }

    resize() {
        this.context.canvas.height = this.playground.height;
        this.context.canvas.width = this.playground.width;
        this.context.fillStyle = "rgba(0, 0, 0, 1)";
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height, 0.2 * this.height, true);
    }

    update() {
        this.render();
    }

    render() {
        this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height, 0.2 * this.height, true);
    }
}class GamePlayer extends GameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed; // 1 秒移动的距离
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.move_dist = 0;
        this.vx = 0;
        this.vy = 0;
        this.eps = 0.01;

        this.holding_skill = null;
        this.fireballs = [];

        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.protection_time = 0;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3; // 秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.flash_coldtime = 6; // 秒
            this.flash_img = new Image();
            this.flash_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write(this.playground.player_count + " 人已加入");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let that = this;
        
        this.playground.map.$canvas.mousedown(function(e) {
            if (that.playground.state !== "fighting") {
                return true;
            }

            const rect = that.context.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / that.playground.scale;
                let ty = (e.clientY - rect.top) / that.playground.scale;
                that.move_to(tx, ty);
                
                if (that.playground.mode === "multi_mode") {
                    that.playground.socket.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / that.playground.scale;
                let ty = (e.clientY - rect.top) / that.playground.scale;
                if (that.holding_skill === "fireball") {
                    if (that.fireball_coldtime > that.eps) {
                        return false;
                    }

                    let fireball = that.shoot_fireball(tx, ty);
                    
                    if (that.playground.mode === "multi_mode") {
                        that.playground.socket.send_shoot_fireball(tx, ty, fireball.id);
                    }
                } else if (that.holding_skill === "flash") {
                    if (that.flash_coldtime > that.eps) {
                        return false;
                    }

                    that.flash(tx, ty);

                    if (that.playground.mode === "multi_mode") {
                        that.playground.socket.send_flash(tx, ty);
                    }
                }

                that.holding_skill = null;
            }
        });

        this.playground.map.$canvas.keydown(function(e) {
            if (e.which === 13) { // Enter 键
                if (that.playground.mode === "multi_mode") {
                    that.playground.chatbox.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (that.playground.mode === "multi_mode") {
                    that.playground.chatbox.hide_input();
                    return false;
                }
            }

            if (that.playground.state !== "fighting") {
                return true;
            }

            if (e.which === 81) { // Q 键
                if (that.fireball_coldtime > that.eps) {
                    return true;
                }

                that.holding_skill = "fireball";
                return false;
            } else if (e.which === 70) { // F 键
                if (that.flash_coldtime > that.eps) {
                    return true;
                }

                that.holding_skill = "flash";
                return false;
            }
        });
    }

    move_to(tx, ty) {
        this.move_dist = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let color = "orange";
        let speed = 0.6;
        let move_dist = 1;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let damage = 0.01; // 每次击中造成 20% 伤害
        let fireball = new FireBall(this.playground, this, x, y, radius, color, speed, move_dist, vx, vy, damage);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    flash(tx, ty) {
        let dist = this.get_dist(this.x, this.y, tx, ty);
        dist = Math.min(dist, 0.8);

        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += dist * Math.cos(angle);
        this.y += dist * Math.sin(angle);

        this.flash_coldtime = 6;
        this.move_dist = 0; // 闪现后停下
    }

    update() {
        this.protection_time += this.time_diff / 1000;

        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.update_move();

        this.render();
    }

    update_coldtime() {
        this.fireball_coldtime -= this.time_diff / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.flash_coldtime -= this.time_diff / 1000;
        this.flash_coldtime = Math.max(this.flash_coldtime, 0);
    }

    update_move() {
        if (this.character === "robot" && this.protection_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.vx * player.speed * player.time_diff / 1000 * 1; // 预判：射击 1s 后的位置
            let ty = player.y + player.vy * player.speed * player.time_diff / 1000 * 1;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = this.move_dist = 0;
            this.x += this.damage_vx * this.damage_speed * this.time_diff / 1000;
            this.y += this.damage_vy * this.damage_speed * this.time_diff / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_dist < this.eps) {
                this.move_dist = 0;
                this.vx = 0;
                this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.speed * this.time_diff / 1000, this.move_dist);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_dist -= moved;
            }
        }
    }

    is_attacked(angle, damage) {
        let particles_num = 20 + Math.random() * 10;
        for (let i = 0; i < particles_num; i++) {
            let x = this.x;
            let y = this.y;
            let radius = 0.1 * this.radius * Math.random();
            let color = this.color;
            let speed = 10 * this.speed;
            let move_dist = 5 * this.radius * Math.random();
            let angle = 2 * Math.PI * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            new Particle(this.playground, x, y, radius, color, speed, move_dist, vx, vy);
        }

        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 75;
        this.speed *= 0.8;
    }

    receive_is_attacked(x, y, angle, damage, fireball_uuid, attacker) {
        attacker.destroy_fireball(fireball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.context.save();
            this.context.beginPath();
            this.context.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
            this.context.stroke();
            this.context.clip();
            this.context.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.context.restore();
        } else {
            this.context.beginPath();
            this.context.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
            this.context.fillStyle = this.color;
            this.context.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_fireball_img();
            this.render_flash_img();
        }
    }

    render_fireball_img() {
        let x = 1.5, y = 0.9, radius = 0.04;
        let scale = this.playground.scale;

        this.context.save();
        this.context.beginPath();
        this.context.arc(x * scale, y * scale, radius * scale, 0, 2 * Math.PI, false);
        this.context.stroke();
        this.context.clip();
        this.context.drawImage(this.fireball_img, (x - radius) * scale, (y - radius) * scale, radius * 2 * scale, radius * 2 * scale); 
        this.context.restore();

        this.context.beginPath();
        this.context.moveTo(x * scale, y * scale);
        this.context.arc(x * scale, y * scale, radius * scale, 0 - Math.PI / 2, 2 * Math.PI * this.fireball_coldtime / 3 - Math.PI / 2, false);
        this.context.moveTo(x * scale, y * scale);
        this.context.fillStyle = "rgba(0, 0, 255, 0.5)";
        this.context.fill();
    }

    render_flash_img() {
        let x = 1.62, y = 0.9, radius = 0.04;
        let scale = this.playground.scale;
        
        this.context.save();
        this.context.beginPath();
        this.context.arc(x * scale, y * scale, radius * scale, 0, 2 * Math.PI, false);
        this.context.stroke();
        this.context.clip();
        this.context.drawImage(this.flash_img, (x - radius) * scale, (y - radius) * scale, radius * 2 * scale, radius * 2 * scale); 
        this.context.restore();

        this.context.beginPath();
        this.context.moveTo(x * scale, y * scale);
        this.context.arc(x * scale, y * scale, radius * scale, 0 - Math.PI / 2, 2 * Math.PI * this.flash_coldtime / 6 - Math.PI / 2, false);
        this.context.moveTo(x * scale, y * scale);
        this.context.fillStyle = "rgba(0, 0, 255, 0.5)";
        this.context.fill();
    }

    on_destroy() {
        if (this.character === "me") {
            this.playground.state = "gameover";
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}class FireBall extends GameObject {
    constructor(playground, player, x, y, radius, color, speed, move_dist, vx, vy, damage) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_dist = move_dist;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_dist < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();
        if (this.player.character !== "enemy") {
            this.update_attack();
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.speed * this.time_diff / 1000, this.move_dist);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_dist -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player);
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius) {
            return true;
        } else {
            return false;
        }
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage); // 玩家被击中
        
        if (this.playground.mode === "multi_mode") {
            this.playground.socket.send_attack(player.id, player.x, player.y, angle, this.damage, this.id);
        }

        this.destroy(); // fireball 消失
    }

    render() {
        let scale = this.playground.scale;
        this.context.beginPath();
        this.context.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}class Particle extends GameObject {
    constructor(playground, x, y, radius, color, speed, move_dist, vx, vy) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_dist = move_dist;
        this.vx = vx;
        this.vy = vy;
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.speed < this.eps || this.move_dist < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.speed * this.time_diff / 1000, this.move_dist);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_dist -= moved;
        this.speed *= this.friction;

        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.context.beginPath();
        this.context.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    }
}class NoticeBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;
        this.text = "0 人已加入";
    }

    start() {
    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.context.font = "20px serif";
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText(this.text, this.playground.width / 2, 20);
    }
}class ChatBox {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="game-chat-box-history"></div>`);
        this.$input = $(`<input type="text" class="game-chat-box-input"></input>`);

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.func_id = null;

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let that = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) {
                that.hide_input();
                return false;
            } else if (e.which === 13) {
                let username = that.playground.root.settings.username;
                let text = that.$input.val();
                if (text) {
                    that.$input.val("");
                    that.add_message(username, text);
                    that.playground.socket.send_message(text);
                }
                return false;
            }
        })
    }

    show_history() {
        this.$history.fadeIn();

        if (this.func_id) {
            clearTimeout(this.func_id);
        }

        let that = this;
        this.func_id = setTimeout(function() {
            that.$history.fadeOut();
            this.func_id = null;
        }, 3000); // 3 秒后消失
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}] ${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.map.$canvas.focus();
    }
}class MultiPlayerSocket {
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
            } else if (event === "message") {
                that.receive_message(uuid, data.text);
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

    send_message(text) {
        let that = this;
        this.ws.send(JSON.stringify({
            "event": "message",
            "uuid": that.uuid,
            "text": text
        }));
    }

    receive_message(uuid, text) {
        let player = this.get_player(uuid);
        if (player) {
            player.playground.chatbox.add_message(player.username, text);
        }
    }
}class Playground {
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
            this.chatbox = new ChatBox(this);
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
}class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "web";
        if (this.root.acos) {
            this.platform = "acapp";
        }
        this.username = "";
        this.photo = "";

        this.$settings = $(`
        <div class="game-settings">
            <div class="game-settings-login">
                <div class="game-settings-title">
                    登录
                </div>
                <div class="game-settings-username">
                    <div class="game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="game-settings-password">
                    <div class="game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="game-settings-submit">
                    <div class="game-settings-item">
                        <button>登录</button>
                    </div>
                </div>
                <div class="game-settings-errormessages">
                </div>
                <div class="game-settings-option">
                    注册
                </div>
                <br>
                <div class="game-settings-acwing">
                    <img src="https://app6621.acapp.acwing.com.cn/static/image/settings/acwing.png" width="40">
                    <br>
                    <div>AcWing 一键登录</div>
                </div>
            </div>

            <div class="game-settings-register">
                <div class="game-settings-title">
                    注册
                </div>
                <div class="game-settings-username">
                    <div class="game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="game-settings-password game-settings-password-first">
                    <div class="game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="game-settings-password game-settings-password-second">
                    <div class="game-settings-item">
                        <input type="password" placeholder="确认密码">
                    </div>
                </div>
                <div class="game-settings-submit">
                    <div class="game-settings-item">
                        <button>注册</button>
                    </div>
                </div>
                <div class="game-settings-errormessages">
                </div>
                <div class="game-settings-option">
                    登录
                </div>
                <br>
                <div class="game-settings-acwing">
                    <img src="https://app6621.acapp.acwing.com.cn/static/image/settings/acwing.png" width="40">
                    <br>
                    <div>AcWing 一键登录</div>
                </div>
            </div>
        </div>
        `);
        this.root.$game.append(this.$settings);

        this.$login = this.$settings.find(".game-settings-login");        
        this.$login_username = this.$login.find(".game-settings-username input");
        this.$login_password = this.$login.find(".game-settings-password input");
        this.$login_submit = this.$login.find(".game-settings-submit button");
        this.$login_errormessages = this.$login.find(".game-settings-errormessages");
        this.$login_register = this.$login.find(".game-settings-option");
        
        this.$register = this.$settings.find(".game-settings-register");
        this.$register_username = this.$register.find(".game-settings-username input");
        this.$register_password = this.$register.find(".game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".game-settings-password-second input");
        this.$register_submit = this.$register.find(".game-settings-submit button");
        this.$register_errormessages = this.$register.find(".game-settings-errormessages");
        this.$register_login = this.$register.find(".game-settings-option");

        this.$acwing_login = this.$settings.find(".game-settings-acwing img");

        this.$login.hide();
        this.$register.hide();

        this.start();
    }

    start() {
        if (this.platform === "web") {
            this.getinfo_web();
            this.add_listening_events();
        } else {
            this.getinfo_acapp();
        }
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();

        let that = this;
        this.$acwing_login.click(function() {
            that.acwing_login();
        })
    }

    add_listening_events_login() {
        let that = this;
        this.$login_register.click(function() {
            that.register();
        });
        this.$login_submit.click(function() {
            that.login_on_remote();
        });
    }

    add_listening_events_register() {
        let that = this;
        this.$register_login.click(function() {
            that.login();
        });
        this.$register_submit.click(function() {
            that.register_on_remote();
        })
    }

    getinfo_web() {
        let that = this;
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: that.platform,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    that.username = resp.username;
                    that.photo = resp.photo;
                    that.hide();
                    that.root.menu.show();
                    console.log(that.username);
                } else {
                    that.login();
                }
            }
        });
    }

    getinfo_acapp() {
        let that = this;
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/oauth/acwing_acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    that.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        })
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let that = this;
        this.root.acos.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                that.username = resp.username,
                that.photo = resp.photo,
                that.hide();
                that.root.menu.show();
                console.log(that.username);
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }

    login() { // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    register() { // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login_on_remote() {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_errormessages.empty();

        let that = this;
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload(); // 刷新
                } else {
                    that.$login_errormessages.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {
        if (this.platform === "acapp") {
            this.root.acos.api.window.close();
        } else {
            let that = this;
            $.ajax({
                url: "https://app6621.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp) {
                    if (resp.result === "success") {
                        location.reload();
                    }
                }
            });
        }
    }

    register_on_remote() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_errormessages.empty();

        let that = this;
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    that.$register_errormessages.html(resp.result);
                }
            }
        })
    }

    acwing_login() {
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/oauth/acwing_web/apply_code",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }
}export class Game {
    constructor(id, acos) {
        this.id = id;
        this.acos = acos;
        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new Menu(this);
        this.playground = new Playground(this);

        this.start();
    }

    start() {
    }
}