class NoticeBoard extends GameObject {
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
}