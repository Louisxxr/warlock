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
}