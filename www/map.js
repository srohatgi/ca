var mapScriptLoaded = false;

function onMapLoad() {
  //alert('calling http://maps.googleapis.com/maps/api/js?sensor=true&callback=getGeolocation');
  if (isConnected && !mapScriptLoaded) {
    // load the google api
    var fileref=document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", "http://maps.googleapis.com/maps/api/js?sensor=true&callback=getGeolocation");
    document.getElementsByTagName("head")[0].appendChild(fileref);
    mapScriptLoaded = true;
  } else if ( !isConnected ) {
    alert("Must be connected to the Internet");
  } else {
    //alert('drawing the map!');
    getGeolocation();
  }
  //alert('hello');
  createActivityStream('#activities',[ 
    { n: 'Mihir', v: 'updated Product Roadmap folder', d: '8:00PM'},
    { n: 'Sumeet', v: 'invited Stanford to Engineering folder', d: '3 APR'},
    { n: 'Varun', v: 'downloaded Mobile.pptx', d: '3 APR'},
    { n: 'Brian', v: 'commented on Product Roadmap', d: '1 APR'},
    { n: 'Stanford', v: 'created Technology Strategy', d: '1 APR'},
  ]);  
}

function createActivityStream(e_id,items) {
  var li_tag = '';
  //alert('e_id='+e_id+' li_tag='+li_tag);
  for (var r=0;r<items.length;r++) {
    li_tag += '<li>'+
              '<a href="index.html"><h3>'+items[r].n+'</h3><p>'+items[r].v+'</p><p class="ui-li-aside"><strong>'+items[r].d+'</strong></p></a>'+
              '<a href="index.html"/>'+
              '</li>';
  }
  //alert('e_id='+e_id+' li_tag='+li_tag);
  $(e_id).append('<ul data-role="listview" data-theme="c">'+li_tag+'</ul>').trigger("create");; 
}


// get the user's gps coordinates and display map
function getGeolocation() {
  var options = {
    maximumAge: 3000,
    timeout: 5000,
    enableHighAccuracy: true
  };
  navigator.geolocation.getCurrentPosition(loadMap, geoError, options);
}

function loadMap(position) {
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  var myOptions = {
    zoom: 8,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var mapObj = document.getElementById('map_canvas');
  var map = new google.maps.Map(mapObj, myOptions);

  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title:"You"
  });
}

function geoError(error) {
  alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}