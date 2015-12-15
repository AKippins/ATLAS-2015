///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem(tracks, sectors, blocks, bytes, metaSize) {
            if (tracks === void 0) { tracks = 4; }
            if (sectors === void 0) { sectors = 8; }
            if (blocks === void 0) { blocks = 8; }
            if (bytes === void 0) { bytes = 64; }
            if (metaSize === void 0) { metaSize = 4; }
            _super.call(this, this.krnFileSystemDriverEntry, this.krnFileSystemISR);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.bytes = bytes;
            this.metaSize = metaSize;
            // Override the base method pointers.
        }
        DeviceDriverFileSystem.prototype.init = function () {
            this.krnFileSystemDriverEntry;
            this.krnFileSystemISR;
        };
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            this.status = "loaded";
            this.update();
        };
        DeviceDriverFileSystem.prototype.krnFileSystemISR = function (params) {
        };
        DeviceDriverFileSystem.prototype.createFile = function (name) {
            var result = {
                'status': 'error',
                'message': '',
                'data': ''
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
        };
        DeviceDriverFileSystem.prototype.writeFile = function (name, data) {
            var result = {
                'status': 'error',
                'message': '',
                'data': ''
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
        };
        DeviceDriverFileSystem.prototype.readFile = function (name) {
            var result = {
                'status': 'error',
                'message': '',
                'data': ''
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
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (name, deleteAddr) {
            var result = {
                'status': 'error',
                'message': '',
                'data': ''
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
        };
        DeviceDriverFileSystem.prototype.listDirectory = function () {
            var result = {
                'status': 'error',
                'message': '',
                'data': []
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
                        result.data.push({ 'key': thisData.key, 'name': thisData.data });
                    }
                }
            }
            result.status = 'success';
            result.message = 'Successfully read the file system directory.';
            return result;
        };
        DeviceDriverFileSystem.prototype.readData = function (key) {
            var data = sessionStorage.getItem(key), returnValue = {
                "key": key,
                "meta": "",
                "data": ""
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
        };
        DeviceDriverFileSystem.prototype.dataSize = function () {
            return this.bytes - this.metaSize;
        };
        DeviceDriverFileSystem.prototype.zeroOut = function () {
            var zeroedOut = "";
            for (var x = 0; x < this.bytes; x++) {
                zeroedOut += "0";
            }
            return zeroedOut;
        };
        DeviceDriverFileSystem.prototype.format = function () {
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
        };
        DeviceDriverFileSystem.prototype.makeMBR = function () {
            var addBlock = this.readData(this.makeKey(0, 0, 0));
            // Write the MBR to the file system
            var write = this.handleWriteData(addBlock, "MBR");
        };
        DeviceDriverFileSystem.prototype.makeKey = function (t, s, b) {
            return String(t) + String(s) + String(b);
        };
        DeviceDriverFileSystem.prototype.handleWriteData = function (block, data) {
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
        };
        DeviceDriverFileSystem.prototype.readBlocks = function (key) {
            var currentData = this.readData(key);
            var data = currentData.data;
            while (this.blockHasAddr(currentData.meta)) {
                currentData = this.readData(this.getChainAddress(currentData));
                data += currentData.data;
            }
            return data;
        };
        DeviceDriverFileSystem.prototype.blockHasAddr = function (metaData) {
            var link = metaData.substring(1, this.metaSize);
            if (link !== "" && link !== "---") {
                return true;
            }
            return false;
        };
        DeviceDriverFileSystem.prototype.formatStringForSingleBlock = function (str) {
            return this.padDataString(this.formatString(str));
        };
        DeviceDriverFileSystem.prototype.formatString = function (str) {
            var data = "";
            for (var i = 0; i < str.length; i++) {
                data += str.charCodeAt(i).toString(16);
            }
            return data;
        };
        DeviceDriverFileSystem.prototype.padDataString = function (data) {
            var zeroedOut = this.zeroOut();
            return (data + zeroedOut).slice(0, this.dataSize());
        };
        DeviceDriverFileSystem.prototype.availableAddr = function () {
            for (var sector = 0; sector < this.sectors; sector++) {
                for (var block = 0; block < this.blocks; block++) {
                    var thisKey = this.makeKey(0, sector, block), thisData = this.readData(thisKey);
                    if (!this.blockIsActive(thisData)) {
                        return thisKey;
                    }
                }
            }
            return 'na';
        };
        DeviceDriverFileSystem.prototype.findAddr = function (name) {
            for (var sector = 0; sector < this.sectors; sector++) {
                for (var block = 0; block < this.blocks; block++) {
                    var thisKey = this.makeKey(0, sector, block), thisData = this.readData(thisKey);
                    if (thisData.data === name) {
                        return thisKey;
                    }
                }
            }
            return 'na';
        };
        DeviceDriverFileSystem.prototype.availableFile = function () {
            for (var track = 1; track < this.tracks; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        var thisKey = this.makeKey(track, sector, block), thisData = this.readData(thisKey);
                        if (!this.blockIsActive(thisData)) {
                            return thisKey;
                        }
                    }
                }
            }
            return 'na';
        };
        DeviceDriverFileSystem.prototype.fileSystemReady = function () {
            for (var track = 0; track < this.tracks; track++) {
                for (var sector = 0; sector < this.sectors; sector++) {
                    for (var block = 0; block < this.blocks; block++) {
                        var thisKey = this.makeKey(track, sector, block), thisData = sessionStorage.getItem(thisKey);
                        if (thisData === null) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        DeviceDriverFileSystem.prototype.blockIsActive = function (block) {
            var activeBit = block.meta.slice(0, 1);
            if (activeBit === "0") {
                return false;
            }
            return true;
        };
        ;
        DeviceDriverFileSystem.prototype.getChainAddress = function (block) {
            return block.meta.slice(1, this.metaSize);
        };
        ;
        DeviceDriverFileSystem.prototype.supportsHtml5Storage = function () {
            try {
                return 'sessionStorage' in window && window['sessionStorage'] !== null;
            }
            catch (e) {
                return false;
            }
        };
        DeviceDriverFileSystem.prototype.update = function () {
            var diskDiv = document.getElementById('divMemory');
            var output = '<tbody>';
            try {
                for (var track = 0; track < this.tracks; track++) {
                    for (var sector = 0; sector < this.sectors; sector++) {
                        for (var block = 0; block < this.blocks; block++) {
                            var thisKey = this.makeKey(track, sector, block), thisData = sessionStorage.getItem(thisKey);
                            output += '<tr><td>' + thisKey + '</td>' + '<td>' + thisData.substring(0, 4) + '</td>' + '<td>' + thisData.substring(4) + '</td></tr>';
                        }
                    }
                }
                output += '</tbody>';
                diskDiv.innerHTML = output;
            }
            catch (e) {
                diskDiv.innerHTML += '<p id="fileSystemError">File system needs to be formatted.</p>';
            }
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
