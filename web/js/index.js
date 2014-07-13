(function(){

    /* configuration */
    var DEBUG_PORT = 80;
    var storageKey = 'novakit';

    /* check browser support */
    if ($.Browser.ie && parseInt($.Browser.ie) < 9) {
        $('body').html('<div class="not-supported">请使用高级浏览器 ^_^</div>');
        return;
    }

    var pageTemplate = Handlebars.compile($('#page_template').html());


    /* get and display storage data */
    var pageNum = 0;
    var urls = get(storageKey) || [];
    for(var i = urls.length - 1; urls && i >= 0 ; i--) {
        !urls[i] && urls.splice(i, 1);
    }
    set(storageKey, urls);
    for(var i = 0; urls && i < urls.length; i++) {
        var item = urls[i];
        if (typeof item == 'object') {
            addPage(item.url, item.host, item.cookie);
        } else {
            addPage(item);
        }
    }

    /* add page when submit */
    $('#add_page').submit(function(e){
        e.preventDefault();
        //check url
        var url = $('#input_url').val();
        var host = $('#input_host').val();
        var cookie = $('#input_cookie').val();
        if (!url || url.indexOf('http') != 0) {
            alert('请检查您输入的URL');
            return;
        }

        addPage(url, host, cookie);

        //hide options
        $('#hd .toggle').addClass("fa-caret-down").removeClass('fa-caret-square-o-down');
        $('#hd .options').hide();

        // add to localStorage
        var urls = get(storageKey) || [];
        urls.push({
            url: url,
            host: host,
            cookie: cookie
        });
        set(storageKey, urls);
    });

    /* toggle options */
    $('#hd .toggle').click(function(e){
        e.preventDefault();
        $('#hd .options').fadeToggle();
        $(this).toggleClass("fa-caret-down fa-caret-square-o-down");
    });;


    /* remove page */
    $('#page_list').delegate('.delete', 'click', function(e){
        e.preventDefault();
        var pageEl = $(this).closest('li');
        var pageNum = pageEl.data('page-num');
        pageEl.remove();
        if ($('#page_list>li').length === 0) {
            $('#hd').addClass('init-state');
        }

        var urls = get(storageKey) || [];
        urls[pageNum] = undefined;
        set(storageKey, urls);
    });


    function addPage(url, host, cookie) {

        var proxy_url = getProxyURL() + '?url=' + encodeURIComponent(url);
        if (host) {
            proxy_url += '&host=' + encodeURIComponent(host);
        }
        if (cookie) {
            proxy_url += '&cookie=' + encodeURIComponent(cookie);
        }

        //add
        var pageHTML = pageTemplate({
            pageNum: pageNum++,
            url: url,
            proxy_url: proxy_url,
            url_encoded: encodeURIComponent(proxy_url),
            host: 'novadebug.qiwoo.org',
            port: DEBUG_PORT
        });

        //append to list
        $('#page_list').append(pageHTML);

        //reset input box
        $('#input_url').val('');

        //animate
        $('#hd').removeClass('init-state');

        //qrcode
        new QRCode($('.qrcode').last()[0], {text: proxy_url, width:150, height: 150});

        //log
        new Image().src = 'http://novalog.qiwoo.org/page.gif?url=' + encodeURIComponent(url) + '&_t=' + Math.random();

    }


    /* utils */
    function getProxyURL() {
        var url = location.protocol + '//' + location.hostname;
        if (false && location.port != '80') {
            url += ':' + location.port;
        }
        url += '/proxy';
        return url;
    }

    // localStorage getter and setter
    function set(key, val) {
        if(val === undefined) {
            window.localStorage.removeItem(key);
            return;
        }
        window.localStorage.setItem(key, JSON.stringify(val));
        return val;
    }

    function get(key) {
        var val = window.localStorage.getItem(key);
        if(typeof val !== 'string') {return undefined;}
        try {
            return JSON.parse(val);
        }
        catch(e) {
            return val || undefined;
        }
    }

})();
