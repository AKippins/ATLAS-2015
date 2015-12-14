///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(Pid, 
            //need to keep track of the values of the running process
            PC, Acc, Xreg, Yreg, Zflag, instruction, 
            //dont think that i need this
            isExecuting, base, limit, location) {
            if (Pid === void 0) { Pid = PID++; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = ""; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (location === void 0) { location = null; }
            this.Pid = Pid;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.isExecuting = isExecuting;
            this.base = base;
            this.limit = limit;
            this.location = location;
        }
        Pcb.prototype.init = function () {
        };
        Pcb.prototype.updateDisplay = function (instruction) {
            //document.getElementById("pcDisplayPCB").innerHTML = this.PC.toString();
            //document.getElementById("irDisplayPCB").innerHTML = instruction;
            //document.getElementById("accDisplayPCB").innerHTML = this.Acc.toString();
            //document.getElementById("xRegDisplayPCB").innerHTML = this.Xreg.toString();
            //document.getElementById("yRegDisplayPCB").innerHTML = this.Yreg.toString();
            //document.getElementById("zFlagDisplayPCB").innerHTML = this.Zflag.toString();
        };
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
