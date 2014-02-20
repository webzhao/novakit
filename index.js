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

function queryUrl(url, key) {
    url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
    var json = {};
    //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
    url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
        //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
        try {
            key = decodeURIComponent(key);
        } catch(e) {}

        try {
            value = decodeURIComponent(value);
        } catch(e) {}

        if (!(key in json)) {
            json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
        }
        else if (json[key] instanceof Array) {
            json[key].push(value);
        }
        else {
            json[key] = [json[key], value];
        }
    });
    return key ? json[key] : json;
}


app.use(express.static(__dirname + '/web'));

app.get('/proxy', function(req, res){
    console.log('url:', req.url);
    var hash = queryUrl(req.url, 'hash');
    console.log('hash', hash);

    /**
     * inject script to original html
     */
    function injectScript(html) {
        var clientScript = 'http://' + req.headers['host'].replace(/\:\d+/, '') + ':' + DEBUG_PORT + '/target/target-script-min.js#' + hash;
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

