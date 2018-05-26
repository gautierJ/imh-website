;(function($, window) {
    'use strict';

    var GalleryManager = {
        'cst' : {
            'LOADING_TIME'       : 3000,
            'PORTRAIT_WIDTH'     : 33.33 + '%',
            'PORTRAIT_MAX_WIDTH' : 100 + '%'
        },
        'cssAnimations' : ['mA_1', 'mA_2']
    };

    var gallery      = $('[data-gallery]'),
        frame        = $('[data-gallery-frame]'),
        list         = $('[data-gallery-list]'),
        item         = $('[data-gallery-item]'),
        scrollbar    = $('[data-scrollbar]'),
        navigation   = $('[data-navigation]'),
        image        = $('[data-image]'),
        $zoom        = $('[data-zoom]'),
        $close       = $('[data-close]'),

        sly,
        wWidth       = $(window).width(),
        wHeight      = $(window).height(),
        ratio        = wWidth/wHeight,

        expandState  = 'is-expanded',
        displayState = 'is-hidden',
        loadState    = 'is-loaded',

        $targetItem  = null,
        isClosed     = true,
        isVisible    = false,
        isTriggered  = false,

        delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();

    var getOrientation = function(ratio) {
        return ratio > 1;
    };

    var setCssCursor = function(o) {
        if (list.width() < frame.width() || list.height() < frame.height()) {
            return false;
        }
        else if(o) return list.css('cursor', 'ew-resize');
        else return list.css('cursor', 'ns-resize');
    };

    // Detect whether device supports orientationchange event, otherwise fall back to
    // the resize event.
    var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

    // layout Packery after all images have loaded
    list.imagesLoaded(function() {
        isVisible = true;
        var orientation = getOrientation(ratio);

        gallery.addClass(loadState);

        // bug fix for Chrome (forced width on each item)
        var calcEltWidth = function($trgi) {
            item.each(function() {
                var $img     = $(this).find(image),
                    imgRatio = $img.height()/$img.width(),
                    newWidth = Math.round($img.height()/imgRatio);

                if(orientationEvent == 'resize' && orientation) { // desktop - landscape
                    $(this).width(newWidth);
                }
                if (orientationEvent == 'orientationchange') {
                    if(!orientation) {
                        $(this).css('width', GalleryManager.cst.PORTRAIT_WIDTH);
                        if (!isClosed) $trgi.css('width', GalleryManager.cst.PORTRAIT_MAX_WIDTH);
                    }
                    else { $(this).css('width', 'auto'); }
                }
            });
            list.packery();
        };

        var pckryOptions = {
            itemSelector: '.sonata-media-gallery-media-item',
            horizontal: orientation
        };

        list.packery(pckryOptions);

        // access Packery properties from jquery object
        var pckry = list.data('packery');

        var slyOptions = {
            horizontal: orientation,
            scrollBy: 150,
            speed: 1000,
            syncSpeed: 1,
            easing: 'easeOutQuad',
            scrollBar: '.imh__scrollbar',
            dynamicHandle: 1,
            dragHandle: 1,
            clickBar: 1,
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1
        };
        scrollbar.addClass(GalleryManager.cssAnimations[1]);
        sly = new Sly(frame, slyOptions).init();

        window.addEventListener(orientationEvent, function() {
            var wWidth      = screen.width, // not working on IOS
                wHeight     = screen.height, // not working on IOS
                ratio       = wWidth/wHeight;

            orientation = getOrientation(ratio);

            var _destroy = function() {
                    sly.destroy();
                    scrollbar.removeClass(GalleryManager.cssAnimations[1]);
                    list.packery('destroy');
                },
                _setOption = function(o) {
                    sly.options.horizontal = o;
                    pckry.options.horizontal = o;
                },
                _reinit = function() { // reinitialize sly and packery with new orientation option flag
                    sly = new Sly(frame, sly.options).init();
                    list.packery(pckry.options);
                    list.on('layoutComplete', function(){ onLayout(); });
                };

            //alert(window.orientation + " " + screen.width);

            if(orientationEvent == 'orientationchange') {  // MOBILE - TABLET

                var o = window.orientation;
                _destroy();
                if (o == 0 || o == 180) _setOption(false); // portrait orientation mobile, tablet is different
                else _setOption(true); // landscape orientation mobile
                _reinit();

                sly.reload();
            } else { // DESKTOP SCREEN
                loading(isVisible = false);
                _destroy();
                _setOption(orientation);
                _reinit();

                delay(function(){
                    scrollbar.addClass(GalleryManager.cssAnimations[1]);
                    sly.reload();
                    setCssCursor(orientation);
                    loading(isVisible = true);
                }, GalleryManager.cst.LOADING_TIME);
            }
            calcEltWidth();
        }, false);

        list.on('layoutComplete', function(){ onLayout(); });

        var onLayout = function() {
            if($targetItem != null && !isTriggered) closeItem($targetItem);
            sly.reload();
            sly.slideTo(Math.round(Modernizr.touchevents ? sly.getPos($targetItem).start : sly.getPos($targetItem).center));

            setCssCursor(orientation);
        };

        var loading = function(isVisible) {
            isVisible ? gallery.addClass(loadState)
                      : gallery.removeClass(loadState);
        };

        var getInactiveItems = function() {
            return item.not('.' + expandState);
        };

        list.on('click', function(e) {
            var target = e.target;

            if(isClosed) {
                if($(target).data('icon') == 'plus') openItem();

                // mobile
                if(Modernizr.touchevents) {
                    if($(target).data('image') == 'media') openItem();
                }
            }

            function openItem() {
                item.removeClass(expandState);
                $targetItem = $(target).parent().parent();
                $targetItem.addClass(expandState).find('[data-icon]').hide();
                getInactiveItems().addClass(GalleryManager.cssAnimations[0]).find('[data-icon]').hide();
                isClosed = false;
                calcEltWidth($targetItem);
            }

            e.preventDefault();
        });

        var closeItem = function($trgi) {
            $close.off().on('click', function(e) {
                $trgi.removeClass(expandState);
                getInactiveItems().removeClass(GalleryManager.cssAnimations[0]);

                if(!Modernizr.touchevents) {
                    getInactiveItems().find('[data-icon]').show()
                }

                isClosed = true;
                calcEltWidth($trgi);

                e.preventDefault();
            });
        };

        navigation.on('click', function(e) {
            $(this).parent().toggleClass(displayState);
            e.preventDefault();
        });
    });

}(jQuery, window));