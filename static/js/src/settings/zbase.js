class Settings {
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
            if (this.root.access) {
                this.getinfo_web();
                this.refresh_jwt_token();
            } else {
                this.login();
            }
            this.add_listening_events();
        } else {
            this.getinfo_acapp();
        }
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://app6621.acapp.acwing.com.cn/settings/token/refresh/",
                type: "POST",
                data: {
                    refresh: this.root.refresh
                },
                success: resp => {
                    this.root.access = resp.access;
                }
            })
        }, 270000);

        // 查看排行榜，暂时放在这个函数里
        setTimeout(() => {
            $.ajax({
                url: "https://app6621.acapp.acwing.com.cn/settings/ranklist/",
                type: "GET",
                headers: {
                    'Authorization': "Bearer " + this.root.access
                },
                success: resp => {
                    console.log(resp);
                }
            })
        }, 5000);
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
            headers: {
                'Authorization': "Bearer " + that.root.access
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
                that.username = resp.username;
                that.photo = resp.photo;
                that.hide();
                that.root.menu.show();
                that.root.access = resp.access;
                that.root.refresh = resp.refresh;
                that.refresh_jwt_token();
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

    login_on_remote(username, password) {
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_errormessages.empty();

        let that = this;
        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/token/",
            type: "POST",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                that.root.access = resp.access;
                that.root.refresh = resp.refresh;
                that.refresh_jwt_token();
                that.getinfo_web();
            },
            error: () => {
                that.$login_errormessages.html("用户名或密码不正确");
            }
        });
    }

    logout_on_remote() {
        if (this.platform === "acapp") {
            this.root.acos.api.window.close();
        } else {
            this.root.access = "";
            this.root.refresh = "";
            location.href = "/";
        }
    }

    register_on_remote() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_errormessages.empty();

        $.ajax({
            url: "https://app6621.acapp.acwing.com.cn/settings/register/",
            type: "POST",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success: resp => {
                if (resp.result === "success") {
                    this.login_on_remote(username, password);
                } else {
                    this.$register_errormessages.html(resp.result);
                }
            }
        });
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
}