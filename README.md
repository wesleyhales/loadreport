# loadreport.js
[PhantomJS](http://www.phantomjs.org/) 1.6+ is required to run loadreport.js or speedreport.js.

## loadreport Examples
### loadreport will write, to csv or json (filmstrip writes to png):
* ``` phantomjs loadreport.js http://cnn.com performance csv ```
![loadreport](https://raw.github.com/wesleyhales/loadreport/master/readme/cnn-loadreport.png)
    
* ``` phantomjs loadreport.js http://cnn.com performancecache json ```
    
* ``` phantomjs loadreport.js http://cnn.com filmstrip ``` 
![loadreport filmstrip](https://raw.github.com/wesleyhales/loadreport/master/readme/cnn-filmstrip.png)


## speedreport Examples
### speedreport produces a json and html file which will display detailed resource charting
* ``` phantomjs speedreport.js http://www.cnn.com```
![speedreport](https://raw.github.com/wesleyhales/loadreport/master/readme/speedreport.png)
    

