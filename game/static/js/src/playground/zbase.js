class Playground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div>playground</div>`);
        this.hide();
        this.root.$game.append(this.$playground);

        this.start();
    }

    start() {

    }

    show() { // 显示 playground 界面
        this.$playground.show();
    }

    hide() { // 隐藏 playground 界面
        this.$playground.hide();
    }
}