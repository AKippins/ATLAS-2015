module TSOS {
    export class ProcessState {
      constructor(// Hold a program's PCB
      	          public pcb: any = null,
      	          // Hold a program's current state
      	          public state: number = 0,
      	          // Hold where the program currently resides
      	          public location: any = null,
      	          // Hold the program's priority, only used in priority scheduling,
      	          // but a default value of 10 is given here
      	          public priority: number = 10
                ){}

      // Define some constants for the possible states
      public NEW: number = 0;
      public READY: number = 1;
      public RUNNING: number = 2;
      public WAITING: number = 3;
      public TERMINATED: number = 4;


      public printToScreen(): void{
      	/*var table = $('#readyQueueDisplay').find('table'),
      		tbody = table.find('tbody'),
      		thisTr = tbody.children('[data-id="proc' + this.pcb.pid + '"]');*/

        console.log(document.getElementById("proc" + this.pcb.pid));
      	if (document.getElementById("proc" + this.pcb.pid) != null) {
      		// It is already on the table
          document.getElementById("proc" + this.pcb.pid).style.display = "none";
          document.getElementById("divPCB").innerHTML += this.createDisplayRow();
      	} else {
      		// We need to add it to the table
      		document.getElementById("divPCB").innerHTML += this.createDisplayRow();
      	}

      	if (this.state === this.TERMINATED) {
      		document.getElementById("proc" + this.pcb.pid).style.display = "none";
      	}
      };

      public createDisplayRow(): string{
      	return '<tr data-id="proc' + this.pcb.pid + '" data-state="' + this.state +'">' +
      			'<td class="pidDisplayPCB">' + this.pcb.pid + '</td>' +
      			'<td class="pcDisplayPCB">' + this.pcb.pc + '</td>' +
      			'<td class="accDisplayPCB">' + this.pcb.acc + '</td>' +
      			'<td class="xRegDisplayPCB">' + this.pcb.xReg + '</td>' +
      			'<td class="yRegDisplayPCB">' + this.pcb.yReg + '</td>' +
      			'<td class="zFlagDisplayPCB">' + this.pcb.zFlag + '</td>' +
      			'<td class="">' + this.priority + '</td>'+
      			'<td class="processStateDisplay">' + this.stateIntToString(this.state) + '</td></tr>';
      };

      public stateIntToString(stateInt): string {
      	var state = parseInt(stateInt);
      	if (state === this.NEW) {
      		return "New";
      	} else if (state === this.READY) {
      		return "Ready";
      	} else if (state === this.RUNNING) {
      		return "Running";
      	} else if (state === this.WAITING) {
      		return "Waiting";
      	} else if (state === this.TERMINATED) {
      		return "Terminated";
      	}
      	return "Invalid State Code";
      };
    }
  }
