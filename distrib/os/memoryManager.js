///<reference path="../globals.ts" />
/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(memory, locations, storedProcesses) {
            if (memory === void 0) { memory = new TSOS.Memory(); }
            if (locations === void 0) { locations = new Array(NUM_OF_PROG); }
            if (storedProcesses === void 0) { storedProcesses = new Array(); }
            this.memory = memory;
            this.locations = locations;
            this.storedProcesses = storedProcesses;
        }
        MemoryManager.prototype.init = function () {
            for (var i = 0; i < this.locations.length; i++) {
                this.locations[i] = {
                    active: false,
                    base: i * PROGRAM_SIZE,
                    limit: ((i + 1) * PROGRAM_SIZE) - 1
                };
            }
            this.memory.init();
            // Print out the memory array to the screen
            //this.printToScreen();
        };
        MemoryManager.prototype.load = function (code, priority) {
            var programLocation = this.getOpenProgramLocation();
            console.log(programLocation);
            // Create a new PCB
            var thisPcb = new TSOS.Pcb();
            // Set the base and limit of the program in the PCB
            // To determine base, we will add 1 to the programLocation to handle the
            // 0-indexed nature of arrays, multiply it by the program size, then subtract
            // the program size.
            thisPcb.base = ((programLocation + 1) * PROGRAM_SIZE) - PROGRAM_SIZE;
            // To determine limit, we will add 1 to the programLocation to handle the
            // 0-indexed nature of arrays, multiply it by the program size, then subtract
            // 1 to handle the 0-indexed nature of arrays.
            thisPcb.limit = ((programLocation + 1) * PROGRAM_SIZE) - 1;
            thisPcb.location = programLocation;
            // Make a new ProcessState instance and put it on the ResidentList
            var newProcessState = new TSOS.ProcessState();
            newProcessState.pcb = thisPcb;
            newProcessState.location = INMEMORY;
            newProcessState.priority = priority;
            _ResidentList[thisPcb.Pid] = newProcessState;
            // Actually load the program into memory
            this.storeToMem(code, programLocation);
            this.update();
            // Return the pid
            return thisPcb.Pid;
            /*var base;
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
            pcb.PC = base;
            console.log(base, limit);
            var processState = new ProcessState();
            processState.pcb = pcb;
            _ResidentList[pcb.Pid] = processState;
            pcb.Pid++;
            PID = pcb.Pid
            return pcb.Pid - 1;*/
        };
        MemoryManager.prototype.storeToMem = function (code, location) {
            var splitCode = code.split(' ');
            //console.log(splitCode);
            var offset = location * PROGRAM_SIZE;
            this.clearMem(location);
            for (var x = 0; x < splitCode.length; x++) {
                //console.log(splitCode[x].toUpperCase());
                this.memory.memory[x + offset] = splitCode[x].toUpperCase();
            }
            this.locations[location].active = true;
        };
        MemoryManager.prototype.readFromMem = function (address) {
            address += _ResidentList[RunningProcess].pcb.base;
            var memId = "mem" + address;
            //document.getElementById(memId).className = "active";
            return this.memory.memory[address];
            //address = address + _CurrentProcess.pcb.base
            /*if (address >= _CurrentProgram.pcb.limit ||
              address < _CurrentProgram.pcb.base) {
              _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, {address : address}));
            }*/
            //return this.memory.memory[address];
        };
        MemoryManager.prototype.writeToMem = function (address, data) {
            address = address + _CurrentProcess.pcb.base;
            /*if (data.length < 2) {
              data = ('00' + data).slice(-2);
            }*/
            this.memory.memory[address] = data.toUpperCase();
            //_Memory.update();
        };
        MemoryManager.prototype.translateBytes = function (hex) {
            return parseInt(hex, 16);
        };
        MemoryManager.prototype.getOpenProgramLocation = function () {
            for (var i = 0; i < this.locations.length; i++) {
                if (this.locations[i].active === false) {
                    return i;
                }
            }
            return null;
        };
        MemoryManager.prototype.update = function () {
            for (var i = 0, len = this.memory.memory.length - 1; i < len; i++) {
                var memId = "mem" + i;
                if (this.memory.memory[i] == undefined) {
                }
                else {
                    if (this.memory.memory[i].length < 2) {
                        this.memory.memory[i] = '0' + this.memory.memory[i];
                    }
                    document.getElementById(memId).innerHTML = this.memory.memory[i];
                }
            }
        };
        MemoryManager.prototype.clearMem = function (location) {
            console.log(location);
            if (location == "all") {
                for (var x = 0; x < MAIN_MEMORY; x++) {
                    this.memory.memory[x] = "00";
                }
                for (var i = 0; i < 3; i++) {
                    this.locations[i].active = false;
                }
            }
            else {
                var offset = location * PROGRAM_SIZE;
                for (var x = 0; x < PROGRAM_SIZE; x++) {
                    this.memory.memory[x + offset] = "00";
                }
                this.locations[location].active = false;
            }
            this.update();
        };
        MemoryManager.prototype.remFromResident = function (pid) {
            var removed = false;
            // Find the element in the ResidentList with the given pid
            for (var i = 0; i < _ResidentList.length; i++) {
                if (_ResidentList[i] && _ResidentList[i].pcb.pid === pid) {
                    var location = 0;
                    for (var i = 0; i < this.locations.length; i++) {
                        if (this.locations[i].base === _ResidentList[i].pcb.base) {
                            location = i;
                        }
                    }
                    if (location === -1) {
                    }
                    else {
                        // Mark the location in memory as available
                        this.locations[location].active = false;
                    }
                    // Remove it from the ResidentList
                    _ResidentList.splice(i, 1);
                    removed = true;
                }
            }
            return removed;
        };
        MemoryManager.prototype.updateReadyQ = function () {
            var output = "";
            if (_CurrentProcess !== null && _CurrentProcess !== undefined) {
                output = "<tr>";
                output += "<td> " + _CurrentProcess.pcb.Pid + "</td>";
                output += "<td> " + _CurrentProcess.pcb.PC + "</td>";
                output += "<td> " + _CurrentProcess.pcb.IR + "</td>";
                output += "<td> " + _CurrentProcess.pcb.Acc + "</td>";
                output += "<td> " + _CurrentProcess.pcb.Xreg + "</td>";
                output += "<td> " + _CurrentProcess.pcb.Yreg + "</td>";
                output += "<td> " + _CurrentProcess.pcb.Zflag + "</td>";
                output += "<td> " + _CurrentProcess.pcb.base + "</td>";
                output += "<td> " + _CurrentProcess.pcb.limit + "</td>";
                output += "<td> " + _CurrentProcess.pcb.priority + "</td>";
                output += "</tr>";
            }
            for (var i = 0; i < _ReadyQueue.length; i++) {
                output += "<tr>";
                output += "<td> " + _ReadyQueue[i].pcb.Pid + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.PC + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.IR + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.Acc + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.Xreg + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.Yreg + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.Zflag + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.base + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.limit + "</td>";
                output += "<td> " + _ReadyQueue[i].pcb.priority + "</td>";
                output += "</tr>";
            }
            document.getElementById("divPCB").innerHTML = output;
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
