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
         var base;
         var limit;
         console.log(_Memory.base);
         if (_Memory.base === 0){
            base = _Memory.base;
            limit = base + 255; //code.length;
            this.storeToMem(code);
            _Memory.base = limit + 1;
         } else if (_Memory.base === 256){
            base = _Memory.base;
            limit = base + 255; //code.length;
            this.storeToMem(code);
            _Memory.base = limit + 1;
         } else if (_Memory.base === 512){
            base = _Memory.base;
            limit = base + 255; //code.length;
            this.storeToMem(code);
            _Memory.base = limit + 1;
         } else {
           _StdOut.putText("All of the avaliable memory has been allocated please clear memory");
           return;
         }
         //var base = _Memory.base;
         //this.storeToMem(code);
         //var limit = base + 255; //code.length;
         //_Memory.base = limit + 1;
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
        var memId = "mem" + address;
        //document.getElementById(memId).className = "active";
        return _Memory[address];
      }

      public writeToMem(address, data): void{
        address += this.storedProcesses[RunningProcess].base
        _Memory[address] = data;
        _Memory.update();
      }

      public translateBytes(hex): number{
        return parseInt(hex, 16);
      }

    /*  public printToScreen(): void{
        var memoryDiv = <HTMLInputElement> document.getElementById("divMemory");
      	var output = "<tbody>";
      	var numDigits = this.getNumberOfDigitsOfBytes();

      	for (var i = 0; i < _Memory.bytes; i++) {
      		// We are going to print rows of 8 columns each
      		if (i % 8 === 0) {
      			output += '</tr><tr><td>' + this.formatHexRowHeader(i, numDigits) + '</td>';
      		}
      		output += '<td data-id="' + i + '"> ' + _Memory.memory[i] + '</td>';
      	}
      	output += "</tbody>";
      	memoryDiv.find('tbody').replaceWith(output);
      };

      public formatHexRowHeader(baseTenNum, numOfDigits): string {
      	var baseSixteenNum = baseTenNum.toString(16).toUpperCase(),
      		paddedNumber = '' + baseSixteenNum;

      	while (paddedNumber.length < numOfDigits) {
      		paddedNumber = '0' + paddedNumber;
      	}
      	return '0x' + paddedNumber;
      };

      public getNumberOfDigitsOfBytes(): number{
      	return ('' + _Memory.bytes.toString(16)).length;
      };*/


    }
}
