
// Global variable that will tell us whether PhoneGap is ready
var isPhoneGapReady = false;
var isConnected = false;

// Default all phone types to false
var isAndroid = false;
var isBlackberry = false;
var isIphone = false;
var isWindows = false;

// Store the device's uuid
var deviceUUID;

function init() {
  // Add an event listener for deviceready
  document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
  // set to true
  isPhoneGapReady = true;
  deviceUUID = device.uuid;
  deviceDetection();
  networkDetection();
  
  // attach events for online and offline detection
  document.addEventListener("online", onOnline, false);
  document.addEventListener("offline", onOffline, false);

  // set a timer to check the network status
  internetInterval = window.setInterval(function() {
    if (navigator.network.connection.type != Connection.NONE) {
      onOnline();
    } else {
      onOffline();
    }
  }, 5000);
        
}

function onOnline() {
  isConnected = true;
}

function onOffline() {
  isConnected = false;
  alert("Please connect your " + device.platform + " to the network!");  
}

function deviceDetection() {
  if (isPhoneGapReady) {
    switch (device.platform) {
      case "Android":
        isAndroid = true;
        break;
      case "Blackberry":
        isBlackberry = true;
        break;
      case "iPhone":
        isIphone = true;
        break;
      case "WinCE":
        isWindows = true;
        break;
    }
  }
}

function networkDetection() {
  if (isPhoneGapReady) {
    // as long as the connection type is not none, 
    // the device should have Internet access
    if (navigator.network.connection.type != Connection.NONE) {
      isConnected = true;
    }
  }
}

// Set an onload handler to call the init function
window.onload = init;