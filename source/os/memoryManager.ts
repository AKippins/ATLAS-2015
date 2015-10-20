///<reference path="../globals.ts" />
/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */

 module TSOS {
     export class MemoryManager {
       constructor(public storedProcesses = new Array()){}

       public init(): void {

       }

       public load(code): number{
         var base = _Memory.base;
         this.storeToMem(code);
         var limit = base + code.length;
         _Memory.base = limit;
         var pcb = new Pcb();
         pcb.base = base;
         pcb.limit = limit;
         this.storedProcesses[pcb.Pid] = pcb;
         pcb.Pid++;
         PID = pcb.Pid
         return pcb.Pid - 1;
       }

       public storeToMem(code): void{
        for (var x = 0; x < code.length / 2; x++){
          var pos = x * 2;
          _Memory[x + _Memory.base] = code.substring(pos, pos + 2);
        }
      }

      public readFromMem(address): any{
        address += this.storedProcesses[RunningProcess].base
        return _Memory[address];
      }

      public writeToMem(address, data): void{
        address += this.storedProcesses[RunningProcess].base
        _Memory[address] = data;
      }

      public translateBytes(hex): number{
        return parseInt(hex, 16);
      }


    }
}
