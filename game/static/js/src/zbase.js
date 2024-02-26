export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        // this.menu = new Menu(this);
        this.playground = new Playground(this);

        this.start();
    }

    start() {
        
    }
}