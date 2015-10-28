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
            //document.getElementById("memoryMessage").hidden = true;
            var nextRow = "";
            for (var i = 0, len = this.memory.length; i < len; i++) {
                this.memory[i] = "00";
                // Initiate UI
                if (i % 8 === 0) {
                    nextRow += "</tr>";
                    document.getElementById("divMemory").innerHTML += nextRow;
                    nextRow = "<tr><td>0x" + i.toString(16) + "</td>";
                }
                nextRow += "<td id='mem" + i + "'>00</td>";
            }
        };
        Memory.prototype.update = function () {
            for (var i = 0, len = this.memory.length; i < len; i++) {
                if (_Memory[i] == undefined) {
                    document.getElementById(memId).innerHTML = "00";
                }
                else {
                    var memId = "mem" + i;
                    document.getElementById(memId).innerHTML = _Memory[i];
                }
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
