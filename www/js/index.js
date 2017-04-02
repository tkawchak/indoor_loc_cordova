// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        document.getElementById('magnetometerGetReadingButton').addEventListener('click', getMagnetometerReading);
        document.getElementById('bluetoothStartScanButton').addEventListener('click', startScan);
        document.getElementById('bluetoothStopScanButton').addEventListener('click', stopScan);

        bluetoothle.initialize(initializeSuccess);
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function startScan() {
        bluetoothle.startScan(startScanSuccess, handleError);
    };

    function stopScan() {
        bluetoothle.stopScan(
            function () {
                console.log("stopping bluetooth scan.");
            },
            handleError
        )
    };

    function getMagnetometerReading() {
        console.log("getMagnetometerReading");
        cordova.plugins.magnetometer.getReading(
            function success(reading) {
                console.log(JSON.stringify(reading));
                // Output: {x: 23.113, y:-37.245, z:6.172, magnitude: 44.266}
            },
            function error(message) {
                console.log(message);
            }
        )
    };

    function initializeSuccess(result) {
        if (result.status === "enabled") {
            log("Bluetooth is enabled.");
            log(result);
        }
        else {
            document.getElementById("start-scan").disabled = true;
            log("Bluetooth is not enabled:", "status");
            log(result, "status");
        }
    };

    function handleError(error) {
        var msg;
        if (error.error && error.message) {
            var errorItems = [];
            if (error.service) {
                errorItems.push("service: " + (uuids[error.service] || error.service));
            }
            if (error.characteristic) {
                errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
            }
            msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
        }
        else {
            msg = error;
        }
        log(msg, "error");
        if (error.error === "read" && error.service && error.characteristic) {
            reportValue(error.service, error.characteristic, "Error: " + error.message);
        }
    };

    function log(msg, level) {
        level = level || "log";
        if (typeof msg === "object") {
            msg = JSON.stringify(msg, null, "  ");
        }
        console.log(msg);
        if (level === "status" || level === "error") {
            var msgDiv = document.createElement("div");
            msgDiv.textContent = msg;
            if (level === "error") {
                msgDiv.style.color = "red";
            }
            msgDiv.style.padding = "5px 0";
            msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
            document.getElementById("output").appendChild(msgDiv);
        }
    };

    var foundDevices = [];
    function startScan() {
        log("Starting scan for devices...", "status");
        foundDevices = [];
        document.getElementById("devices").innerHTML = "";
        document.getElementById("services").innerHTML = "";
        document.getElementById("output").innerHTML = "";
        if (window.cordova.platformId === "windows") {
            bluetoothle.retrieveConnected(retrieveConnectedSuccess, handleError, {});
        }
        else {
            bluetoothle.startScan(startScanSuccess, handleError, { services: [] });
        }
    };

    function startScanSuccess(result) {
        log("startScanSuccess(" + result.status + ")");
        if (result.status === "scanStarted") {
            log("Scanning for devices (will continue to scan until you select a device)...", "status");
        }
        else if (result.status === "scanResult") {
            if (!foundDevices.some(function (device) {
                return device.address === result.address;
            })) {
                log('FOUND DEVICE:');
                log(result);
                foundDevices.push(result);
                addDevice(result.name, result.address);
            }
        }
    };

    function retrieveConnectedSuccess(result) {
        log("retrieveConnectedSuccess()");
        log(result);
        result.forEach(function (device) {
            addDevice(device.name, device.address);
        });
    };

    function addDevice(name, address) {
        var button = document.createElement("button");
        button.style.width = "100%";
        button.style.padding = "10px";
        button.style.fontSize = "16px";
        button.textContent = name + ": " + address;
        button.addEventListener("click", function () {
            document.getElementById("services").innerHTML = "";
            connect(address);
        });
        document.getElementById("devices").appendChild(button);
    };

} )();