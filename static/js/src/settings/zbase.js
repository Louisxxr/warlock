class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "web";
        if (this.root.acos) {
            this.platform = "acapp";
        }

        this.start();
    }

    start() {
        this.getinfo();
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
                console.log(resp);
                if (resp.result === "success") {
                    that.hide();
                    that.root.menu.show();
                } else {
                    that.login();
                }
            }
        });
    }

    hide() {
    }

    show() {
    }

    login() { // 打开登录界面
    }

    register() { // 打开注册界面
    }
}