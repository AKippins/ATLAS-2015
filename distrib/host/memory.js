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
            var nextRow = "";
            for (var i = 0, len = this.memory.length; i < len; i++) {
                // Initiate UI
                if (i % 8 === 0) {
                    nextRow += "</tr>";
                    document.getElementById("divMemory").innerHTML += nextRow;
                    var pad = '' + i.toString(16);
                    while (pad.length < 3) {
                        pad = '0' + pad;
                    }
                    nextRow = "<tr><td>0x" + pad + "</td>";
                }
                nextRow += "<td id='mem" + i + "'>00</td>";
            }
        };
        Memory.prototype.update = function () {
            for (var i = 0, len = this.memory.length; i < len; i++) {
                var memId = "mem" + i;
                if (_Memory[i] == undefined) {
                }
                else {
                    if (_Memory[i].length < 2) {
                        _Memory[i] = '0' + _Memory[i];
                    }
                    document.getElementById(memId).innerHTML = _Memory[i];
                }
            }
        };
        Memory.prototype.clearMem = function () {
            for (var x = 0; x < this.bytes; x++) {
                this.memory[x] = "00";
            }
            this.base = 0;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
