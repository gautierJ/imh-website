;(function ($) {
    'use strict';

    var wrapperSelector = 'wrapper',
        navSelector     = 'home',
        loadingSelector = 'loading',
        homeCssPath     = '/bundles/imhbase/css/home.css',
        loadingImg      = '<img class=' + loadingSelector + ' src="/bundles/imhbase/images/circles_black.svg" />',
        homePagePath    = Routing.generate('imh_base_homepage');

    $('.' + navSelector).on('click', 'a', function (e) {
        //e.preventDefault();
        /*
         if uncomment the above line, html5 nonsupported browsers won't change the url but will display the ajax content;
         if commented, html5 nonsupported browsers will reload the page to the specified link.
         */

        // get the link location that was clicked
        var pageurl = $(this).attr('href');

        $.ajax({
            type: 'GET',
            dataType: 'html',
            url: homePagePath,
            cache: false,
            beforeSend: function () {
                $('body').append($(loadingImg));
            },
            success: function (data) {
                injectContent(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error : ' + errorThrown);
            }
        });

        // to change the browser URL to the given link location
        if (pageurl != window.location) {
            window.history.pushState({path: pageurl}, '', pageurl);
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
                $('body').html(data);
            }
        });
    });

    function injectContent(data) {
        $('#' + wrapperSelector).animate({
            'opacity': 0
        }, 500, function () {
//            $('head').append('<link rel="stylesheet" href=' + homeCssPath + ' type="text/css" />');

            var _this = $(this);

            $('body')
                .html(data)
                .hide()
                .fadeIn(700);

            _this.css({
                'height': '100%',
                'marginLeft': 0,
                'background': '#ffffff'
            })
        });
        $('.' + loadingSelector).fadeOut();
    }
}(jQuery));