///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {

        constructor(public tracks: number = 4,
                    public sectors: number = 8,
                    public blocks: number = 8,
                    public bytes: number = 64,
                    public metaSize: number = 4
                    ) {
            super(this.krnFileSystemDriverEntry, this.krnFileSystemISR);
            // Override the base method pointers.
        }

        public init(){
          this.krnFileSystemDriverEntry;
          this.krnFileSystemISR;
        }

        public krnFileSystemDriverEntry() {
          this.status = "loaded";
          this.update();
        }

        public krnFileSystemISR(params) {

        }

        public createFile(name) {
          var result = {
            'status' : 'error',
            'message' : '',
            'data' : '',
          };
          if (this.formatString(name).length > this.dataSize()) {
            result.message = 'The name given excedes the data size.';
            return result;
          }
          if (!this.fileSystemReady()) {
            result.message = 'Please format the file system and try again.';
            return result;
          }
          var addr = this.findAddr(name);
          if (addr !== 'na') {
            result.message = 'A file aready exist with the name "' + name + '"';
            return result;
          }
          var nextAddr = this.availableAddr();
          if (nextAddr === 'na') {
            result.message = 'Sorry, there are no available directory entries.';
            return result;
          }
          var nextFile = this.availableFile();
          if (nextFile === 'na') {
            result.message = 'Sorry, there are no available file entries.';
            return result;
          }
          var addrMetaData = "1" + nextFile;
          var addrData = this.formatStringForSingleBlock(name);
          var fileMetaData = "1---";
          var fileData = this.formatStringForSingleBlock("");
          sessionStorage.setItem(nextAddr, (addrMetaData + addrData));
          sessionStorage.setItem(nextFile, (fileMetaData + fileData));
          this.update();
          result.status = 'success';
          result.message = 'Successfully created the file with name "' + name + '"';
          return result;
        }

        public writeFile(name, data) {
          var result = {
            'status' : 'error',
            'message' : '',
            'data' : '',
          };
          if (!this.fileSystemReady()) {
            result.message = 'Please format the file system and try again.';
            return result;
          }
          var addr = this.findAddr(name);
          if (addr === 'na') {
            result.message = 'Couldn\'t find a file with the name "' + name + '"';
            return result;
          }
          var block = this.readData(addr);
          this.deleteFile(name, false);
          var write = this.handleWriteData(block, data);
          if (!write) {
            result.status = 'error';
            result.message = 'Not enough space on disk to write full file';
            return result;
          }
          this.update();
          result.status = 'success';
          result.message = 'Successfully wrote the file to disk';
          return result;
        }
        public readFile(name) {
          var result = {
            'status' : 'error',
            'message' : '',
            'data' : '',
          };
          if (!this.fileSystemReady()) {
            result.message = 'Please format the file system and try again.';
            return result;
          }
          var addr = this.findAddr(name);
          if (addr === 'na') {
            result.message = 'Couldn\'t find a file with the name "' + name + '"';
            return result;
          }
          var block = this.readData(addr);
          var addrData = this.readBlocks(this.getChainAddress(block));
          result.status = 'success';
          result.message = 'Successfully read the file.';
          result.data = addrData;
          return result;
        }

        public deleteFile(name, deleteAddr) {
          var result = {
            'status' : 'error',
            'message' : '',
            'data' : '',
          };
          if (!this.fileSystemReady()) {
            result.message = 'Please format the file system and try again.';
            return result;
          }
          if (name === 'MBR') {
            result.message = 'I cannot delete the MBR for you, it\'s important to me.';
            return result;
          }
          var addr = this.findAddr(name);
          if (addr === 'na') {
            result.message = 'Couldn\'t find a file with the name "' + name + '"';
            return result;
          }
          var currentBlock = this.readData(addr);
          var zeroedOut = this.zeroOut();
          var affectedBlocks = [this.getChainAddress(currentBlock)];
          if (deleteAddr) {
            affectedBlocks.push(currentBlock.key);
          }
          while (this.blockHasAddr(currentBlock.meta)) {
            affectedBlocks.push(this.getChainAddress(currentBlock));
            currentBlock = this.readData(this.getChainAddress(currentBlock));
          }
          for (var i = 0; i < affectedBlocks.length; i++) {
            sessionStorage.setItem(affectedBlocks[i], zeroedOut);
          }
          this.update();
          result.status = 'success';
          result.message = 'Successfully deleted the file with name ' + name;
          return result;
        }

        public listDirectory() {
          var result = {
            'status' : 'error',
            'message' : '',
            'data' : [],
          };
          if (!this.fileSystemReady()) {
            result.message = 'Please format the file system and try again.';
            return result;
          }
          for (var sector = 0; sector < this.sectors; sector++) {
            for (var block = 0; block < this.blocks; block++) {
              var thisKey = this.makeKey(0, sector, block);
              var thisData = this.readData(thisKey);
              if (this.blockIsActive(thisData)) {
                result.data.push({'key' : thisData.key, 'name' : thisData.data});
              }
            }
          }
          result.status = 'success';
          result.message = 'Successfully read the file system directory.';
          return result;
        }

        public readData(key) {
          var data = sessionStorage.getItem(key),
          returnValue = {
            "key" : key,
            "meta" : "",
            "data" : "",
          };
          if (data !== null) {
            for (var i = 0; i < this.metaSize; i++) {
              returnValue.meta += data.charAt(i);
            }
            for (var i = this.metaSize; i < data.length; i += 2) {
              var ascii = parseInt(data.charAt(i) + data.charAt(i + 1), 16);
              if (ascii !== 0) {
                returnValue.data += String.fromCharCode(ascii);
              }
            }
          }
          return returnValue;
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
        				sessionStorage.setItem(this.makeKey(track, sector, block), zeroedOut);
        			}
        		}
        	}
        	this.makeMBR();
        	this.update();
        	return true;
        }

        public makeMBR() {
        	var addBlock = this.readData(this.makeKey(0, 0, 0));
        	// Write the MBR to the file system
        	var write = this.handleWriteData(addBlock, "MBR");
        }

        public makeKey(t, s, b) {
        	return String(t) + String(s) + String(b);
        }


        public handleWriteData(block, data) {
        	var encoded = this.formatString(data);
        	var encodedBlocks = [];
        	while (encoded.length) {
        		encodedBlocks.push(this.padDataString(encoded.slice(0, this.dataSize())));
        		encoded = encoded.slice(this.dataSize());
        	}
        	var currentBlock = this.getChainAddress(block);
          var lastBlock = "---";
        	for (var i = 0; i < encodedBlocks.length; i++) {
        		if (currentBlock === -1) {
        			return false;
        		}
        		sessionStorage.setItem(currentBlock, ("1---" + encodedBlocks[i]));
        		if (lastBlock !== '---') {
        			var lastBlockData = sessionStorage.getItem(lastBlock).slice(4);
        			var lastBlockMeta = "1" + currentBlock;
        			sessionStorage.setItem(lastBlock, (lastBlockMeta + lastBlockData));
        		}
        		lastBlock = currentBlock;
        		currentBlock = this.availableFile();
        	}
        	return true;
        }


        public readBlocks(key) {
        	var currentData = this.readData(key);
        	var data = currentData.data;
        	while (this.blockHasAddr(currentData.meta)) {
        		currentData = this.readData(this.getChainAddress(currentData));
        		data += currentData.data;
        	}
        	return data;
        }

        public blockHasAddr(metaData) {
        	var link = metaData.substring(1, this.metaSize);
        	if (link !== "" && link !== "---") {
        		return true;
        	}
        	return false;
        }

        public formatStringForSingleBlock(str) {
        	return this.padDataString(this.formatString(str));
        }

        public formatString(str) {
        	var data = "";
        	for (var i = 0; i < str.length; i++) {
        		data += str.charCodeAt(i).toString(16)
        	}
        	return data;
        }


        public padDataString(data) {
        	var zeroedOut = this.zeroOut();
        	return (data + zeroedOut).slice(0, this.dataSize());
        }

        public availableAddr() {
        	for (var sector = 0; sector < this.sectors; sector++) {
        		for (var block = 0; block < this.blocks; block++) {
        			var thisKey = this.makeKey(0, sector, block),
        				thisData = this.readData(thisKey);
        			if (!this.blockIsActive(thisData)) {
        				return thisKey;
        			}
        		}
        	}
        	return 'na';
        }

        public findAddr(name) {
        	for (var sector = 0; sector < this.sectors; sector++) {
        		for (var block = 0; block < this.blocks; block++) {
        			var thisKey = this.makeKey(0, sector, block),
        				thisData = this.readData(thisKey);
        			if (thisData.data === name) {
        				return thisKey;
        			}
        		}
        	}
        	return 'na';
        }


        public availableFile() {
        	for (var track = 1; track < this.tracks; track++) {
        		for (var sector = 0; sector < this.sectors; sector++) {
        			for (var block = 0; block < this.blocks; block++) {
        				var thisKey = this.makeKey(track, sector, block),
        					thisData = this.readData(thisKey);
        				if (!this.blockIsActive(thisData)) {
        					return thisKey;
        				}
        			}
        		}
        	}
        	return 'na';
        }

        public fileSystemReady() {
        		for (var track = 0; track < this.tracks; track++) {
        			for (var sector = 0; sector < this.sectors; sector++) {
        				for (var block = 0; block < this.blocks; block++) {
        					var thisKey = this.makeKey(track, sector, block),
        						thisData = sessionStorage.getItem(thisKey);
        					if (thisData === null) {
        						return false;
        					}
        				}
        			}
            }
        		return true;
      }


        public blockIsActive(block) {
        	var activeBit = block.meta.slice(0, 1);
        	if (activeBit === "0") {
        		return false;
        	}
        	return true;
        };

        public getChainAddress(block) {
        	return block.meta.slice(1, this.metaSize);
        };

        public supportsHtml5Storage() {
        	try {
        		return 'sessionStorage' in window && window['sessionStorage'] !== null;
        	} catch (e) {
        		return false;
        	}
        }

        public update() {
        	var diskDiv = document.getElementById('divMemory');
        	var output = '<tbody>';
        	try {
        		for (var track = 0; track < this.tracks; track++) {
        			for (var sector = 0; sector < this.sectors; sector++) {
        				for (var block = 0; block < this.blocks; block++) {
        					var thisKey = this.makeKey(track, sector, block),
        						thisData = sessionStorage.getItem(thisKey);
        					  output += '<tr><td>' + thisKey + '</td>' + '<td>' + thisData.substring(0, 4) + '</td>' + '<td>' + thisData.substring(4) + '</td></tr>';
        				}
        			}
        		}
        		output += '</tbody>';
        		diskDiv.innerHTML = output;
        	} catch (e) {
        		diskDiv.innerHTML += '<p id="fileSystemError">File system needs to be formatted.</p>';
        	}

        }
    }
}
