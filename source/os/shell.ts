///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="kernel.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it. Lemons Take 3

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
                                  this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
                                  this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                                  this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
                                  this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
                                  this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
                                  this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
                                  this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
                                  this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Shows the current date & time.");
                                  this.commandList[this.commandList.length] = sc;

            //whereami
            //Gonna do more with this later
            sc = new ShellCommand(this.shellWhere,
                                  "whereami",
                                  "- Gives a snarky response to the user.");
                                  this.commandList[this.commandList.length] = sc;

            //lemons
            //Gonna do more with this later
            sc = new ShellCommand(this.shellLemons,
                                  "lemons",
                                  "- I don't want your damn lemons!!!!");
                                  this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Allows the user to set a status message to keep track of the os status.");
                                  this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Validates the user code in the User Program Input.");
                                  this.commandList[this.commandList.length] = sc;

            //bsod
            sc = new ShellCommand(this.shellBSOD,
                                  "bsod",
                                  "- Only causes death and destruction man. Don't do it. Really... Don't do it please.");
                                  this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<Integer> - Run a program that has been loaded.");
                                  this.commandList[this.commandList.length] = sc;

            //runall
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  "<Integer> - Run all programs that have been loaded.");
                                  this.commandList[this.commandList.length] = sc;

            //clearmem
            sc = new ShellCommand(this.shellClearMem,
                                  "clearmem",
                                  "- Clears the memory held in RAM.");
                                  this.commandList[this.commandList.length] = sc;

            //quantum
            sc = new ShellCommand(this.shellQuantum,
                                  "quantum",
                                  "<Integer> - Sets the quantum for round robin scheduling.");
                                  this.commandList[this.commandList.length] = sc;

            //ps
            sc = new ShellCommand(this.shellPS,
                                  "ps",
                                  "- Shows all running processes.");
                                  this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            var displayDate = new Date().toLocaleDateString();
            var displayTime = new Date().toLocaleTimeString();
            _StdOut.putText(displayDate + " " + displayTime);
        }

        public shellWhere(args) {
            _StdOut.putText("Hello and, again, welcome to the Aperture Science computer-aided enrichment center.");
        }

        public shellLemons(args) {
            _StdOut.putText("I'm gonna burn your house down with the lemons.");
        }

        public shellRun(args) {
          if (!_ResidentList[args[0]]){
            _StdOut.putText("There is no program with that PID sorry.");
            return
          }
          var loadedProcess = _ResidentList[args[0]]
          _ReadyQueue.push(loadedProcess);
          //loadedProcess.printToScreen();
          if (_CPU.isExecuting) {
            if (_CpuScheduler.determineNeedToContextSwitch()) {
              _CpuScheduler.contextSwitch();
            }
          } else {
            _CpuScheduler.start();
          }
          //_CPU.PC = loadedProcess.pcb.base;
          //_CPU.limit = loadedProcess.pcb.limit;
          //_CPU.isExecuting = true;
        }

        public shellRunAll(){
          for (var i = 0; i < _ResidentList.length; i++) {
    			  var loadedProcess = _ResidentList[i];
      			if (loadedProcess && loadedProcess.state !== TERMINATED) {
      				_ReadyQueue.push(loadedProcess);
              if (_CPU.isExecuting) {
        				if (_CpuScheduler.determineNeedToContextSwitch()) {
        					_CpuScheduler.contextSwitch();
        				}
        			} else {
        				_CpuScheduler.start();
        			}
      				//_ResidentList[i].printToScreen();
    			  }
    		  }
        }

        public shellStatus(args) {
          var string = ""
          if (args.length > 0) {
            for (var x = 0; x < args.length; x++){
              string += args[x] + " ";
              console.log(string);
              // Update the user status in the console.
              var taStatus = <HTMLInputElement> document.getElementById("taStatusDisplay");
              taStatus.value = string;
            }
          } else {
              _StdOut.putText("Usage: status <string>  Please supply a status message.");
          }
        }

        public shellLoad(args) {
          var taInput = <HTMLInputElement> document.getElementById("taProgramInput");
          var load = false;

          if (taInput.value.length > 0) {
            for (var count = 0; count !== taInput.value.length; count++) {
                switch (taInput.value[count]){
                  case "0"://valid do nothing;
                  case "1"://valid do nothing;
                  case "2"://valid do nothing;
                  case "3"://valid do nothing;
                  case "4"://valid do nothing;
                  case "5"://valid do nothing;
                  case "6"://valid do nothing;
                  case "7"://valid do nothing;
                  case "8"://valid do nothing;
                  case "9"://valid do nothing;
                  case "a"://valid do nothing;
                  case "A"://valid do nothing;
                  case "b"://valid do nothing;
                  case "B"://valid do nothing;
                  case "c"://valid do nothing;
                  case "C"://valid do nothing;
                  case "d"://valid do nothing;
                  case "D"://valid do nothing;
                  case "e"://valid do nothing;
                  case "E"://valid do nothing;
                  case "f"://valid do nothing;
                  case "F"://valid do nothing;
                  case " "://valid do nothing;
                           load = true;
                    break;
                  default: _StdOut.putText("That input is invalid, Only Hex is allowed. Char: " + taInput.value[count] + " ");
                           load = false;
                           console.log("That input is invalid, Only Hex is allowed.");
                           console.log("I need to see this " + taInput.value[count]);
                    break;
                }
              }
            _StdOut.putText("Current input is valid.");
            if (load){
              var code = taInput.value.replace(/\s/g, '');
              _Console.advanceLine();
              if (_Memory.base < 768){
                _StdOut.putText("The current program has the PID: " + PID);
                _MemoryManager.load(code);
                _Memory.update();
              } else {
              _StdOut.putText("There currently isn't enough avaliable memory. Please clear the memory.");
              return;
              }
            }
          } else {
            _StdOut.putText("No input detected.");
          }
        }

        public shellBSOD(args) {
            _Kernel.krnTrapError(args[0]);
        }

        public shellClearMem(args) {
          _Memory.clearMem();
          _Memory.update();
          _StdOut.putText("Memory has been cleared.");
        }

        public shellQuantum(args) {
            QUANTUM = args[0];
        }

        public shellPS(args){
          var result = "";
      		for (var i = 0; i < _ReadyQueue.length; i++) {
      			var processRunning = _ReadyQueue[i];
      			if (processRunning.state !== TERMINATED) {
      				result += ("PID: " + processRunning.pcb.pid + ", ");
      			}
      		}
      		if (_CurrentProcess !== null) {
      			result += ("PID: " + _CurrentProcess.pcb.pid);
      		}
      		if (result.length) {
      			_StdIn.putText(result);
      		} else {
      			_StdIn.putText("There are no currently running processes.");
      		}
        }

        public shellKill(args){
          if (args.length > 0) {
      			var Pid = parseInt(args[0]);
      			var foundProcess = null;
      			if (_CurrentProcess && _CurrentProcess.pcb.pid === Pid) {
      				foundProcess = _CurrentProcess;
      				_CurrentProcess.state = TERMINATED;
      				_CurrentProcess.printToScreen();
      				_Kernel.krnTrace("Killed active process with PID " + Pid);
      				_CpuScheduler.contextSwitch();
      			} else {
      				for (var i = 0; i < _ReadyQueue.length; i++) {
      					if (_ReadyQueue[i].pcb.pid === Pid) {
      						foundProcess = _ReadyQueue[i];
      						_ReadyQueue[i].state = TERMINATED;
      						_ReadyQueue[i].printToScreen();
      						_ReadyQueue.splice(i, 1);
      						_Kernel.krnTrace("Killed queued process with PID " + Pid);
      						break;
      					}
      				}
      			}
      			if (foundProcess === null) {
      				_StdIn.putText("Usage: kill <pid>  Please supply a valid PID.");
      			}
      		} else {
      			_StdIn.putText("Usage: kill <pid>  Please supply a PID.");
      		}
        }
    }
}
