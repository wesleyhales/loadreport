var page = require('webpage').create(),
    system = require('system'),
    t, address;

address = system.args[1];

page.onConsoleMessage = function (msg) {
  console.log(msg)
}

page.onInitialized = function () {
//  page.evaluate(function () {
  loadreport(performance)

};


page.open(address, function (status) {
  var result;

    console.log('Network status:', status, address);

    console.log(page.evaluate(function () {
      console.log('############################ evaluate')
      var now = new Date().getTime(),
          timing = performance.timing,
          report = {};

      console.log(performance.now(), now);

      //high level load times
      report.pageLoadTime = {label: 'Total time to load page', value: timing.loadEventEnd - timing.navigationStart};

      report.perceivedLoadTime = {label: 'User-perceived page load time', value: 0};

      //time spent making request to server and receiving the response - after network lookups and nego
      report.requestResponse = {label: 'Calculate time from request start to response end', value: timing.responseEnd - timing.requestStart};

      //network level redirects
      report.redirectTime = {label: 'Time spent during redirect', value: timing.redirectEnd - timing.redirectStart};

      //time spent in app cache, domain lookups, and making secure connection
      report.fetchTime = {label: 'Fetch start to response end', value: timing.connectEnd - timing.fetchStart};

      //time spent processing page
      report.pageProcessTime = {label: 'Total time spent processing page', value: timing.loadEventStart - timing.domLoading};

      for (var key in report) {

        console.log('----', report[key].label, report[key].value)

      }


      console.log('connectStart', timing.connectStart);

      console.log('navigationStart', timing.navigationStart);

      console.log('secureConnectionStart', timing.secureConnectionStart);

      console.log('fetchStart', timing.fetchStart);

      console.log('domContentLoadedEventStart', timing.domContentLoadedEventStart);

      console.log('responseStart', timing.responseStart);

      console.log('domInteractive', timing.domInteractive);

      console.log('domainLookupEnd', timing.domainLookupEnd);

      console.log('redirectStart', timing.redirectStart);

      console.log('requestStart', timing.requestStart);

      console.log('unloadEventEnd', timing.unloadEventEnd);

      console.log('unloadEventStart', timing.unloadEventStart);

      console.log('domComplete', timing.domComplete);

      console.log('domainLookupStart', timing.domainLookupStart);

      console.log('loadEventStart', timing.loadEventStart);

      console.log('domContentLoadedEventEnd', timing.domContentLoadedEventEnd);

      console.log('redirectEnd', timing.redirectEnd);

      console.log('connectEnd', timing.connectEnd);

      console.log('responseEnd', timing.responseEnd);

      console.log('domLoading', timing.domLoading);

      console.log('loadEventEnd', timing.loadEventEnd);
    }));


});


function loadreport(performance){
  var now = new Date().getTime(),
      timing = performance.timing,
      report = {};

  console.log(performance.now(), now);

  //high level load times
  report.pageLoadTime = {label: 'Total time to load page', value: timing.loadEventEnd - timing.navigationStart};

  report.perceivedLoadTime = {label: 'User-perceived page load time', value: 0};

  //time spent making request to server and receiving the response - after network lookups and nego
  report.requestResponse = {label: 'Calculate time from request start to response end', value: timing.responseEnd - timing.requestStart};

  //network level redirects
  report.redirectTime = {label: 'Time spent during redirect', value: timing.redirectEnd - timing.redirectStart};

  //time spent in app cache, domain lookups, and making secure connection
  report.fetchTime = {label: 'Fetch start to response end', value: timing.connectEnd - timing.fetchStart};

  //time spent processing page
  report.pageProcessTime = {label: 'Total time spent processing page', value: timing.loadEventStart - timing.domLoading};

  for (var key in report) {

    console.log('----', report[key].label, report[key].value)

  }


  console.log('connectStart', timing.connectStart);

  console.log('navigationStart', timing.navigationStart);

  console.log('secureConnectionStart', timing.secureConnectionStart);

  console.log('fetchStart', timing.fetchStart);

  console.log('domContentLoadedEventStart', timing.domContentLoadedEventStart);

  console.log('responseStart', timing.responseStart);

  console.log('domInteractive', timing.domInteractive);

  console.log('domainLookupEnd', timing.domainLookupEnd);

  console.log('redirectStart', timing.redirectStart);

  console.log('requestStart', timing.requestStart);

  console.log('unloadEventEnd', timing.unloadEventEnd);

  console.log('unloadEventStart', timing.unloadEventStart);

  console.log('domComplete', timing.domComplete);

  console.log('domainLookupStart', timing.domainLookupStart);

  console.log('loadEventStart', timing.loadEventStart);

  console.log('domContentLoadedEventEnd', timing.domContentLoadedEventEnd);

  console.log('redirectEnd', timing.redirectEnd);

  console.log('connectEnd', timing.connectEnd);

  console.log('responseEnd', timing.responseEnd);

  console.log('domLoading', timing.domLoading);

  console.log('loadEventEnd', timing.loadEventEnd);



}
