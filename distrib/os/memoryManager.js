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
            var base;
            var limit;
            console.log(_Memory.base);
            if (_Memory.base === 0) {
                base = _Memory.base;
                limit = base + 255; //code.length;
                this.storeToMem(code);
                _Memory.base = limit + 1;
            }
            else if (_Memory.base === 256) {
                base = _Memory.base;
                limit = base + 255; //code.length;
                this.storeToMem(code);
                _Memory.base = limit + 1;
            }
            else if (_Memory.base === 512) {
                base = _Memory.base;
                limit = base + 255; //code.length;
                this.storeToMem(code);
                _Memory.base = limit + 1;
            }
            else {
                _StdOut.putText("All of the avaliable memory has been allocated please clear memory");
                return;
            }
            //var base = _Memory.base;
            //this.storeToMem(code);
            //var limit = base + 255; //code.length;
            //_Memory.base = limit + 1;
            var pcb = new TSOS.Pcb();
            pcb.base = base;
            pcb.limit = limit;
            pcb.PC = base;
            console.log(base, limit);
            var processState = new TSOS.ProcessState();
            processState.pcb = pcb;
            _ResidentList[pcb.Pid] = processState;
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
            address += _ResidentList[RunningProcess].pcb.base;
            var memId = "mem" + address;
            //document.getElementById(memId).className = "active";
            return _Memory[address];
        };
        MemoryManager.prototype.writeToMem = function (address, data) {
            address += _ResidentList[RunningProcess].pcb.base;
            _Memory[address] = data;
            _Memory.update();
        };
        MemoryManager.prototype.translateBytes = function (hex) {
            return parseInt(hex, 16);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
