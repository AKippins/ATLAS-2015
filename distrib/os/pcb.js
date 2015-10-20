///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(Pid, 
            //need to keep track of the values of the running process
            PC, Acc, Xreg, Yreg, Zflag, 
            //dont think that i need this
            isExecuting, base, limit) {
            if (Pid === void 0) { Pid = PID++; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.Pid = Pid;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.base = base;
            this.limit = limit;
        }
        Pcb.prototype.init = function () {
        };
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
