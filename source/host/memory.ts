///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
      constructor(public memory = new Array(),
                  public bytes = MAIN_MEMORY,
                  public base = 0
      ){}

      public init(): void {
        for (var x = 0; x < this.bytes; x++){
          this.memory[x] = "00";
        }
        this.base = 0;


        //document.getElementById("memoryMessage").hidden = true;
        var nextRow = "";
        for (var i = 0, len = this.memory.length; i < len; i++) {
            this.memory[i] = "00";
            // Initiate UI
            if (i % 8 === 0) {
                nextRow += "</tr>";
                document.getElementById("divMemory").innerHTML += nextRow;
                nextRow = "<tr><td>0x" + i.toString(16) + "</td>";
            }
            nextRow += "<td id='mem" + i + "'>00</td>";
        }
      }

      public update(): void{
        for (var i = 0, len = this.memory.length; i < len; i++) {
          if (_Memory[i] == undefined) {
            document.getElementById(memId).innerHTML = "00";
          } else {
            var memId = "mem" + i;
            document.getElementById(memId).innerHTML = _Memory[i];
          }
        }
      }

    }
  }
