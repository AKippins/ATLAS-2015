///<reference path="../globals.ts" />


module TSOS {
    export class CpuScheduler {
      constructor(public schedulingOptions: string[] = ['rr', 'fcfs', 'priority'],
    	            public scheduler: string = 'rr'
                ){}

      public start(): void {
      	if (_ReadyQueue.length > 0) {
          _Mode = 1;
      		_CurrentProcess = this.determineNextProcess();
      		_CurrentProcess.state = RUNNING;
      		var shouldBeExecuting = !_SingleStep;
      		_CPU.init(_CurrentProcess, shouldBeExecuting);
      	}
      };

      public determineNeedToContextSwitch(): boolean {
        if (this.scheduler === this.schedulingOptions[0]) {
      		if (_CycleCounter >= QUANTUM) {
      			return true;
      		}
      	} else if (this.scheduler === this.schedulingOptions[1]) {
      		if (_CurrentProcess.state === TERMINATED) {
      			return true;
      		}
      	} else if (this.scheduler === this.schedulingOptions[2]) {
      		if (_CurrentProcess.state === TERMINATED) {
      			return true;
      		}
      	}
      	return false;
      }

      public contextSwitch(): void {
      	var nextProcess = this.determineNextProcess();
        if (nextProcess !== null && nextProcess !== undefined) {
          if (this.scheduler === this.schedulingOptions[0]) {
            this.handleRoundRobinContextSwitch();
          } else if (this.scheduler === this.schedulingOptions[1]) {
            this.handleFCFSContextSwitch();
          } else if (this.scheduler === this.schedulingOptions[2]) {
            this.handlePriorityContextSwitch(nextProcess);
          } else {
            _Kernel.krnTrace("Nope, Unrecognized CPU Scheduler...");
          }
      		var lastProcess = _CurrentProcess;
      		_CurrentProcess = nextProcess;
      		_CurrentProcess.state = RUNNING;
          this.handleRollInRollOut(lastProcess);
          /*if (_CurrentProcess.pcb.PC < _CurrentProcess.pcb.base){
            _CurrentProcess.pcb.PC = _CurrentProcess.pcb.base;
          }*/
      		var shouldBeExecuting = !_SingleStep;
      		_CPU.init(_CurrentProcess, shouldBeExecuting);
      	} else if (_CurrentProcess.state === TERMINATED) {
      		this.stop();
      	}
      	_CycleCounter = 0;
      };

      public handleRoundRobinContextSwitch(): void {
      	_Kernel.krnTrace("Current cycle count > quantum of " + QUANTUM + ". Switching context.");
      	_CurrentProcess.updatePcbWithCpu();
      	if (_CurrentProcess.state !== TERMINATED) {
      		_CurrentProcess.state = READY;
      		_ReadyQueue.push(_CurrentProcess);
      	} else if (_CurrentProcess.state === TERMINATED) {
      		_MemoryManager.remFromResident(_CurrentProcess.pcb.Pid);
      	}
      };

      public handleFCFSContextSwitch() {
      	this.handleRoundRobinContextSwitch();
      };

      public handlePriorityContextSwitch(nextProcess) {
        _CurrentProcess.updatePcbWithCpu();
        _MemoryManager.remFromResident(_CurrentProcess.pcb.Pid);
      };

      public handleRollInRollOut(lastProcess) {
        if (_CurrentProcess.location === INFILESYSTEM) {
        	if (lastProcess.state !== TERMINATED) {
        		var successfulRollOut = _MemoryManager.rollOut(lastProcess);
        		if (!successfulRollOut) {
        			_Kernel.krnTrace('Error while rolling out PID ' + lastProcess.pcb.Pid);
        		}
        	}
        	var successfulRollIn = _MemoryManager.rollIn(_CurrentProcess);
        	if (!successfulRollIn) {
        		_Kernel.krnTrace('Error while rolling in PID ' + _CurrentProcess.pcb.Pid);
        	}
        }
      };

      public determineNextProcess(): void {
        if (this.scheduler === this.schedulingOptions[0] || this.scheduler === this.schedulingOptions[1]){
          return _ReadyQueue.shift();
        } else if (this.scheduler === this.schedulingOptions[2]) {
      		var lowestPriority = Infinity;
      		var lowestPriorityIndex = -1;
      		for (var i = 0; i < _ReadyQueue.length; i++) {
      			if (_ReadyQueue[i].priority < lowestPriority) {
      				lowestPriority = _ReadyQueue[i].priority;
      				lowestPriorityIndex = i;
      			}
      		}
      		var nextProcess = _ReadyQueue.splice(lowestPriorityIndex, 1)[0];
      		return nextProcess;
      	}
          return null;
      };

      public stop(): void{
      	_MemoryManager.remFromResident(_CurrentProcess.pcb.Pid);
      	_CPU.isExecuting = false;
      	_Mode = 0;
      	//_CurrentProcess.printToScreen();
      	_CurrentProcess = null;
      	_CycleCounter = 0;
        _Console.advanceLine();
        _OsShell.putPrompt();
      };
    }
  }
