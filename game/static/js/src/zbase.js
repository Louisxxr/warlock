export class Game {
    constructor(id, acos, access, refresh) {
        this.id = id;
        this.acos = acos;
        this.access = access;
        this.refresh = refresh;
        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new Menu(this);
        this.playground = new Playground(this);

        if (!acos) {
            document.oncontextmenu = function() {
                return false;
            }
        }

        this.start();
    }

    start() {
    }
}