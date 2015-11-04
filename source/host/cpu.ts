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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public limit: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var instruction = _MemoryManager.readFromMem(this.PC);
            this.updateDisplay(instruction);
            this.run(instruction);
            if (_SingleStep){
              this.isExecuting = false;
            }
        }

        public run(instruction): void {
          this.PC++;
          switch (instruction){
            case "A9": this.loadAccumulatorConstant();
              break;
            case "AD": this.loadAccumulatorMemory();
              break;
            case "8D": this.storeAccumulatorMemory();
              break;
            case "6D": this.addWithCarry();
              break;
            case "A2": this.loadXConstant();
              break;
            case "AE": this.loadXMemory();
              break;
            case "A0": this.loadYConstant();
              break;
            case "AC": this.loadYMemory();
              break;
            case "EA": this.noOperation();
              break;
            case "00": this.break();
              break;
            case "EC": this.compareByteX();
              break;
            case "D0": this.branchNotEqual();
              break;
            case "EE": this.increment();
              break;
            case "FF": this.systemCall();
              break;
            default:console.log("Don't know what to do with this, I'm gonna brake now... " + instruction)
                    this.isExecuting = false
              break;
          }
        }

        public loadAccumulatorConstant(): void {
          this.Acc = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.PC++;
        }

        public loadAccumulatorMemory(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.Acc = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          this.PC++;
          this.PC++;

        }

        public storeAccumulatorMemory(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          var toBeStored = this.Acc.toString(16);
          _MemoryManager.writeToMem(mem, toBeStored);
          this.PC++;
          this.PC++;

        }

        public addWithCarry(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.Acc += _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          this.PC++;
          this.PC++;

        }

        public loadXConstant(): void {
          this.Xreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.PC++;
        }

        public loadXMemory(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.Xreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          this.PC++;
          this.PC++;

        }

        public loadYConstant(): void {
          this.Yreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.PC++;
        }

        public loadYMemory(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          this.Yreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          this.PC++;
          this.PC++;

        }

        public noOperation(): void {
          //Welp I think this is ok
        }

        public break(): void {
          this.isExecuting = false;
          _Memory.init();
          _Console.advanceLine();
          _OsShell.putPrompt();
        }

        public compareByteX(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          var compare = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          if (compare === this.Xreg){
            this.Zflag = 1;
          } else {
            this.Zflag = 0;
          }
          this.PC++;
          this.PC++;
        }

        public branchNotEqual(): void {
          if (this.Zflag === 0){
            this.PC += _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC)) + 1;
            if (this.PC > this.limit){
              this.PC -= 256;
            }
          } else {
            this.PC++
          }
        }

        public increment(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          var toBeStored = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          toBeStored += 1;
          _MemoryManager.writeToMem(mem, toBeStored.toString(16));
          this.PC++;
          this.PC++;
        }

        public systemCall(): void {
          if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
          else if (this.Xreg === 2) {
              console.log(this.Yreg);
              var address = this.Yreg
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
                  if (broken == 15){
                    break;
                  }
              }
          }
          else {
              _StdOut.putText("Xreg is supposed to be either 1 or 2.");
              _CPU.isExecuting = false;
          }
        }

        public updateDisplay(instruction): void{
          document.getElementById("pcDisplay").innerHTML = this.PC.toString();
          document.getElementById("irDisplay").innerHTML = instruction;
          document.getElementById("accDisplay").innerHTML = this.Acc.toString();
          document.getElementById("xRegDisplay").innerHTML = this.Xreg.toString();
          document.getElementById("yRegDisplay").innerHTML = this.Yreg.toString();
          document.getElementById("zFlagDisplay").innerHTML = this.Zflag.toString();
          document.getElementById("pcDisplayPCB").innerHTML = this.PC.toString();
          document.getElementById("irDisplayPCB").innerHTML = instruction;
          document.getElementById("accDisplayPCB").innerHTML = this.Acc.toString();
          document.getElementById("xRegDisplayPCB").innerHTML = this.Xreg.toString();
          document.getElementById("yRegDisplayPCB").innerHTML = this.Yreg.toString();
          document.getElementById("zFlagDisplayPCB").innerHTML = this.Zflag.toString();

        }

    }
}
