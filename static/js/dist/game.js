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
            that.root.playground.show();
        });
        this.$multi_mode.click(function() {
            console.log("multi_mode");
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
        this.$canvas = $(`<canvas></canvas>`);
        this.context = this.$canvas[0].getContext('2d');
        this.context.canvas.height = this.playground.height;
        this.context.canvas.width = this.playground.width;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.on("contextmenu", function() {
            return false;
        });
    }

    update() {
        this.render();
    }

    render() {
        this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height, 0.2 * this.height, true);
    }
}class GamePlayer extends GameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.context = this.playground.map.context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed; // 1 秒移动的距离
        this.is_me = is_me;
        this.move_dist = 0;
        this.vx = 0;
        this.vy = 0;
        this.eps = 0.1;

        this.holding_skill = null;

        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.protection_time = 0;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let that = this;
        this.playground.map.$canvas.mousedown(function(e) {
            const rect = that.context.canvas.getBoundingClientRect();
            if (e.which === 3) {
                that.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (that.holding_skill === "fireball") {
                    that.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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
        let radius = 0.01 * this.playground.height;
        let color = "orange";
        let speed = 0.6 * this.playground.height;
        let move_dist = 1 * this.playground.height;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let damage = 0.01 * this.playground.height; // 每次击中造成 20% 伤害
        new FireBall(this.playground, this, x, y, radius, color, speed, move_dist, vx, vy, damage);
    }

    update() {
        this.protection_time += this.time_diff / 1000;
        if (!this.is_me && this.protection_time > 4 && Math.random() < 1 / 300.0) {
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
            if (this.move_dist < 10) {
                this.move_dist = 0;
                this.vx = 0;
                this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.speed * this.time_diff / 1000, this.move_dist);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_dist -= moved;
            }
        }

        this.render();
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
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 75;
        this.speed *= 0.8;
    }

    render() {
        if (this.is_me) {
            this.context.save();
            this.context.beginPath();
            this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            this.context.stroke();
            this.context.clip();
            this.context.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.context.restore();
        } else {
            this.context.beginPath();
            this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
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
}class Playground {
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
        this.getinfo();
        this.add_listening_events();
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

    getinfo() {
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
                } else {
                    that.login();
                }
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
            return false;
        }

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