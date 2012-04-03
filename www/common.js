
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
var currentPage;
var internetInterval;
var tabBarDrawn = false;

function init(url) {
  if (typeof url != 'string') {
    currentUrl = location.href;
  } else {
    currentUrl = url;
  }
  
  var parts = currentUrl.split("/");
  currentPage = parts[parts.length - 1].slice(0, parts[parts.length - 1].indexOf(".html"));
  // capitalize the first letter and execute the function
  currentPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  if (isPhoneGapReady) {
    onDeviceReady();
  } else {
    // Add an event listener for deviceready
    document.addEventListener("deviceready", onDeviceReady, false);
    window.addEventListener("resize", orientationChange, false);
  }
}

function onDeviceReady() {
  isPhoneGapReady = true;
  deviceUUID = device.uuid;

  deviceDetection();
  networkDetection();  
  drawTabBar(currentPage);  
  executeEvents();

  //alert('calling on'+currentPage+'Load()');
  if (typeof window['on' + currentPage + 'Load'] == 'function') {
    window['on' + currentPage + 'Load']();
  }
}

function drawTabBar() {
  if ( !isPhoneGapReady ) return;
  
  if ( !tabBarDrawn ) {
    // Initializating TabBar
    nativeControls = window.plugins.nativeControls;
    nativeControls.createTabBar();

    // Listing/ preview of files mode
    nativeControls.createTabBarItem(
      "Index",
      "Home",
      "53-house.png",
      { "onSelect": function() {
          //alert('index.html');
          $.mobile.changePage( "index.html" );
        }
      }
    );

    // Locate collaborator mode
    nativeControls.createTabBarItem(
      "Map",
      "Locate",
      "112-group.png",
      { "onSelect": function() {
          //alert('map.html');
          $.mobile.changePage( "map.html" );
        }
      }
    );

    // Share screen mode
    nativeControls.createTabBarItem(
      "Screen",
      "Share",
      "32-iphone.png",
      { "onSelect": function() {
          //alert('about');
          $.mobile.changePage( "map.html" );
        }
      }
    );

    // Compile the TabBar
    nativeControls.showTabBar({ 'position' : 'top' });
    nativeControls.showTabBarItems("Index", "Map", "Screen");
    tabBarDrawn = true;
  }  
  nativeControls.selectTabBarItem(currentPage);
}

function orientationChange() {
  var nativeControls = window.plugins.nativeControls;
  nativeControls.resizeTabBar();
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