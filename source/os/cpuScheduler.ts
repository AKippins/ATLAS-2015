///<reference path="../globals.ts" />


module TSOS {
    export class CpuScheduler {
      constructor(public schedulingOptions: string[] = ['rr'],
    	            public scheduler: string = 'rr'
                ){}

      public start(): void {
      	if (_ReadyQueue.length > 0) {
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
      	}
      	return false;
      }

      public contextSwitch(): void {
      	var nextProcess = this.determineNextProcess();
      	if (nextProcess !== null && nextProcess !== undefined) {
      		if (this.scheduler === this.schedulingOptions[0]) {
      			this.handleRoundRobinContextSwitch();
      		}
      		// Update the display
      		//_CurrentProcess.printToScreen();
      		// Get a reference to the "last process" which will be used for roll out/int
      		var lastProcess = _CurrentProcess;
      		// Set the CurrentProgram to the next process
      		_CurrentProcess = nextProcess;
      		// This program is now in the running state
      		_CurrentProcess.state = RUNNING;
      		// Initialize the CPU and set isExecuting to true only if
      		// step is not currently enabled.
      		var shouldBeExecuting = !_SingleStep;
      		_CPU.init(_CurrentProcess, shouldBeExecuting);
      	} else if (_CurrentProcess.state === TERMINATED) {
      		this.stop();
      	}
      	// Reset the cycle counter
      	_CycleCounter = 0;
      };

      public handleRoundRobinContextSwitch(): void {
      	_Kernel.krnTrace("Current cycle count > quantum of " + QUANTUM + ". Switching context.");
      	// Update the PCB for the currently executing program
      	_CurrentProcess.updatePcbWithCpu();
      	// If the currently executing program has a state of terminated,
      	// do not put it back on the queue
      	if (_CurrentProcess.state !== TERMINATED) {
      		// Process will be moved back into the queue, so set its state to waiting
      		_CurrentProcess.state = READY;
      		// Put the ProcessState back on the ready queue
      		_ReadyQueue.push(_CurrentProcess);
      	} else if (_CurrentProcess.state === TERMINATED) {
      		//_MemoryManager.removeFromResidentList(_CurrentProcess.pcb.pid); //
      	}
      };

      public determineNextProcess(): void {
        if (this.scheduler === this.schedulingOptions[0]){
          return _ReadyQueue.shift();
        } else {
          return null;
        }
      };

      public stop(): void{
      	//_MemoryManager.removeFromResidentList(_CurrentProcess.pcb.pid);
      	_CPU.isExecuting = false;
      	// Set the mode bit back to kernel mode, as the user processes are over
      	_Mode = 0;
      	// Update the display
      	//_CurrentProcess.printToScreen();
      	// Reset the current program
      	_CurrentProcess = null;
      	// Reset the cycle counter
      	_CycleCounter = 0;
      };
    }
  }
