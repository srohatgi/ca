
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
var currentUrl;
var internetInterval;

function init(url) {
  if (typeof url != 'string') {
    currentUrl = location.href;
  } else {
    currentUrl = url;
  }

  if (isPhoneGapReady) {
    onDeviceReady();
  } else {
    // Add an event listener for deviceready
    document.addEventListener("deviceready", onDeviceReady, false);
  }
}

function onDeviceReady() {
  isPhoneGapReady = true;
  deviceUUID = device.uuid;
  deviceDetection();
  networkDetection();
  executeEvents();
  executeCallback();
}

function executeEvents() {
  if (isPhoneGapReady) {
    // attach events for online and offline detection
    document.addEventListener("online", onOnline, false);
    document.addEventListener("offline", onOffline, false);

    // attach events for pause and resume detection
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    // set a timer to check the network status
    internetInterval = window.setInterval(function() {
      if (navigator.network.connection.type != Connection.NONE) {
        onOnline();
      } else {
        onOffline();
      }
    }, 5000);
  }
}

// call an on<Page>Load() function if it exists 
function executeCallback() {
  //alert('fired event isPhoneGapReady:'+isPhoneGapReady+" currentUrl:"+currentUrl);
  if (isPhoneGapReady) {
    // get the name of the current html page
    var pages = currentUrl.split("/");
    var currentPage = pages[pages.length - 1].
    slice(0, pages[pages.length - 1].indexOf(".html"));

    // capitalize the first letter and execute the function
    currentPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    if (typeof window['on' + currentPage + 'Load'] == 'function') {
      window['on' + currentPage + 'Load']();
    }
  }
}

function onOnline() {
  isConnected = true;
}

function onOffline() {
  isConnected = false;
  alert("Please connect your " + device.platform + " to the network!");  
}

function onPause() {
  isPhoneGapReady = false;

  // clear the Internet check interval
  window.clearInterval(internetInterval);
}

function onResume() {
  // don't run if phonegap is already ready
  if (isPhoneGapReady == false) {
    init(currentUrl);
  }
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

// This gets called by jQuery mobile when the page has loaded
$(document).bind("pageload", function(event, data) {
  init(data.url);
});

// Set an onload handler to call the init function
window.onload = init;