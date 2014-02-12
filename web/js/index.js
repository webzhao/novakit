(function(){

    /* configuration */
    var DEBUG_PORT = 8080;

    /* check browser support */
    if ($.Browser.ie && parseInt($.Browser.ie) < 9) {
        $('body').html('<div class="not-supported">请使用高级浏览器 ^_^</div>');
        return;
    }

    var pageTemplate = Handlebars.compile($('#page_template').html());

    $('#add_page').submit(function(e){
        e.preventDefault();

        //check url
        var url = $('#input_url').val();
        if (!url || url.indexOf('http') != 0) {
            alert('请检查您输入的URL');
            return;
        }

        //add
        var pageHTML = pageTemplate({
            url: url,
            proxy_url: getProxyURL() + '?url=' + encodeURIComponent(url),
            url_encoded: encodeURIComponent(getProxyURL() + '?url=' + encodeURIComponent(url)),
            host: location.host.replace(/\:\d+/, ''),
            port: DEBUG_PORT
        });

        //append to list
        $('#page_list').append(pageHTML);

        //reset input box
        $('#input_url').val('');

        //animate
        $('#hd').removeClass('init-state');

    });

    /* remove page */
    $('#page_list').delegate('.delete', 'click', function(e){
        e.preventDefault();
        $(this).closest('li').remove();
        if ($('#page_list>li').length === 0) {
            $('#hd').addClass('init-state');
        }
    });


    /* utils */
    function getProxyURL() {
        var url = location.protocol + '//' + location.hostname;
        if (location.port != '80') {
            url += ':' + location.port;
        }
        url += '/proxy';
        return url;
    }

})();
