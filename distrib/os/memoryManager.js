///<reference path="../globals.ts" />
/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(storedProcesses) {
            if (storedProcesses === void 0) { storedProcesses = new Array(); }
            this.storedProcesses = storedProcesses;
        }
        MemoryManager.prototype.init = function () {
        };
        MemoryManager.prototype.load = function (code) {
            var base = _Memory.base;
            this.storeToMem(code);
            var limit = base + code.length;
            _Memory.base = limit;
            var pcb = new TSOS.Pcb();
            pcb.base = base;
            pcb.limit = limit;
            this.storedProcesses[pcb.Pid] = pcb;
            pcb.Pid++;
            PID = pcb.Pid;
            return pcb.Pid - 1;
        };
        MemoryManager.prototype.storeToMem = function (code) {
            for (var x = 0; x < code.length / 2; x++) {
                var pos = x * 2;
                _Memory[x + _Memory.base] = code.substring(pos, pos + 2);
            }
        };
        MemoryManager.prototype.readFromMem = function (address) {
            address += this.storedProcesses[RunningProcess].base;
            return _Memory[address];
        };
        MemoryManager.prototype.writeToMem = function (address, data) {
            address += this.storedProcesses[RunningProcess].base;
            _Memory[address] = data;
        };
        MemoryManager.prototype.translateBytes = function (hex) {
            return parseInt(hex, 16);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
