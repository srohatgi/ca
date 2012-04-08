var express = require('express')
  , routes = require('./routes')
  , Spawn = require('./spawn').Spawn
  , Walk = require('./spawn').Walk;
  

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var ua = require('./useragent');

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

app.get('/', function(req, res) {
  res.render('index.jade', {locals: {title: 'Activity Feeds' }});
  //res.sendfile(__dirname + '/feed.html');
});

var devices = {};
var feed = new Array();

io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    console.log("connection User-Agent:"+handshakeData.headers['user-agent']);
    handshakeData['parsed_user_agent'] = ua.parse(handshakeData.headers['user-agent']);
    console.log('conn query:'+JSON.stringify(handshakeData.query));
    callback(null,true);
  });
});


io.sockets.on('connection', function (socket) {
  
  socket.on('openfile', function (filename) {
    Spawn('open',[filename]);
  });
    
  socket.on('adddevice', function(user){
    var a = socket.handshake['parsed_user_agent'];
    var token = user+"'s "+a.platform.name+' '+a.browser.name+' '+a.engine.name;
    
    socket.username = token;
    devices[token] = '/'+a.platform.name+'_'+a.browser.name+'_'+a.engine.name+'.png';
      
    Walk(process.env.HOME+'/YouSendIt', function(err, filelist) {
      if (err) throw err;
      console.log('sending back file list of length:'+filelist.length);
      socket.emit('filelist', filelist);
    });
  });
    
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete devices[socket.username];
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);