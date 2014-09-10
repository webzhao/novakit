/**
 * Entry point of novakit.
 * @author webzhao@gmail.com
 */

/* configuration */
var config = require('./config');
var DEBUG_SERVER = '';

/* required modules */
var http = require('http');
var URL = require('url');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/web'));

app.get('/proxy', function(req, res){

    /**
     * inject script to original html
     */
    function injectScript(html) {
        var clientScript = config.DEBUG_SERVER + '/target/target-script-min.js#anonymous';
        return html.replace('</body>', '<script src="' + clientScript + '"></script></body>');
    }

    var url = decodeURIComponent(req.query.url);
    var host = decodeURIComponent(req.query.host);
    var options = URL.parse(url);
    options.headers = {
        'user-agent': req.headers['user-agent']
    };
    if (host) {
        options.host = host;
    }
    http.get(options, function(r){
        var resposeHTML = '';
        r.setEncoding('utf8');
        r.on('data', function (chunk) {
            resposeHTML += chunk;
        });
        r.on('end', function(){
            res.end(injectScript(resposeHTML));
        });

    }).on('error', function(e){
        res.end('请求页面出错：' + e.message);
    });;
});

app.listen(config.APP_PORT);
console.log('Novakit已经启动，请使用浏览器访问http://localhost:' + config.APP_PORT);

