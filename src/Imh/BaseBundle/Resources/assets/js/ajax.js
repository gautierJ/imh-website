;(function($) {
    'use strict';

    var context = $('[data-body]');

    function addEvent(evnt, elem, func) {
        if (elem.addEventListener)  // W3C DOM
            elem.addEventListener(evnt, func, false);
        else if (elem.attachEvent) { // IE DOM
            elem.attachEvent("on" + evnt, func);
        }
        else { // No much to do
            elem[evnt] = func;
        }
    }

    $(document).on('click', '[data-ajax]', function(e) {
        //e.preventDefault();
        /*
         if uncomment the above line, html5 nonsupported browsers won't change the url but will display the ajax content;
         if commented, html5 nonsupported browsers will reload the page to the specified link.
         */

        // get the path location that was clicked
        var completePath = $(this).data('path'),
            splitPath    = completePath.split(','),
            routing      = Routing.generate(splitPath[0], { _locale: splitPath[1] });

        $.ajax({
            type: 'GET',
            url: routing,
            dataType: 'html',
            cache: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                //Download progress
                addEvent("progress", xhr, function (e) {
                    if (e.lengthComputable) {
                        var percentComplete = Math.round((e.loaded / e.total) * 100);
                        counter.empty().html(percentComplete + ' %');
                        bar.width(percentComplete + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(data) {
                console.log(data);
                context.addClass('mA_1');
                injectContent(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error : ' + errorThrown);
            }
        });

        // to change the browser URL to the given link location
        if (routing != window.location) {
            window.history.pushState({path: routing}, '', routing);
        }

        //stop refreshing to the page given in
        return false;
    });

    // the below code is to override back button to get
    // the ajax content without page reload
    $(window).on('popstate', function (event) {
        $.ajax({
            url: location.pathname,
            success: function (data) {
                //alert("adresse: " + document.location + ", état: " + JSON.stringify(event.state));
                context.html(data);
            }
        });
    });

    function injectContent(data) {
        context.animate({
            'opacity': 0
        }, 500, function () {
//            $('head').append('<link rel="stylesheet" href=' + homeCssPath + ' type="text/css" />');

            //var _this = $(this);

            $('body').html(data).css('opacity', 1);

            /*_this.css({
                'height': '100%',
                'marginLeft': 0,
                'background': '#ffffff'
            })*/
        });
        //$('.' + loadingSelector).fadeOut();
    }
}(jQuery));