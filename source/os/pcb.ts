///<reference path="../globals.ts" />

module TSOS {
    export class Pcb {
      constructor(public Pid: number = PID++,
                  //need to keep track of the values of the running process
                  public PC: number = 0,
                  public Acc: number = 0,
                  public Xreg: number = 0,
                  public Yreg: number = 0,
                  public Zflag: number = 0,
                  public instruction: string = "",
                  //dont think that i need this
                  public isExecuting: boolean = false,
                  public base: number = 0,
                  public limit: number = 0,
                  public location: number = null
                ){}

      public init(): void{

      }

      public updateDisplay(instruction): void{
        //document.getElementById("pcDisplayPCB").innerHTML = this.PC.toString();
        //document.getElementById("irDisplayPCB").innerHTML = instruction;
        //document.getElementById("accDisplayPCB").innerHTML = this.Acc.toString();
        //document.getElementById("xRegDisplayPCB").innerHTML = this.Xreg.toString();
        //document.getElementById("yRegDisplayPCB").innerHTML = this.Yreg.toString();
        //document.getElementById("zFlagDisplayPCB").innerHTML = this.Zflag.toString();
      }
    }
  }
