var util  = require('util'),
  fs = require('fs'),
  spawn = require('child_process').spawn;

var Spawn = function(command, args, directory) {
  var dir = directory || '/Users/sumeet/YouSendIt/';
  var pr = spawn(command, args, { cwd: dir });

  pr.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  pr.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pr.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });
};

var Walk = function(dir, done) {
  var results = [];
  var reorder_list = function(res) {
    res.sort(function (a,b) {
      if (a.atime <= b.atime ) return 1;
      else return -1;
    });
    return res;
  };
  
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    
    var pending = list.length;
    if (!pending) return done(null, reorder_list(results));
    
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          // recurse
          Walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, reorder_list(results));
          });
        } else {
          results.push({file: file.replace(/^\/Users\/sumeet\/YouSendIt\//i,''), mtime: stat.mtime.getTime(), atime: stat.atime.getTime()});
          if (!--pending) done(null, reorder_list(results));
        }
      });
    });
    
  });
};

exports.Spawn = Spawn;
exports.Walk = Walk;

//Spawn('open', ['cto.docx'],'/Users/sumeet/Documents');
//Walk('/Users/sumeet/YouSendIt', function(err,results) { if (!err) console.log(results); else console.log('error:'+err); });