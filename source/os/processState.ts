///<reference path="../globals.ts" />


module TSOS {
    export class ProcessState {
      constructor(// Hold a program's PCB
      	          public pcb: any = null,
      	          // Hold a program's current state
      	          public state: number = 0,
      	          // Hold where the program currently resides
      	          public location: any = null,
      	          public priority: number = 10
                ){}


      /*public printToScreen(): void{
      	var table = $('#divPCB').find('table'),
      		tbody = table.find('tbody'),
      		thisTr = tbody.children('[data-id="' + this.pcb.pid + '"]');

      	if (thisTr.length) {
      		// It is already on the table
      		thisTr.replaceWith(this.createDisplayRow());
      	} else {
      		// We need to add it to the table
      		tbody.append(this.createDisplayRow());
      	}

      	if (this.state === TERMINATED) {
      		thisTr = tbody.children('[data-id="' + this.pcb.pid + '"]');
      		thisTr.hide('fast');
      	}
      };*/

      public createDisplayRow(): string{
      	return '<tr data-id="proc' + this.pcb.Pid + '" data-state="' + this.state +'">' +
      			'<td class="pidDisplayPCB">' + this.pcb.Pid + '</td>' +
      			'<td class="pcDisplayPCB">' + this.pcb.PC + '</td>' +
      			'<td class="accDisplayPCB">' + this.pcb.Acc + '</td>' +
      			'<td class="xRegDisplayPCB">' + this.pcb.Xreg + '</td>' +
      			'<td class="yRegDisplayPCB">' + this.pcb.Yreg + '</td>' +
      			'<td class="zFlagDisplayPCB">' + this.pcb.Zflag + '</td>' +
      			'<td class="">' + this.priority + '</td>'+
      			'<td class="processStateDisplay">' + this.stateIntToString(this.state) + '</td></tr>';
      };

      public stateIntToString(stateInt): string {
      	var state = parseInt(stateInt);
      	if (state === NEW) {
      		return "New";
      	} else if (state === READY) {
      		return "Ready";
      	} else if (state === RUNNING) {
      		return "Running";
      	} else if (state === WAITING) {
      		return "Waiting";
      	} else if (state === TERMINATED) {
      		return "Terminated";
      	}
      	return "Invalid State Code";
      };

      public updatePcbWithCpu(): void {
      	this.pcb.PC = _CPU.PC;
      	this.pcb.Acc = _CPU.Acc;
      	this.pcb.Xreg = _CPU.Xreg;
      	this.pcb.Yreg = _CPU.Yreg;
      	this.pcb.Zflag = _CPU.Zflag;
        this.pcb.instruction = _CPU.instruction;
        this.pcb.limit = _CPU.limit;
      };

      public processSwapName() {
      	return 'swap' + this.pcb.Pid;
      };
    }
  }
