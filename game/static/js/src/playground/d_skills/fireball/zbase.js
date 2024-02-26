class FireBall extends GameObject {
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
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_dist < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.speed * this.time_diff / 1000, this.move_dist);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_dist -= moved;
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
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
        this.destroy(); // fireball 消失
    }

    render() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    }
}