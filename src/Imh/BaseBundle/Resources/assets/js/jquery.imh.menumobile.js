;(function($) {
    'use strict';

    $.fn.menumobile = function () {
        var context = $(this),
            layer   = $('[data-layer]'),
            burger  = $('[data-hamburger]'),
            main    = $('[data-main]'),
            lang    = $('[data-lang]'),
            flag    = 0;

        $(this).addClass('is-visible');

        context.on('click', '[data-hamburger], [data-globe]', function(e) {

            if(typeof $(this).attr('data-hamburger') !== "undefined") {
                layer.toggleClass('is-visible');
                lang.hide();

                if(flag == 1) {
                    main.hide();
                    flag = 0;
                } else {
                    main.show();
                }
            }

            if(typeof $(this).attr('data-globe') !== "undefined") {
                flag = 1;
                layer.addClass('is-visible');
                main.hide();
                lang.show();
            }

            if(layer.hasClass('is-visible')) {
                burger.addClass('is-active');
                $('html, body').on('touchmove', function(e) {
                    e.preventDefault();
                });
            } else {
                burger.removeClass('is-active');
                $('html, body').off('touchmove');
            }
            e.preventDefault();
        });
        return this;
    }
}(jQuery));

