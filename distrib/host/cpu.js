///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            console.log("PC: " + this.PC);
            console.log("IR: " + instruction);
            console.log("Acc: " + this.Acc);
            console.log("X Reg: " + this.Xreg);
            console.log("Y Reg: " + this.Yreg);
            console.log("Z Flag: " + this.Zflag);
            document.getElementById("pcDisplay").innerHTML = this.PC.toString();
            document.getElementById("accDisplay").innerHTML = this.Acc.toString();
            document.getElementById("xRegDisplay").innerHTML = this.Xreg.toString();
            document.getElementById("yRegDisplay").innerHTML = this.Yreg.toString();
            document.getElementById("zFlagDisplay").innerHTML = this.Zflag.toString();
            var instruction = _MemoryManager.readFromMem(this.PC);
            this.run(instruction);
            if (_SingleStep) {
                this.isExecuting = false;
            }
        };
        Cpu.prototype.run = function (instruction) {
            this.PC++;
            switch (instruction) {
                case "A9":
                    this.loadAccumulatorConstant();
                    break;
                case "AD":
                    this.loadAccumulatorMemory();
                    break;
                case "8D":
                    this.storeAccumulatorMemory();
                    break;
                case "6D":
                    this.addWithCarry();
                    break;
                case "A2":
                    this.loadXConstant();
                    break;
                case "AE":
                    this.loadXMemory();
                    break;
                case "A0":
                    this.loadYConstant();
                    break;
                case "AC":
                    this.loadYMemory();
                    break;
                case "EA":
                    this.noOperation();
                    break;
                case "00":
                    this.break();
                    break;
                case "EC":
                    this.compareByteX();
                    break;
                case "D0":
                    this.branchNotEqual();
                    break;
                case "EE":
                    this.increment();
                    break;
                case "FF":
                    this.systemCall();
                    break;
                default:
                    console.log("Don't know what to do with this, I'm gonna brake now... " + instruction);
                    this.isExecuting = false;
                    break;
            }
        };
        Cpu.prototype.loadAccumulatorConstant = function () {
            this.Acc = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.PC++;
        };
        Cpu.prototype.loadAccumulatorMemory = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.Acc = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.storeAccumulatorMemory = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            var toBeStored = this.Acc.toString(16);
            _MemoryManager.writeToMem(mem, toBeStored);
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.addWithCarry = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.Acc += _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.loadXConstant = function () {
            this.Xreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.PC++;
        };
        Cpu.prototype.loadXMemory = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.Xreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.loadYConstant = function () {
            this.Yreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.PC++;
        };
        Cpu.prototype.loadYMemory = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            this.Yreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.noOperation = function () {
            //Welp I think this is ok
        };
        Cpu.prototype.break = function () {
            this.isExecuting = false;
        };
        Cpu.prototype.compareByteX = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            var compare = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            if (compare === this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.branchNotEqual = function () {
            if (this.Zflag === 0) {
                this.PC += _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC)) + 1;
                if (this.PC > MAIN_MEMORY) {
                    this.PC -= MAIN_MEMORY;
                }
            }
            else {
                this.PC++;
            }
        };
        Cpu.prototype.increment = function () {
            var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
            var toBeStored = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
            toBeStored += 1;
            _MemoryManager.writeToMem(mem, toBeStored.toString(16));
            this.PC++;
            this.PC++;
        };
        Cpu.prototype.systemCall = function () {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                console.log(this.Yreg);
                var address = this.Yreg;
                //var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.Yreg));
                //console.log(mem);
                var stringChar = _MemoryManager.readFromMem(address);
                var broken = 0;
                while (stringChar !== "00") {
                    console.log(address);
                    console.log(stringChar);
                    _StdOut.putText(String.fromCharCode(_MemoryManager.translateBytes(stringChar)));
                    address++;
                    stringChar = _MemoryManager.readFromMem(address);
                    broken++;
                    if (broken == 15) {
                        break;
                    }
                }
            }
            else {
                _StdOut.putText("Xreg is supposed to be either 1 or 2.");
                _CPU.isExecuting = false;
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
