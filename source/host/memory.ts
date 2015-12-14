///<reference path="../globals.ts" />


module TSOS {
    export class Memory {
      constructor(public memory = new Array(),
                  public bytes = MAIN_MEMORY,
                  public base = 0
      ){}

      public init(): void {
        //console.log("Blat");
        for (var x = 0; x <= this.bytes; x++){
          this.memory[x] = "00";
        }
        //console.log(MAIN_MEMORY);
        //console.log(this.memory[767]);
        this.base = 0;
        var nextRow = "";
        for (var i = 0, len = this.bytes; i <= len; i++) {
            // Initiate UI
            if (i % 8 === 0) {
                nextRow += "</tr>";
                document.getElementById("divMemory").innerHTML += nextRow;
                var pad = '' + i.toString(16);

              	while (pad.length < 3) {
              		pad = '0' + pad;
              	}
                nextRow = "<tr><td>0x" + pad + "</td>";
            }
            nextRow += "<td id='mem" + i + "'>00</td>";
        }
      }
    }
  }
