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
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the date text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taDateDisplay").value = "";
            // Clear the status text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taStatusDisplay").value = "";
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Building date time var for the display above the host log
            var displayDate = new Date().toLocaleDateString();
            var displayTime = new Date().toLocaleTimeString();
            var dateTime = displayDate + " " + displayTime;
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            var lastMsg = taLog.value.substr(0, taLog.value.indexOf("\n"));
            if (lastMsg.indexOf("msg:Idle") > 0) {
                taLog.value = taLog.value.replace(lastMsg + "\n", str);
            }
            else {
                taLog.value = str + taLog.value;
            }
            // Update the Date & Time in the console.
            var taDate = document.getElementById("taDateDisplay");
            taDate.value = dateTime;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            // There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            //_Memory = new Memory();
            //this.initilizeMem();
            //_Memory.init();
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.init();
            //_MemoryManager.printToScreen();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostBtnSingleStep_click = function (btn) {
            _SingleStep = !_SingleStep;
            if (_SingleStep == true) {
                document.getElementById("btnSingleStep").style.backgroundColor = "#8CC152";
                document.getElementById("btnStep").style.backgroundColor = "#8CC152";
                document.getElementById("btnStep").disabled = false;
            }
            else if (_SingleStep == false) {
                document.getElementById("btnSingleStep").style.backgroundColor = "#AAB2BD";
                document.getElementById("btnStep").style.backgroundColor = "#AAB2BD";
                document.getElementById("btnStep").disabled = true;
            }
        };
        Control.hostBtnStep_click = function (btn) {
            if (_SingleStep) {
                _CPU.isExecuting = true;
            }
        };
        Control.initilizeMem = function () {
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
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
