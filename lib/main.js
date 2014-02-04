'use strict';

// loadreport Node module
// ----------
// to get phantomjs reporters path use
// require("loadreport").load_reports;
// require("loadreport").speedreports;
// require("loadreport").filmstrips;
(function(exports) {

  exports.load_reports = __dirname+"/loadreport.js";
  exports.speedreports = __dirname+"/speedreport.js";
  exports.filmstrips = __dirname+"/schedule-loadreport.js";

}(typeof exports === 'object' && exports || this));