var TSOS;
(function (TSOS) {
    var ProcessState = (function () {
        function ProcessState(// Hold a program's PCB
            pcb, 
            // Hold a program's current state
            state, 
            // Hold where the program currently resides
            location, 
            // Hold the program's priority, only used in priority scheduling,
            // but a default value of 10 is given here
            priority) {
            if (pcb === void 0) { pcb = null; }
            if (state === void 0) { state = 0; }
            if (location === void 0) { location = null; }
            if (priority === void 0) { priority = 10; }
            this.pcb = pcb;
            this.state = state;
            this.location = location;
            this.priority = priority;
            // Define some constants for the possible states
            this.NEW = 0;
            this.READY = 1;
            this.RUNNING = 2;
            this.WAITING = 3;
            this.TERMINATED = 4;
        }
        ProcessState.prototype.printToScreen = function () {
            /*var table = $('#readyQueueDisplay').find('table'),
                tbody = table.find('tbody'),
                thisTr = tbody.children('[data-id="proc' + this.pcb.pid + '"]');*/
            if (document.getElementById(("proc" + this.pcb.pid))) {
                // It is already on the table
                document.getElementById("proc" + this.pcb.pid).style.display = "none";
                document.getElementById("divPCB").innerHTML += this.createDisplayRow();
            }
            else {
                // We need to add it to the table
                document.getElementById("divPCB").innerHTML += this.createDisplayRow();
            }
            if (this.state === this.TERMINATED) {
                document.getElementById("proc" + this.pcb.pid).style.display = "none";
            }
        };
        ;
        ProcessState.prototype.createDisplayRow = function () {
            return '<tr data-id="proc' + this.pcb.pid + '" data-state="' + this.state + '">' +
                '<td class="pidDisplayPCB">' + this.pcb.pid + '</td>' +
                '<td class="pcDisplayPCB">' + this.pcb.pc + '</td>' +
                '<td class="accDisplayPCB">' + this.pcb.acc + '</td>' +
                '<td class="xRegDisplayPCB">' + this.pcb.xReg + '</td>' +
                '<td class="yRegDisplayPCB">' + this.pcb.yReg + '</td>' +
                '<td class="zFlagDisplayPCB">' + this.pcb.zFlag + '</td>' +
                '<td class="">' + this.priority + '</td>' +
                '<td class="processStateDisplay">' + this.stateIntToString(this.state) + '</td></tr>';
        };
        ;
        ProcessState.prototype.stateIntToString = function (stateInt) {
            var state = parseInt(stateInt);
            if (state === this.NEW) {
                return "New";
            }
            else if (state === this.READY) {
                return "Ready";
            }
            else if (state === this.RUNNING) {
                return "Running";
            }
            else if (state === this.WAITING) {
                return "Waiting";
            }
            else if (state === this.TERMINATED) {
                return "Terminated";
            }
            return "Invalid State Code";
        };
        ;
        return ProcessState;
    })();
    TSOS.ProcessState = ProcessState;
})(TSOS || (TSOS = {}));
