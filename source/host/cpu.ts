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
                    public instruction: string = "",
                    public limit: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(processState, isExecuting): void {
          if (processState) {
            this.PC    = processState.pcb.PC;
            this.Acc   = processState.pcb.Acc;
            this.Xreg  = processState.pcb.Xreg;
            this.Yreg  = processState.pcb.Yreg;
            this.Zflag = processState.pcb.Zflag;
            this.instruction = processState.pcb.instruction;
            this.limit = processState.pcb.limit;
          } else {
            this.PC    = 0;
            this.Acc   = 0;
            this.Xreg  = 0;
            this.Yreg  = 0;
            this.Zflag = 0;
            this.instruction = "";
            this.limit = 0;
          }
          if (isExecuting) {
            this.isExecuting = isExecuting;
          } else {
            this.isExecuting = false;
          }
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //Didn't work for testing bounds need to figure out.
            //console.log("PC: " + this.PC)
            var instruction = _MemoryManager.readFromMem(this.PC);
            this.instruction = instruction;
            console.log(instruction);

            this.run(instruction);
            this.updateDisplay(instruction);
            if (_SingleStep){
              this.isExecuting = false;
            }
            _CycleCounter++;
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
            default:console.log("Don't know what to do with this, I'm gonna brake now... " + instruction);
                    _CurrentProcess.state = TERMINATED;
                    _CpuScheduler.contextSwitch();
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
          //console.log("Hunch?");
          _MemoryManager.writeToMem(mem, toBeStored);
          this.PC++;
          this.PC++;

        }

        public addWithCarry(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          //console.log("one");
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
          //console.log("The");
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
          //console.log("This");
          this.Yreg = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          this.PC++;
          this.PC++;

        }

        public noOperation(): void {
          //Welp I think this is ok
        }

        public break(): void {
          this.isExecuting = false;
          _CurrentProcess.pcb.PC = this.PC;
	        _CurrentProcess.pcb.Acc = this.Acc;
	        _CurrentProcess.pcb.Xreg = this.Xreg;
	        _CurrentProcess.pcb.Yreg = this.Yreg;
	        _CurrentProcess.pcb.Zflag = this.Zflag;
          _CurrentProcess.state = TERMINATED;
          //_MemoryManager.locations[_CurrentProcess.pcb.location].active = false;
			    _CpuScheduler.contextSwitch();
          //_MemoryManager.clearMem();
        }

        public compareByteX(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          //console.log("IS");
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
            if (this.PC >= this.limit){
              this.PC -= PROGRAM_SIZE;
            }
          } else {
            this.PC++
          }
        }

        public increment(): void {
          var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.PC));
          var toBeStored = _MemoryManager.translateBytes(_MemoryManager.readFromMem(mem));
          toBeStored += 1;
          //console.log("Hunch");
          _MemoryManager.writeToMem(mem, toBeStored.toString(16));
          this.PC++;
          this.PC++;
        }

        public systemCall(): void {
          if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
                console.log("YReg: " + this.Yreg.toString())
            }
          else if (this.Xreg === 2) {
              var address = this.Yreg
              //var mem = _MemoryManager.translateBytes(_MemoryManager.readFromMem(this.Yreg));
              //console.log(mem);
              var stringChar = _MemoryManager.readFromMem(address);
              //var broken = 0;
              while (stringChar !== "00") {
                  //console.log(address);
                  //console.log(stringChar);
                  _StdOut.putText(String.fromCharCode(_MemoryManager.translateBytes(stringChar)));
                  console.log("YReg: " + this.Yreg.toString())
                  address++;
                  stringChar = _MemoryManager.readFromMem(address);
                  //broken++;
                  //if (broken == 15){
                    //break;
                  //}
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
          //console.log(_CurrentProcess.pcb.Pid + ": " + this.PC.toString());
          //console.log(_CurrentProcess.pcb.Pid + ": " + instruction);
          //console.log(_CurrentProcess.pcb.Pid + ": " + this.Acc.toString());
          //console.log(_CurrentProcess.pcb.Pid + ": " + this.Xreg.toString());
          //console.log(_CurrentProcess.pcb.Pid + ": " + this.Yreg.toString());
          //console.log(_CurrentProcess.pcb.Pid + ": " + this.Zflag.toString());
          _MemoryManager.update();
          _MemoryManager.updateReadyQ();
        }

    }
}
