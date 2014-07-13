(function(){

    /* configuration */
    var DEBUG_PORT = 80;

    /* check browser support */
    if ($.Browser.ie && parseInt($.Browser.ie) < 9) {
        $('body').html('<div class="not-supported">请使用高级浏览器 ^_^</div>');
        return;
    }

    /* configuration */
    var DEBUG_PORT = 8080;
    var storageKey = 'novakit';

    var pageTemplate = Handlebars.compile($('#page_template').html());


    /* get and display storage data */
    var pageNum = 0;
    var urls = get(storageKey);
    for(var i = urls.length - 1; urls && i >= 0 ; i--) {
        !urls[i] && urls.splice(i, 1);
    }
    set(storageKey, urls);
    for(var i = 0; urls && i < urls.length; i++) {
        addPage(urls[i]);
    }

    /* add page when submit */
    $('#add_page').submit(function(e){
        e.preventDefault();
        //check url
        var url = $('#input_url').val();
        if (!url || url.indexOf('http') != 0) {
            alert('请检查您输入的URL');
            return;
        }

        addPage(url);

        // add to localStorage
        var urls = get(storageKey) || [];
        urls.push(url);
        set(storageKey, urls);
    });


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


    function addPage(url) {

        //add
        var pageHTML = pageTemplate({
            pageNum: pageNum++,
            url: url,
            proxy_url: getProxyURL() + '?url=' + encodeURIComponent(url),
            url_encoded: encodeURIComponent(getProxyURL() + '?url=' + encodeURIComponent(url)),
            host: 'novadebug.qiwoo.org',
            port: DEBUG_PORT
        });

        //append to list
        $('#page_list').append(pageHTML);

        //reset input box
        $('#input_url').val('');

        //animate
        $('#hd').removeClass('init-state');

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
