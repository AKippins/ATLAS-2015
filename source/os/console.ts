///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {
        constructor(public storedCommands = new Array(),
                    public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public index = 0)  {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public clearLine(): void {
          var xStartPos = this.currentXPosition
          var yStartPos = this.currentYPosition - _DefaultFontSize;

          for (var x = 0; x < this.buffer.length; x++) {
      			xStartPos -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(x));
      		}
      		_DrawingContext.clearRect(xStartPos, yStartPos, this.currentXPosition, this.currentYPosition);
      		this.currentXPosition = xStartPos;
        }

        public clearCharacter(char): void {
          var xStartPos = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
          var yStartPos = this.currentYPosition - _DefaultFontSize;

          // Trim the buffer
          this.buffer = this.buffer.substring(0, this.buffer.length - 1);
          // Draw a rectangle over the letter that was deleted
          _DrawingContext.clearRect(xStartPos, yStartPos, this.currentXPosition, this.currentYPosition);
          // Move the current X position since we've removed a character
          this.currentXPosition -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    this.storedCommands.push(this.buffer);
                    this.index = this.storedCommands.length;
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
              for (var x = 0; x < text.length; x++){
                if (text[x] == " " && this.currentXPosition > 401){
                  this.currentXPosition = 0;
		              this.currentYPosition += _DefaultFontSize +
                                           _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                           _FontHeightMargin;
                  if (this.currentYPosition >= _Canvas.height){
                    this.advanceLine();
                  }
                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[x]);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[x]);
                this.currentXPosition = this.currentXPosition + offset;
              }
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            console.log(this.currentYPosition);
            console.log(_Canvas.height)
            if (this.currentYPosition >= _Canvas.height){
                console.log("Progress...")
                // Get canvas data, Smushes the text at the bottom of the screen. Need to fix this.
                //getImageData(x,y,Width,Height);
          			var oldCanvas = _DrawingContext.getImageData(0, this.currentFontSize + 5, _Canvas.width, _Canvas.height);
          			// Redraw the canvas with the old canvas data.
          			_DrawingContext.putImageData(oldCanvas, 0, 0);
          			// Move the current Y position down to get the text on the screen.
                this.currentYPosition = _Canvas.height - this.currentFontSize;
            }
          };

            // TODO: Handle scrolling. (iProject 1)
    }
 }
