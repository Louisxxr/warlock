class GameMap extends GameObject {
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
}