/**
 * Entry point of novakit.
 * @author webzhao@gmail.com
 */

/* configuration */
var DEBUG_PORT = 8080;
var APP_PORT = 8866;

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
        var clientScript = 'http://' + req.headers['host'].replace(/\:\d+/, '') + ':' + DEBUG_PORT + '/target/target-script-min.js#anonymous';
        return html.replace('</body>', '<script src="' + clientScript + '"></script></body>');
    }

    var url = req.query.url;
    var options = URL.parse(url);
    options.headers = {
        'user-agent': req.headers['user-agent']
    };
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

app.listen(APP_PORT);
console.log('Novakit已经启动，请使用浏览器访问 http://360.75team.com:' + APP_PORT);

