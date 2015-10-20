///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
      constructor(public memory = new Array(),
                  public bytes = MAIN_MEMORY,
                  public base = 0
      ){}

      public init(): void {
        for (var x = 0; x < this.bytes; x++){
          this.memory[x].push("00");
        }
      }
    }
  }
