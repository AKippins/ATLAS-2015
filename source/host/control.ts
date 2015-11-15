///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the date text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taDateDisplay")).value="";

            // Clear the status text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taStatusDisplay")).value="";

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Building date time var for the display above the host log
            var displayDate = new Date().toLocaleDateString();
            var displayTime = new Date().toLocaleTimeString();
            var dateTime = displayDate + " " + displayTime;

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            var lastMsg = taLog.value.substr(0, taLog.value.indexOf("\n"));
            if (lastMsg.indexOf("msg:Idle") > 0) {
              taLog.value = taLog.value.replace(lastMsg + "\n", str);
            } else {
              taLog.value = str + taLog.value;
            }

            // Update the Date & Time in the console.
            var taDate = <HTMLInputElement> document.getElementById("taDateDisplay");
            taDate.value = dateTime;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            // There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            _Memory = new Memory();
            this.initilizeMem();
            _Memory.init();
            _MemoryManager = new MemoryManager();
            //_MemoryManager.printToScreen();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSingleStep_click(btn): void {
            _SingleStep = !_SingleStep
            if (_SingleStep == true){
              (<HTMLButtonElement>document.getElementById("btnSingleStep")).style.backgroundColor = "#8CC152";
              (<HTMLButtonElement>document.getElementById("btnStep")).style.backgroundColor = "#8CC152";
              (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
            } else if (_SingleStep == false) {
              (<HTMLButtonElement>document.getElementById("btnSingleStep")).style.backgroundColor = "#AAB2BD";
              (<HTMLButtonElement>document.getElementById("btnStep")).style.backgroundColor = "#AAB2BD";
              (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
            }
        }

        public static hostBtnStep_click(btn): void {
            if (_SingleStep){
              _CPU.isExecuting = true;
            }
        }

        public static initilizeMem(): void {
          var nextRow = "";
          for (var i = 0, len = _Memory.memory.length; i < len; i++) {
              // Initiate UI
              if (i % 8 === 0) {
                  nextRow += "</tr>";
                  document.getElementById("divMemory").innerHTML += nextRow;
                  nextRow = "<tr><td>0x" + i.toString(16) + "</td>";
              }
              nextRow += "<td id='mem" + i + "'>00</td>";
          }
        }
    }
}
