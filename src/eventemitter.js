class EventEmitter {
    constructor() {
        this.triggers = {};
    }

    on(event, callback) {
        if (!this.triggers[event])
            this.triggers[event] = [];
        this.triggers[event].push(callback);
        return this;
    }

    off(event, callback) {
        if (!this.triggers[event])
            return;
        let index = this.triggers[event].indexOf(callback);
        if (index < 0)
            return;
        this.triggers[event].splice(index, 1);
        return this;
    }

    emit(event, params) {
        if (this.triggers[event]) {
            for (let i in this.triggers[event])
                this.triggers[event][i](params);
        }
    }
};