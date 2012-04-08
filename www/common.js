
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
var socket = null;
var filelist;
var filter;

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

function registerDevice() {

  var populatefiles = function() {
    //console.log('flist length:'+filelist.length+' $(#filelist)='+$('#filelist'));
    var dir = {}; // for keeping a unique list of directories

    $('#filelist li').remove(); // remove all files from the document list

    var back_li = false;
    for (var i=0;i<filelist.length;i++) {
      var item = filelist[i].file; // shorthand

      // only want files belonging to the filter path
      if ( filter ) {
        if ( item.indexOf(filter) !== 0 ) continue; // item prefix doesn't match the filter, discard this item
        else {
          item = item.slice(filter.length); // remove the filter portion from the item
        }
      }
      
      // weed out duplicate dir listings
      if ( item.indexOf('/') !== -1 ) {
        item = item.slice(0,item.indexOf('/')+1); // top level directory
        if ( dir[item] ) continue; // we have seen this dir before
        else {
          dir[item] = true; // remember this dir for next time
        }
      }
      
      if ( back_li === false && filter ) {
        $('#filelist').append('<li><a href="#"><p>..</p></a></li>');
        back_li = true;
      }
      var s = '<li><a href="#"><p>'+item+'</p></a></li>';
      $('#filelist').append(s);
    }
    
    $("#filelist li").on("click", function (event) {
      var fname = (filter?filter:'')+$(this).text();
      console.log('filter:('+filter+') text:('+$(this).text()+') fname:('+fname+')');

      // if its a directory, then filter on!
      if ( fname.lastIndexOf('/') === fname.length-1 ) {
        filter = fname; // reset the filter to current directory
        populatefiles();
        return;
      } else if ( fname.lastIndexOf('..') == fname.length-2 ) {
        filter = fname.slice(0,fname.length-3); // remove '/..' from 'hello/world/..'
        filter = filter.slice(0,filter.lastIndexOf('/')+1); // remove 'world' from 'hello/world'
        populatefiles();
        return;
      }
      
      // its a file, lets open it on the mac!
      socket.emit('openfile',fname);
    });
    
    $('#filelist').listview('refresh');
  };
  
  if ( socket ) {
    populatefiles();
    return;
  }
  
  var user = 'sumeet';
  var socket = io.connect('http://localhost:3000');
  
  socket.on('connect', function() {
    console.log('connected to http://localhost:3000');
    socket.emit('adddevice','sumeet');
  });
  
  socket.on('filelist', function(flist) {
    console.log('recieved file list:'+flist.length);
    filelist = flist;
    populatefiles();
  });
}

function onDeviceReady() {
  isPhoneGapReady = true;
  deviceUUID = device.uuid;

  deviceDetection();
  networkDetection();  
  drawTabBar(currentPage);  
  executeEvents();
  registerDevice();

  $(document).bind("mobileinit", function()
  {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
  });
  
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
      "Folders",
      "33-cabinet.png",
      { "onSelect": function() {
          //alert('index.html');
          $.mobile.changePage( "index.html" );
        }
      }
    );

    // Locate collaborator mode
    nativeControls.createTabBarItem(
      "Map",
      "Activities",
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
      "Connect",
      "32-iphone.png",
      { "onSelect": function() {
          //alert('about');
          $.mobile.changePage( "screen.html" );
        }
      }
    );

    // Compile the TabBar
    nativeControls.showTabBar({ 'position' : 'top' });
    nativeControls.showTabBarItems("Index", "Map", "Screen");
    tabBarDrawn = true;
    /*
    nativeControls.createToolBar('20','top','Default');
    nativeControls.setToolBarTitle('YouSendIt Connect');
    nativeControls.showToolBar(); */   
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