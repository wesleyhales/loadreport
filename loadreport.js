var fs = require('fs');
var confess = {

    run: function () {
        var cliConfig = {};
        confess.performancecache = this.clone(confess.performance);
        if (!this.processArgs(cliConfig, [
            {
                name: 'url',
                def: 'http://google.com',
                req: true,
                desc: 'the URL of the app to cache'
            }, {
                name: 'task',
                def: 'performance',
                req: false,
                desc: 'the task to perform',
                oneof: ['performance', 'performancecache', 'filmstrip']
            }, {
                name: 'configFile',
                def: 'config.json',
                req: false,
                desc: 'a local configuration file of further confess settings'
            }
        ])) {
            //phantom.exit();
            return;
        }
        this.config = this.mergeConfig(cliConfig, cliConfig.configFile);
        var task = this[this.config.task];
        this.load(this.config, task, this);
    },

    performance: {
        resources: [],
        count1 : 100,
        count2 : 1,
        timer : 0,
        evalConsole : {},
        evalConsoleErrors : [],
        onInitialized: function(page, config) {
            var pageecal = page.evaluate(function(startTime) {
                var now = new Date().getTime();

                var _timer1=setInterval(function(){
                    if(/interactive/.test(document.readyState)){
                        clearInterval(_timer1);
                        console.log('interactive-' + (new Date().getTime() - startTime));
                    }
                }, 10);

                var _timer2=setInterval(function(){
                    if(/loaded|complete/.test(document.readyState)){
                        clearInterval(_timer2);
                        console.log('complete-' + (new Date().getTime() - startTime));
                    }
                }, 10);

                window.onload = function(){console.log('onload-' + (new Date().getTime() - startTime));};

                window.onerror = function(message, url, linenumber) {
                    console.log("jserror-JavaScript error: " + message + " on line " + linenumber + " for " + url);
                };
            },this.performance.start);
        },
        onLoadStarted: function (page, config) {
            if (!this.performance.start) {
                this.performance.start = new Date().getTime();
            }
        },
        onResourceRequested: function (page, config, request) {
            var now = new Date().getTime();
            this.performance.resources[request.id] = {
                id: request.id,
                url: request.url,
                request: request,
                responses: {},
                duration: '',
                times: {
                    request: now
                }
            };
            if (!this.performance.start || now < this.performance.start) {
                this.performance.start = now;
            }

        },
        onResourceReceived: function (page, config, response) {
            var now = new Date().getTime(),
                resource = this.performance.resources[response.id];
            resource.responses[response.stage] = response;
            if (!resource.times[response.stage]) {
                resource.times[response.stage] = now;
                resource.duration = now - resource.times.request;
            }
            if (response.bodySize) {
                resource.size = response.bodySize;
                response.headers.forEach(function (header) {
                });
            } else if (!resource.size) {
                response.headers.forEach(function (header) {
                    if (header.name.toLowerCase()=='content-length' && header.value != 0) {
                        //console.log('backup-------' + header.name + ':' + header.value);
                        resource.size = parseInt(header.value);
                    }
                });
            }
        },
        onLoadFinished: function (page, config, status) {
            var start = this.performance.start,
                finish =  new Date().getTime(),
                resources = this.performance.resources,
                slowest, fastest, totalDuration = 0,
                largest, smallest, totalSize = 0,
                missingList = [],
                missingSize = false,
                elapsed = finish - start,
                now = new Date();

            resources.forEach(function (resource) {
                if (!resource.times.start) {
                    resource.times.start = resource.times.end;
                }
                if (!slowest || resource.duration > slowest.duration) {
                    slowest = resource;
                }
                if (!fastest || resource.duration < fastest.duration) {
                    fastest = resource;
                }
                //console.log(totalDuration);
                totalDuration += resource.duration;

                if (resource.size) {
                    if (!largest || resource.size > largest.size) {
                        largest = resource;
                    }
                    if (!smallest || resource.size < smallest.size) {
                        smallest = resource;
                    }
                    totalSize += resource.size;
                } else {
                    resource.size = 0;
                    missingSize = true;
                    missingList.push(resource.url);
                }
            });

            if (config.verbose) {
                console.log('');
                this.emitConfig(config, '');
            }

            var report = {};
            report.url = phantom.args[0];
            report.phantomCacheEnabled = phantom.args.indexOf('yes') >= 0 ? 'yes' : 'no';
            report.taskName = config.task;
            var drsi = parseInt(this.performance.evalConsole.interactive);
            report.domReadystateInteractive = isNaN(drsi) == false ? drsi : 0;
            var wo = parseInt(this.performance.evalConsole.onload);
            report.windowOnload = isNaN(wo) == false ? wo : 0;
            var drsc = parseInt(this.performance.evalConsole.complete);
            report.domReadystateComplete = isNaN(drsc) == false ? drsc : 0;
            report.elapsedLoadTime = elapsed;
            report.numberOfResources = resources.length-1;
            report.totalResourcesTime = totalDuration;
            report.slowestResource = slowest.url;
            report.largestResource = largest.url;
            report.totalResourcesSize = (totalSize / 1000);
            report.nonReportingResources = missingList.length;
            report.timeStamp = now.getTime();
            report.date = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear();
            report.time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            report.errors = this.performance.evalConsoleErrors;


            //console.log(JSON.stringify(report));
            console.log('Elapsed load time: ' + this.pad(elapsed, 6) + 'ms');

            if(phantom.args.indexOf('csv') >= 0){
                this.printToFile(config,report,'confess-report','csv',phantom.args.indexOf('wipe') >= 0);
            }

            if(phantom.args.indexOf('json') >= 0){
                this.printToFile(config,report,'confess-report','json',phantom.args.indexOf('wipe') >= 0);
            }

//            if (config.verbose) {
//                console.log('');
//                var ths = this,
//                    length = 104,
//                    ratio = length / elapsed,
//                    bar;
//                resources.forEach(function (resource) {
//                    bar = ths.repeat(' ', (resource.times.request - start) * ratio) +
//                        ths.repeat('-', (resource.times.start - resource.times.request) * ratio) +
//                        ths.repeat('=', (resource.times.end - resource.times.start) * ratio)
//                    ;
//                    bar = bar.substr(0, length) + ths.repeat(' ', length - bar.length);
//                    console.log(ths.pad(resource.id, 3) + '|' + bar + '|');
//                });
//                console.log('');
//                resources.forEach(function (resource) {
//                    console.log(
//                        ths.pad(resource.id, 3) + ': ' +
//                            ths.pad(resource.duration, 6) + 'ms; ' +
//                            ths.pad(resource.size, 7) + 'b; ' +
//                            ths.truncate(resource.url, 84)
//                    );
//                });
//            }

        }


    },

    filmstrip: {
        onInitialized: function(page, config) {
            this.screenshot(new Date().getTime(),page);
        },
        onLoadStarted: function (page, config) {
            if (!this.performance.start) {
                this.performance.start = new Date().getTime();
            }
            this.screenshot(new Date().getTime(),page);
        },
        onResourceRequested: function (page, config, request) {
            this.screenshot(new Date().getTime(),page);
        },
        onResourceReceived: function (page, config, response) {
            this.screenshot(new Date().getTime(),page);
        },

        onLoadFinished: function (page, config, status) {
            this.screenshot(new Date().getTime(),page);
        }
    },

    getFinalUrl: function (page) {
        return page.evaluate(function () {
            return document.location.toString();
        });
    },

    emitConfig: function (config, prefix) {
        console.log(prefix + 'Config:');
        for (key in config) {
            if (config[key].constructor === Object) {
                if (key===config.task) {
                    console.log(prefix + ' ' + key + ':');
                    for (key2 in config[key]) {
                        console.log(prefix + '  ' + key2 + ': ' + config[key][key2]);
                    }
                }
            } else {
                console.log(prefix + ' ' + key + ': ' + config[key]);
            }
        }
    },

    load: function (config, task, scope) {
        var page = new WebPage(),
            pagetemp = new WebPage(),
            event;



//        if (config.consolePrefix) {
//            page.onConsoleMessage = function (msg, line, src) {
//                console.log(config.consolePrefix + '---+++ ' + msg + ' (' + src + ', #' + line + ')');
//            }
//        }
        if (config.userAgent && config.userAgent != "default") {
            if (config.userAgentAliases[config.userAgent]) {
                config.userAgent = config.userAgentAliases[config.userAgent];
            }
            page.settings.userAgent = config.userAgent;
        }
        ['onInitialized', 'onLoadStarted', 'onResourceRequested', 'onResourceReceived']
            .forEach(function (event) {
            if (task[event]) {
                page[event] = function () {
                    var args = [page, config],
                        a, aL;
                    for (a = 0, aL = arguments.length; a < aL; a++) {
                        args.push(arguments[a]);
                    }
                    task[event].apply(scope, args);
                };

            }
        });
        if (task.onLoadFinished) {
            page.onLoadFinished = function (status) {
                if (config.wait) {
                    setTimeout(
                        function () {
                            task.onLoadFinished.call(scope, page, config, status);
                        },
                        config.wait
                    );
                } else {
                    task.onLoadFinished.call(scope, page, config, status);
                }
                phantom.exit();
                //page.release();
                page = new WebPage();
                doPageLoad();
            };
        } else {
            page.onLoadFinished = function (status) {
                phantom.exit();
            };
        }
        page.settings.localToRemoteUrlAccessEnabled = true;
        page.settings.webSecurityEnabled = false;
        page.onConsoleMessage = function (msg) {
            if (msg.indexOf('jserror-') >= 0){
                confess.performance.evalConsoleErrors.push(msg.substring('jserror-'.length,msg.length));
            }else{
                if (msg.indexOf('interactive-') >= 0){
                    confess.performance.evalConsole.interactive = msg.substring('interactive-'.length,msg.length);
                } else if (msg.indexOf('complete-') >= 0){
                    confess.performance.evalConsole.complete = msg.substring('complete-'.length,msg.length);
                } else if (msg.indexOf('onload-') >= 0){
                    confess.performance.evalConsole.onload = msg.substring('onload-'.length,msg.length);
                }
                //confess.performance.evalConsole.push(msg);
            }
        };

        page.onError = function (msg, trace) {
            //console.log("+++++  " + msg);
            trace.forEach(function(item) {
                confess.performance.evalConsoleErrors.push(msg + ':' + item.file + ':' + item.line);
            })
        };

        function doPageLoad(){
            setTimeout(function(){page.open(config.url);},config.cacheWait);
        }

        if(config.task == 'performancecache'){

            pagetemp.open(config.url,function(status) {
                if (status === 'success') {
                    pagetemp.release();
                    doPageLoad();
                }
            });
        }else{
            doPageLoad();
        }
    },

    processArgs: function (config, contract) {
        var a = 0;
        var ok = true;

        contract.forEach(function(argument) {
            if (a < phantom.args.length) {
                config[argument.name] = phantom.args[a];
            } else {
                if (argument.req) {
                    console.log('"' + argument.name + '" argument is required. This ' + argument.desc + '.');
                    ok = false;
                } else {
                    config[argument.name] = argument.def;
                }
            }
            if (argument.oneof && argument.oneof.indexOf(config[argument.name])==-1) {
                console.log('"' + argument.name + '" argument must be one of: ' + argument.oneof.join(', '));
                ok = false;
            }
            a++;
        });
        return ok;
    },

    mergeConfig: function (config, configFile) {
        if (!fs.exists(configFile)) {
            configFile = "config.json";
        }
        var result = JSON.parse(fs.read(configFile)),
            key;
        for (key in config) {
            result[key] = config[key];
        }
        return result;
    },

    truncate: function (str, length) {
        length = length || 80;
        if (str.length <= length) {
            return str;
        }
        var half = length / 2;
        return str.substr(0, half-2) + '...' + str.substr(str.length-half+1);
    },

    pad: function (str, length) {
        var padded = str.toString();
        if (padded.length > length) {
            return this.pad(padded, length * 2);
        }
        return this.repeat(' ', length - padded.length) + padded;
    },

    repeat: function (chr, length) {
        for (var str = '', l = 0; l < length; l++) {
            str += chr;
        }
        return str;
    },

    clone: function(obj) {
        var target = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
        return target;
    },

    timerStart: function () {
        return (new Date()).getTime();
    },

    timerEnd: function (start) {
        return ((new Date()).getTime() - start);
    },

    /*worker: function(now,page){
        var currentTime = now - this.performance.start;
        var ths = this;


        if((currentTime) >= this.performance.count1){
            var worker = new Worker('file:///Users/wesleyhales/phantom-test/worker.js');
            worker.addEventListener('message', function (event) {
                //getting errors after 3rd thread with...
                //_this.workerTask.callback(event);
                //mycallback(event);
                console.log('message' + event.data);
            }, false);
            worker.postMessage(page);
            this.performance.count2++;
            this.performance.count1 = currentTime + (this.performance.count2 * 100);
        }
    },*/

    screenshot: function(now,page){
        var start = this.timerStart();
        var currentTime = now - this.performance.start;
        var ths = this;
        if((currentTime) >= this.performance.count1){
            //var ashot = page.renderBase64();
            page.render('filmstrip/screenshot' + this.performance.timer + '.png');
            this.performance.count2++;
            this.performance.count1 = currentTime + (this.performance.count2 * 100);
            //subtract the time it took to render this image
            this.performance.timer = this.timerEnd(start) - this.performance.count1;
        }
    },

    printToFile: function(config,report,filename,extension,createNew) {
        var f, myfile,
            keys = [], values = [];
        for(var key in report)
        {
            if(report.hasOwnProperty(key))
            {
                keys.push(key);
                values.push(report[key]);
            }
        }
        if(phantom.args[3] && phantom.args[3] != 'wipe'){
            myfile = 'reports/' + filename + '-' + phantom.args[3] + '.' + extension;
        }else{
            myfile = 'reports/' + filename + '.' + extension;

        }

        if(!createNew && fs.exists(myfile)){
            //file exists so append line
            try{
                if(extension === 'json'){
                    var phantomLog = [];
                    var tempLine = JSON.parse(fs.read(myfile));
                    if(Object.prototype.toString.call( tempLine ) === '[object Array]'){
                        phantomLog = tempLine;
                    }
                    phantomLog.push(report);
                    fs.remove(myfile);
                    f = fs.open(myfile, "w");
                    f.writeLine(JSON.stringify(phantomLog));
                    f.close();
                }else{
                    f = fs.open(myfile, "a");
                    f.writeLine(values);
                    f.close();
                }

            } catch (e) {
                console.log("problem appending to file",e);
            }
        }else{
            if(fs.exists(myfile)){
                fs.remove(myfile);
            }
            //write the headers and first line
            try {
                f = fs.open(myfile, "w");
                if(extension === 'json'){
                    f.writeLine(JSON.stringify(report));
                }else{
                    f.writeLine(keys);
                    f.writeLine(values);
                }
                f.close();
            } catch (e) {
                console.log("problem writing to file",e);
            }
        }
    }

};

confess.run();
