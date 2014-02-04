'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var readline = require('readline');
var optimist = require('optimist');

// provide a built in webserver
// ----------
// useful to browse speedreport results.
(function(exports) {

  // **parse command line arguments**
  var argv = optimist.usage('Phantomizer command line')

    // --www_dir [some/path/]
    .describe('www_dir', 'Initialize the project file systems environment')
    .string('www_dir')
    .default('www_dir', "");

  // **setup the www dir**
  var www_dir = path.resolve(__dirname+"/../");
  www_dir = argv.www_dir || www_dir;

  // **setup the webserver**
  var app = express();
  app.use(express.logger());
  app.use(express.directory(www_dir))
  app.use(express.static(www_dir));
  var app_server = http.createServer(app).listen(8080);

  console.log("");
  console.log("Mounted host : http://localhost:8080/");
  console.log("Mounted path : "+www_dir);
  console.log("");

  // **setup end listener**
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.question('Press enter to leave...\n', function(answer) {
    app_server.close();
    process.exit(1)
  });

}(typeof exports === 'object' && exports || this));