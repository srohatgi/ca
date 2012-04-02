var express = require('express')
  , routes = require('./routes');
  
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var ua = require('./useragent');

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/doc', routes.doc);

var devices = {};

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    console.log("connection User-Agent:"+handshakeData.headers['user-agent']);
    handshakeData['parsed_user_agent'] = ua.parse(handshakeData.headers['user-agent']);
    console.log('conn query:'+JSON.stringify(handshakeData.query));
    callback(null,true);
  });
});

io.sockets.on('connection', function (socket) {
  
  socket.on('share_request', function (session) {
    // session {
    //   device: the device who gets sent the share request,
    //   doc_id: the doc_id to be shared 
    // }
    var msg = { req_user: socket.device, doc_id: session.doc_id };
    devices[socket.device].emit('fetch_session', msg);
  });
    
  socket.on('add_device', function(username){
    // create a unique device handle
    var a = socket.handshake['parsed_user_agent'];
    var token = username+"'s "+a.platform.name+' '+a.browser.name+' '+a.engine.name;
    
    socket.device_id = token;
    devices[socket.device_id] = socket;
      
    io.sockets.emit('update_devices', devices);    
  });
    
  socket.on('disconnect', function(){
    delete devices[socket.device_id];
    io.sockets.emit('updatedevices', devices);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);