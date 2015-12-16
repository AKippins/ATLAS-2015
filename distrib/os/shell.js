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
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Shows the current date & time.");
            this.commandList[this.commandList.length] = sc;
            //whereami
            //Gonna do more with this later
            sc = new TSOS.ShellCommand(this.shellWhere, "whereami", "- Gives a snarky response to the user.");
            this.commandList[this.commandList.length] = sc;
            //lemons
            //Gonna do more with this later
            sc = new TSOS.ShellCommand(this.shellLemons, "lemons", "- I don't want your damn lemons!!!!");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Allows the user to set a status message to keep track of the os status.");
            this.commandList[this.commandList.length] = sc;
            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user code in the User Program Input.");
            this.commandList[this.commandList.length] = sc;
            //bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Only causes death and destruction man. Don't do it. Really... Don't do it please.");
            this.commandList[this.commandList.length] = sc;
            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<Integer> - Run a program that has been loaded.");
            this.commandList[this.commandList.length] = sc;
            //runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "<Integer> - Run all programs that have been loaded.");
            this.commandList[this.commandList.length] = sc;
            //clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears the memory held in RAM.");
            this.commandList[this.commandList.length] = sc;
            //quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<Integer> - Sets the quantum for round robin scheduling.");
            this.commandList[this.commandList.length] = sc;
            //ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Shows all running processes.");
            this.commandList[this.commandList.length] = sc;
            //kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- Kill a running processes.");
            this.commandList[this.commandList.length] = sc;
            //create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "- Creates a file with the given name.");
            this.commandList[this.commandList.length] = sc;
            //read
            sc = new TSOS.ShellCommand(this.shellRead, "read", "- Reads a file with the given name.");
            this.commandList[this.commandList.length] = sc;
            //write
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "- Writes to the file with the given name.");
            this.commandList[this.commandList.length] = sc;
            //delete
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "- Deletes the file with the given name.");
            this.commandList[this.commandList.length] = sc;
            //format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Format the HDD.");
            this.commandList[this.commandList.length] = sc;
            //ls
            sc = new TSOS.ShellCommand(this.shellLS, "ls", "- Lists the files stored on the disk.");
            this.commandList[this.commandList.length] = sc;
            //getschedule
            sc = new TSOS.ShellCommand(this.shellGS, "getschedule", "- Returns the currently selected scheduling system.");
            this.commandList[this.commandList.length] = sc;
            //setschedule
            sc = new TSOS.ShellCommand(this.shellSS, "setschedule", "- Set the CPU scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
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
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var displayDate = new Date().toLocaleDateString();
            var displayTime = new Date().toLocaleTimeString();
            _StdOut.putText(displayDate + " " + displayTime);
        };
        Shell.prototype.shellWhere = function (args) {
            _StdOut.putText("Hello and, again, welcome to the Aperture Science computer-aided enrichment center.");
        };
        Shell.prototype.shellLemons = function (args) {
            _StdOut.putText("I'm gonna burn your house down with the lemons.");
        };
        Shell.prototype.shellRun = function (args) {
            if (!_ResidentList[args[0]]) {
                _StdOut.putText("There is no program with that PID sorry.");
                return;
            }
            var loadedProcess = _ResidentList[args[0]];
            _ReadyQueue.push(loadedProcess);
            //loadedProcess.printToScreen();
            if (_CPU.isExecuting) {
                if (_CpuScheduler.determineNeedToContextSwitch()) {
                    _CpuScheduler.contextSwitch();
                }
            }
            else {
                _CpuScheduler.start();
            }
            //_CPU.PC = loadedProcess.pcb.base;
            //_CPU.limit = loadedProcess.pcb.limit;
            //_CPU.isExecuting = true;
        };
        Shell.prototype.shellRunAll = function () {
            for (var i = 0; i < _ResidentList.length; i++) {
                var loadedProcess = _ResidentList[i];
                console.log(_ResidentList);
                console.log(loadedProcess);
                if (loadedProcess && loadedProcess.state != TERMINATED) {
                    _ReadyQueue.push(loadedProcess);
                    if (_CPU.isExecuting) {
                        if (_CpuScheduler.determineNeedToContextSwitch()) {
                            _CpuScheduler.contextSwitch();
                        }
                    }
                    else {
                        _CpuScheduler.start();
                    }
                }
            }
        };
        Shell.prototype.shellStatus = function (args) {
            var string = "";
            if (args.length > 0) {
                for (var x = 0; x < args.length; x++) {
                    string += args[x] + " ";
                    console.log(string);
                    // Update the user status in the console.
                    var taStatus = document.getElementById("taStatusDisplay");
                    taStatus.value = string;
                }
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a status message.");
            }
        };
        Shell.prototype.shellLoad = function (args) {
            var taInput = document.getElementById("taProgramInput");
            if (taInput.value.match(/^[0-9A-F]/i)) {
                _StdIn.putText("Current input is valid. Please wait.");
                _StdIn.advanceLine();
                // Use the default priority
                var priority = DEFAULTPRIORITY;
                if (args.length >= 1) {
                    // If the priroity argument is passed, parse that and use it
                    priority = parseInt(args[0]);
                }
                var Pid = _MemoryManager.load(taInput.value, priority);
                if (Pid !== null) {
                    _StdIn.putText("The current program has the PID: " + Pid);
                }
            }
            else {
                _StdIn.putText("That input is invalid, Only Hex is allowed.");
            }
            //var load = false;
            /*if (taInput.value.length > 0) {
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
            }*/
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError(args[0]);
        };
        Shell.prototype.shellClearMem = function (args) {
            if (args[0] == 0 || args[0] == 1 || args[0] == 2) {
                _MemoryManager.clearMem(args[0]);
                _StdOut.putText("Virtual Memory location " + args[0] + " has been cleared.");
            }
            else {
                _MemoryManager.clearMem("all");
                //_MemoryManager.update();
                _StdOut.putText("All Virtual Memory has been cleared.");
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            QUANTUM = args[0];
            _StdOut.putText("Quantum has been changed to " + QUANTUM + ".");
        };
        Shell.prototype.shellPS = function (args) {
            var result = "";
            console.log(_ResidentList);
            console.log(_ResidentList[0].pcb.Pid);
            for (var i = 0; i < _ResidentList.length; i++) {
                if (_ResidentList.state != TERMINATED) {
                    result += ("PID: " + _ResidentList[i].pcb.Pid + ", ");
                }
            }
            if (_CurrentProcess != null) {
                result += ("PID: " + _CurrentProcess.pcb.Pid);
            }
            if (result.length) {
                _StdIn.putText(result);
            }
            else {
                _StdIn.putText("There are no currently running processes.");
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var Pid = parseInt(args[0]);
                var foundProcess = null;
                if (_CurrentProcess && _CurrentProcess.pcb.pid === Pid) {
                    foundProcess = _CurrentProcess;
                    _CurrentProcess.state = TERMINATED;
                    _CurrentProcess.printToScreen();
                    _Kernel.krnTrace("Killed active process with PID " + Pid);
                    _CpuScheduler.contextSwitch();
                }
                else {
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
            }
            else {
                _StdIn.putText("Usage: kill <pid>  Please supply a PID.");
            }
        };
        Shell.prototype.shellCreate = function (args) {
            if (args.length > 0) {
                var result = _krnFileSystemDriver.createFile(args[0]);
                _StdIn.putText(result.message);
            }
            else {
                _StdIn.putText("Usage: create <name> - Please supply a file name");
            }
        };
        Shell.prototype.shellRead = function (args) {
            if (args.length > 0) {
                var result = _krnFileSystemDriver.readFile(args[0]);
                if (result.status === 'success') {
                    _StdIn.putText(result.data);
                }
                else {
                    _StdIn.putText(result.message);
                }
            }
            else {
                _StdIn.putText("Usage: read <name> - Please supply a file name");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            if (args.length > 0) {
                var data = "";
                for (var i = 1; i < args.length; i++) {
                    // We want to add a space in between each argument, but only if
                    // we are at an arg that is not the first one, since we don't
                    // want to start the string with a space.
                    if (i > 1) {
                        data += " " + args[i];
                    }
                    else {
                        data += args[i];
                    }
                }
                var result = _krnFileSystemDriver.writeFile(args[0], data);
                _StdIn.putText(result.message);
            }
            else {
                _StdIn.putText("Usage: write <name> <data> - Please supply a file name and data");
            }
        };
        Shell.prototype.shellDelete = function (args) {
            if (args.length > 0) {
                var result = _krnFileSystemDriver.deleteFile(args[0], true);
                _StdIn.putText(result.message);
            }
            else {
                _StdIn.putText("Usage: delete <name> - Please supply a file name");
            }
        };
        Shell.prototype.shellFormat = function (args) {
            var successfulFormat = _krnFileSystemDriver.format();
            if (successfulFormat) {
                _StdIn.putText("Successfully formatted the filesystem.");
            }
            else {
                _StdIn.putText("Error while formatting filesystem.");
            }
        };
        Shell.prototype.shellLS = function (args) {
            var result = _krnFileSystemDriver.listDirectory();
            if (result.status === 'success') {
                if (result.data.length) {
                    for (var i = 0; i < result.data.length; i++) {
                        _StdIn.putText(result.data[i].key + " : " + result.data[i].name);
                        _StdIn.advanceLine();
                    }
                }
                else {
                    _StdIn.putText('No files currently stored on file system.');
                }
            }
            else {
                _StdIn.putText(result.message);
            }
        };
        Shell.prototype.shellGS = function (args) {
            _StdIn.putText(_CpuScheduler.scheduler);
        };
        Shell.prototype.shellSS = function (args) {
            if (args.length > 0) {
                // Ensure that the given argument is in the possible scheduling possibilities
                var schedulerIndex = -1;
                for (var i = 0; i < _CpuScheduler.schedulingOptions.length; i++) {
                    if (args[0] === _CpuScheduler.schedulingOptions[i]) {
                        schedulerIndex = i;
                    }
                }
                if (schedulerIndex === -1) {
                    _StdIn.putText("Usage: Please supply a valid scheduler");
                }
                else {
                    _CpuScheduler.scheduler = _CpuScheduler.schedulingOptions[schedulerIndex];
                    _StdIn.putText("Set CPU scheduling algorithm to " +
                        _CpuScheduler.schedulingOptions[schedulerIndex]);
                }
            }
            else {
                _StdIn.putText("Usage: Please supply a scheduler");
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
