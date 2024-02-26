class Particle extends GameObject {
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
        this.eps = 1;
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
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    }
}