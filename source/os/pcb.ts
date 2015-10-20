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
                  //dont think that i need this
                  public isExecuting: boolean = false,
                  public base: number = 0,
                  public limit: number = 0
                ){}

      public init(): void{

      }
    }
  }
