///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor(public tracks: number = 4,
                    public sectors: number = 8,
                    public blocks: number = 8,
                    public bytes: number = 64,
                    public metaSize: number = 4
                    ) {
            // Override the base method pointers.
            super(this.krnFileSystemDriverEntry, this.krnFileSystemISR);
        }

        public krnFileSystemDriverEntry() {
          // Initialization routine for this, the kernel-mode Keyboard Device Driver.
          this.status = "loaded";
        	this.printToScreen();
        }

        public krnFileSystemISR(params) {

        }

        public dataSize() {
        	return this.bytes - this.metaSize;
        }

        public zeroOut() {
        	var zeroedOut = "";
        	for (var x = 0; x < this.bytes; x++) {
        		zeroedOut += "0";
        	}
        	return zeroedOut;
        }

        public format() {
        	if (!this.supportsHtml5Storage()) {
        		return false;
        	}
        	var zeroedOut = this.zeroOut();
        	for (var track = 0; track < this.tracks; track++) {
        		for (var sector = 0; sector < this.sectors; sector++) {
        			for (var block = 0; block < this.blocks; block++) {
        				localStorage.setItem(this.makeKey(track, sector, block), zeroedOutData);
        			}
        		}
        	}
        	this.makeMBR();
        	this.update();
        	return true;
        }
    }
}
