var exec = require('child_process').exec;

var increment = 0;

function runLoadreport(){
    exec('phantomjs loadreport.js http://www.people.com performance csv', function (error, stdout, stderr) {
        exec('mv reports/loadreport.csv reports/loadreport-' + increment + '.csv', function(error, stdout, stderr){
        	console.log('CSV ' + increment + ' done.');
        });
    });
    exec('phantomjs loadreport.js http://www.people.com performancecache json', function (error, stdout, stderr) {
        exec('mv reports/loadreport.json reports/loadreport-' + increment + '.json', function(error, stdout, stderr){
        	console.log('JSON ' + increment + ' done.');
        });
    });
    exec('phantomjs loadreport.js http://www.people.com filmstrip', function (error, stdout, stderr) {
        exec('mkdir filmstrip/filmstrip-' + increment, function(error, stdout, stderr){
        	exec('mv filmstrip/screenshot*.png filmstrip/filmstrip-' + increment + '/', function(error, stdout, stderr){
        		console.log('Filmstrip ' + increment + ' done.')
        	});
        });
    });
    makeTimeout();
    increment++;    
}

function makeTimeout(){
    var d = new Date();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    if((min == '00') && (sec == '00')) {
        runLoadreport();
    } else {
        setTimeout(runLoadreport, (60*(60-min)+(60-sec))*1000);
    }            
}

makeTimeout();