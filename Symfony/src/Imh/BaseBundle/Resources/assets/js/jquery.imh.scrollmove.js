;(function($) {
    'use strict';

    $.fn.scrollMove = function (options) {
        var settings = $.extend({
            cssClasses: {
                header:   'header'
            },
            animOpts: {
                maxOpacity: 'show',
                minOpacity: 'hide',
                minOffsetTop: 130,
                maxOffsetTop: 200,
                maxSpeed: 'fast',
                minSpeed: 'slow'
            }
        }, options );

        var hh      = $('#' + settings.cssClasses.header).height();
        var context = $(this);

        var scrollHandler = function() {
            var scrollTop = $(window).scrollTop();

            if(scrollTop > hh) {
                if (!('doneIt' in scrollHandler)) {
                    scrollHandler.doneIt = true;
                    animate(context, true, true,
                        settings.animOpts.maxOpacity,
                        settings.animOpts.minOffsetTop,
                        settings.animOpts.minSpeed,
                        'easeOutQuart'
                    );
                }
            } else {
                if (scrollHandler.doneIt) {
                    delete scrollHandler.doneIt;
                    animate(context, true, true,
                        settings.animOpts.minOpacity,
                        settings.animOpts.maxOffsetTop,
                        settings.animOpts.minSpeed,
                        'easeInQuart'
                    );
                }
            }
        };
        $(window).scroll(scrollHandler);

        var animate = function (object, clearQueue, jumpToEnd, opacityValue, topValue, speed, easing) {
            object.stop(clearQueue, jumpToEnd).animate({
                    opacity: opacityValue,
                    top: topValue
                }, speed, easing
            );
        };
        return this;
    };

    $.fn.contentHeightAdjust = function () {
        var cssClasses = {
                header: 'header',
                content: '.imh-content',
                footer : 'footer'
            },
        hh = $(cssClasses.header).outerHeight(),
        ch = $(cssClasses.content).outerHeight(),
        ph = ch - $(cssClasses.content).height(),
        fh = $(cssClasses.footer).outerHeight(),
        wh = $(window).height();

        if(hh + ch + fh < wh) {
            $(cssClasses.content).css({
                'minHeight' : wh - (hh + fh + ph)
            });
        }
        return this;
    }
}(jQuery));
