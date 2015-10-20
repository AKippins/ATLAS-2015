///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(memory, bytes, base) {
            if (memory === void 0) { memory = new Array(); }
            if (bytes === void 0) { bytes = MAIN_MEMORY; }
            if (base === void 0) { base = 0; }
            this.memory = memory;
            this.bytes = bytes;
            this.base = base;
        }
        Memory.prototype.init = function () {
            for (var x = 0; x < this.bytes; x++) {
                this.memory[x] = "00";
            }
            this.base = 0;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
