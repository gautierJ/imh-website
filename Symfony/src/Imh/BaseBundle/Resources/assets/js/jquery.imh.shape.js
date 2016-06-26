;(function($) {
    'use strict';

    $.fn.shape = function (w) {
        var ctx    = $(this),
            ratio  = .2,
            wh     = $(w).height(),
            tw     = Math.round(wh * ratio);

        ctx.css({
            'border-bottom-width': wh + 'px',
            'border-left-width': tw + 'px',
            'left': -tw + 'px'
        });
        return this;
    }
}(jQuery));
