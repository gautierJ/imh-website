;(function($) {
    'use strict';

    $.fn.menumobile = function () {
        var context = $(this),
            nav     = $('[data-navigation]');

        context.on('click', function(e) {
            $(this).toggleClass('is-active');
            nav.toggleClass('is-visible');

            if(nav.hasClass('is-visible')) {
                $('html, body').on('touchmove', function(e) {
                    e.preventDefault();
                });
            } else {
                $('html, body').off('touchmove');
            }
            e.preventDefault();
        });
        return this;
    }
}(jQuery));

