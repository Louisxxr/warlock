class GamePlayer extends GameObject {
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

        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.protection_time = 0;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
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
            const rect = that.context.canvas.getBoundingClientRect();
            if (e.which === 3) {
                that.move_to((e.clientX - rect.left) / that.playground.scale, (e.clientY - rect.top) / that.playground.scale);
            } else if (e.which === 1) {
                if (that.holding_skill === "fireball") {
                    that.shoot_fireball((e.clientX - rect.left) / that.playground.scale, (e.clientY - rect.top) / that.playground.scale);
                }
                that.holding_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) { // Q 键
                that.holding_skill = "fireball";
                // return false;
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
        new FireBall(this.playground, this, x, y, radius, color, speed, move_dist, vx, vy, damage);
    }

    update() {
        this.update_move();
        this.render();
    }

    update_move() {
        this.protection_time += this.time_diff / 1000;
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
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}