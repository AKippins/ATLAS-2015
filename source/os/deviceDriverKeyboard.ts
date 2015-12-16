///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 192 && isShifted){
              chr = String.fromCharCode(126); //~
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 192 && !isShifted){
              chr = String.fromCharCode(96); //`
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 49 && isShifted){
              chr = String.fromCharCode(33); //!
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 50 && isShifted){
              chr = String.fromCharCode(64); //@
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 51 && isShifted){
              chr = String.fromCharCode(35); //#
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 52 && isShifted){
              chr = String.fromCharCode(36); //$
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 53 && isShifted){
              chr = String.fromCharCode(37); //%
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 54 && isShifted){
              chr = String.fromCharCode(94); //^
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 55 && isShifted){
              chr = String.fromCharCode(38); //&
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 56 && isShifted){
              chr = String.fromCharCode(42); //*
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 57 && isShifted){
                chr = String.fromCharCode(40); //(
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 48 && isShifted){
              chr = String.fromCharCode(41); //)
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 189 && !isShifted){
              chr = String.fromCharCode(45); //-
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 189 && isShifted){
              chr = String.fromCharCode(95); //_
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 187 && !isShifted){
              chr = String.fromCharCode(61); //=
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 187 && isShifted){
              chr = String.fromCharCode(43); //+
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 219 && !isShifted){
              chr = String.fromCharCode(91); //[
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 219 && isShifted){
              chr = String.fromCharCode(123); //{
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 221 && !isShifted){
              chr = String.fromCharCode(93); //]
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 221 && isShifted){
              chr = String.fromCharCode(125); //}
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 220 && !isShifted){
              chr = String.fromCharCode(92); //\
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 220 && isShifted){
              chr = String.fromCharCode(124); //|
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 186 && !isShifted){
              chr = String.fromCharCode(59); //;
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 186 && isShifted){
              chr = String.fromCharCode(58); //:
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 222 && !isShifted){
              chr = String.fromCharCode(39); //'
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 222 && isShifted){
              chr = String.fromCharCode(34); //"
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 188 && !isShifted){
              chr = String.fromCharCode(44); //,
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 188 && isShifted){
              chr = String.fromCharCode(60); //<
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 190 && !isShifted){
              chr = String.fromCharCode(46); //.
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 190 && isShifted){
              chr = String.fromCharCode(62); //>
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 191 && !isShifted){
              chr = String.fromCharCode(47); ///
              _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 191 && isShifted){
              chr = String.fromCharCode(63); //?
              _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                   ||   // space
                        (keyCode == 13)){                       // backspace
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 38 || keyCode == 40){
              _Console.clearLine();
              _Console.buffer = "";
              if (keyCode == 38){
                var change = -1
              }
              if (keyCode == 40){
                var change = 1
              }
              _Console.index += change;
              if (_Console.storedCommands[_Console.index]) {
                console.log("Current Buffer: " + _Console.buffer);
                console.log("Command In Queue: " + _Console.storedCommands[_Console.index]);
                _KernelInputQueue.enqueue(_Console.storedCommands[_Console.index]);
          		} else if (_Console.index < 0){
                  //So that if you go up from the bottom of the list you get to 0 in the array and should get an entry.
                  _Console.index = -1
              } else if (_Console.index > _Console.storedCommands.length){
                  //So that if you go down from the top of the list you get to the first entry.
                  _Console.index = _Console.storedCommands.length - 1;
              }
            }
            else if (keyCode == 8){
                //Hope backspace code just appears here... todo
                var char = _Console.buffer.charAt(_Console.buffer.length - 1);
            		// Checking for a blank buffer
            		if (char == "") {
                  // If blank we wanna do nothing.
            			return;
                }
                _Console.clearCharacter(char);
            }
            else if (keyCode == 9){
                var end = _Console.buffer.length - 1
                var matches = []
                console.log(_Shell.commandList[0])
                for (var x = 0; x < _Shell.commandList.length; x++){
                  if (_Console.buffer.substring(0,end) == _Shell.commandList[x].substring(0,end)){
                    matches.push(_Shell.commandList[x])
                  }
                }
                if (matches.length == 1){

                }
                //need to finish
            }
        }
    }
}
