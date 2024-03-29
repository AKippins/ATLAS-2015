///<reference path="../globals.ts" />
/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */

 module TSOS {
     export class MemoryManager {
       constructor(public memory = new Memory(),
                   public locations = new Array(NUM_OF_PROG),
                   public storedProcesses = new Array()
       ){}

       public init(): void {
         for (var i = 0; i < this.locations.length; i++) {
        		this.locations[i] = {
        			active: false,
        			base: i * PROGRAM_SIZE,
        			limit: ((i + 1) * PROGRAM_SIZE) - 1,
        		};
        	}
          this.memory.init();
        	// Print out the memory array to the screen
        	//this.printToScreen();
       }

       public load(code, priority): number{
          var programLocation = this.getOpenProgramLocation();
        	if (programLocation === null) {
        		var newProcessState = new ProcessState();
        		newProcessState.pcb = new Pcb();
        		var newFile = _krnFileSystemDriver.createFile(newProcessState.processSwapName());
        		if (newFile.status === 'error') {
        			_StdIn.putText('No available program locations in memory nor in the file system');
        			return null;
        		}
        		var writeToFs = _krnFileSystemDriver.writeFile(newProcessState.processSwapName(), code);
        		if (writeToFs.status === 'error') {
        			_StdIn.putText(writeToFs.message);
        			return null;
        		}
        		newProcessState.location = INFILESYSTEM;
        		newProcessState.priority = priority;
        		_ResidentList[newProcessState.pcb.Pid] = newProcessState;
        		return newProcessState.pcb.Pid;
        	} else {
           console.log(programLocation);
        	 var thisPcb = new Pcb();

        	 thisPcb.base = ((programLocation + 1) * PROGRAM_SIZE) - PROGRAM_SIZE;

        	 thisPcb.limit = ((programLocation + 1) * PROGRAM_SIZE) - 1;
           thisPcb.location = programLocation;

        	 var newProcessState = new ProcessState();
        	 newProcessState.pcb = thisPcb;
        	 newProcessState.location = INMEMORY;
        	 newProcessState.priority = priority;
        	 _ResidentList[thisPcb.Pid] = newProcessState;
        	 this.storeToMem(code, programLocation);
           this.update();
        	 return thisPcb.Pid;
         }




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
       }

       public storeToMem(code, location): void{
        var splitCode = code.split(' ');
        //console.log(splitCode);
        var offset = location * PROGRAM_SIZE;
        this.clearMem(location);

        for (var x = 0; x < splitCode.length; x++){
          //console.log(splitCode[x].toUpperCase());
          this.memory.memory[x + offset] = splitCode[x].toUpperCase();
        }
        this.locations[location].active = true;
      }

      public readFromMem(address): any{
        address += _ResidentList[RunningProcess].pcb.base
        var memId = "mem" + address;
        return this.memory.memory[address];
      }

      public writeToMem(address, data): void{
        address = address + _CurrentProcess.pcb.base

        this.memory.memory[address] = data.toUpperCase();
        this.update();
      }

      public translateBytes(hex): number{
        return parseInt(hex, 16);
      }

      public getOpenProgramLocation(): number{
      	for (var i = 0; i < this.locations.length; i++) {
      		if (this.locations[i].active === false) {
      			return i;
      		}
      	}
      	return null;
      }

      public update(): void{
        for (var i = 0, len = this.memory.memory.length - 1; i < len; i++) {
          var memId = "mem" + i;
          if (this.memory.memory[i] == undefined) {
            //console.log("???");
            //document.getElementById(memId).innerHTML = "00";
          } else {
            if (this.memory.memory[i].length < 2){
              this.memory.memory[i] = '0' + this.memory.memory[i]
            }
            document.getElementById(memId).innerHTML = this.memory.memory[i];
          }
        }
      }

      public clearMem(location): void{
        console.log(location);
        if (location == "all"){
          for (var x = 0; x < MAIN_MEMORY; x++){
            this.memory.memory[x] = "00";
          }
          for (var i = 0; i < 3; i++){
            this.locations[i].active = false;
          }
        } else {
          var offset = location * PROGRAM_SIZE;
          for (var x = 0; x < PROGRAM_SIZE; x++){
            this.memory.memory[x + offset] = "00";
          }
          this.locations[location].active = false;
        }
        this.update();
      }

      public remFromResident(pid): boolean{
        var removed = false;
        for (var i = 0; i < _ResidentList.length; i++) {
          if (_ResidentList[i] && _ResidentList[i].pcb.Pid === pid) {
            var location = 0;
            for (var i = 0; i < this.locations.length; i++) {
              if (this.locations[i].base === _ResidentList[i].pcb.base) {
                location = i;
              }
            }
            if (location === -1) {
              _krnFileSystemDriver.deleteFile(_ResidentList[i].processSwapName(), true);
            } else {
              this.locations[location].active = false;
            }
            _ResidentList.splice(i, 1);
            removed = true;
          }
        }
        return removed;
      }

      public updateReadyQ(): void{
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
      }

      public rollOut(program) {
      	_Kernel.krnTrace('Rolling out PID ' + program.pcb.Pid);
      	var createFile = _krnFileSystemDriver.createFile(program.processSwapName());
      	if (createFile.status === 'error') {
      		return false;
      	}
      	var locationInMemory = 0;
        for (var i = 0; i < this.locations.length; i++) {
          if (this.locations[i].base === _ResidentList[i].pcb.base) {
            locationInMemory = i;
          }
        }
      	if (locationInMemory === -1) {
      		return false;
      	}
      	var writeFile = _krnFileSystemDriver.writeFile(program.processSwapName(), this.readProgramAtLocation(locationInMemory));
      	if (writeFile.status === 'error') {
      		return false;
      	}
      	this.locations[locationInMemory].active = false;
      	program.pcb.base = -1;
      	program.pcb.limit = -1;
      	program.location = INFILESYSTEM;
      	this.update();
      	return true;
      }

      public rollIn(program) {
      	_Kernel.krnTrace('Rolling in PID ' + program.pcb.Pid + ' from file system');
      	var programLocation = this.getOpenProgramLocation();
      	if (programLocation === null) {
      		return false;
      	}
      	var fileFromDisk = _krnFileSystemDriver.readFile(program.processSwapName());
      	if (fileFromDisk.status === 'error') {
      		return false;
      	}
      	this.storeToMem(fileFromDisk.data, programLocation);
      	var deleteFromDisk = _krnFileSystemDriver.deleteFile(program.processSwapName(), true);
      	if (deleteFromDisk.status === 'error') {
      		return false;
      	}
      	program.pcb.base = this.locations[programLocation].base;
      	program.pcb.limit = this.locations[programLocation].limit;
      	program.location = INMEMORY;
      	this.update();
      	return true;
      }

      public readProgramAtLocation(location) {
      	var program = "";
      	for (var i = this.locations[location].base; i < this.locations[location].limit; i++) {
      		program += this.memory.memory[i] + " ";
      	}
      	return program.trim();
      }

    }
}
