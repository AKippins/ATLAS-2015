///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessState = (function () {
        function ProcessState(// Hold a program's PCB
            pcb, 
            // Hold a program's current state
            state, 
            // Hold where the program currently resides
            location, priority) {
            if (pcb === void 0) { pcb = null; }
            if (state === void 0) { state = 0; }
            if (location === void 0) { location = null; }
            if (priority === void 0) { priority = 10; }
            this.pcb = pcb;
            this.state = state;
            this.location = location;
            this.priority = priority;
        }
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
        ProcessState.prototype.createDisplayRow = function () {
            return '<tr data-id="proc' + this.pcb.Pid + '" data-state="' + this.state + '">' +
                '<td class="pidDisplayPCB">' + this.pcb.Pid + '</td>' +
                '<td class="pcDisplayPCB">' + this.pcb.PC + '</td>' +
                '<td class="accDisplayPCB">' + this.pcb.Acc + '</td>' +
                '<td class="xRegDisplayPCB">' + this.pcb.Xreg + '</td>' +
                '<td class="yRegDisplayPCB">' + this.pcb.Yreg + '</td>' +
                '<td class="zFlagDisplayPCB">' + this.pcb.Zflag + '</td>' +
                '<td class="">' + this.priority + '</td>' +
                '<td class="processStateDisplay">' + this.stateIntToString(this.state) + '</td></tr>';
        };
        ;
        ProcessState.prototype.stateIntToString = function (stateInt) {
            var state = parseInt(stateInt);
            if (state === NEW) {
                return "New";
            }
            else if (state === READY) {
                return "Ready";
            }
            else if (state === RUNNING) {
                return "Running";
            }
            else if (state === WAITING) {
                return "Waiting";
            }
            else if (state === TERMINATED) {
                return "Terminated";
            }
            return "Invalid State Code";
        };
        ;
        ProcessState.prototype.updatePcbWithCpu = function () {
            this.pcb.PC = _CPU.PC;
            this.pcb.Acc = _CPU.Acc;
            this.pcb.Xreg = _CPU.Xreg;
            this.pcb.Yreg = _CPU.Yreg;
            this.pcb.Zflag = _CPU.Zflag;
        };
        ;
        return ProcessState;
    })();
    TSOS.ProcessState = ProcessState;
})(TSOS || (TSOS = {}));
