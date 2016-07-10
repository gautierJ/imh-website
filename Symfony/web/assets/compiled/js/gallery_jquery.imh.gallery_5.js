;(function($) {
    'use strict';

    var GalleryManager = {
        'cst' : {
            'LOADING_TIME'       : 3000,
            'PORTRAIT_WIDTH'     : 33.33 + '%',
            'PORTRAIT_MAX_WIDTH' : 66.66 + '%'
        },
        'cssAnimations' : ['mA_1', 'mA_2']
    };

    var gallerySelector   = 'imh__gallery-wrapper',
        frameSelector     = 'frame',
        slideeSelector    = 'slidee',
        scrollbarSelector = 'imh__scrollbar',
        sly,
        wWidth            = $(window).width(),
        wHeight           = $(window).height(),
        ratio             = wWidth/wHeight,

        containerSelector = 'sonata-media-gallery-media-list',
        itemSelector      = 'sonata-media-gallery-media-item',
        linkSelector      = 'sonata-media-gallery-media-item-link',
        imageSelector     = 'media-object',
        expSelector       = 'expanded',
        triggerSelector   = 'imh__trigger',
        zoomSelector      = 'zoom',
        closeSelector     = 'close',
        $container        = $('.' + containerSelector),
        $targetItem       = null,
        isClosed          = true,
        isVisible         = false,
        isTriggered       = false,

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
        var $slidee = $('.' + slideeSelector),
            $frame  = $('.' + frameSelector);
        if ($slidee.width() < $frame.width() || $slidee.height() < $frame.height()) {
            return false;
        }
        else if(o) return $container.css('cursor', 'ew-resize');
        else return $container.css('cursor', 'ns-resize');
    };

    // layout Packery after all images have loaded
    $container.imagesLoaded(function() {
        isVisible = true;
        var $g = $('.' + gallerySelector),
            $i = $('.' + itemSelector),
            orientation = getOrientation(ratio);

        $g.removeClass('loading');

        // bug fix for Chrome
        var calcEltWidth = function($trgi) {
            $i.each(function() {
                var $img     = $(this).find('.' + imageSelector),
                    imgRatio = $img.height()/$img.width(),
                    newWidth = Math.round($img.height()/imgRatio);

                if(orientation) { $(this).width(newWidth); }
                else if (!isClosed) { $trgi.css('width', GalleryManager.cst.PORTRAIT_MAX_WIDTH); }
                else { $(this).css('width', GalleryManager.cst.PORTRAIT_WIDTH); }
            });
            $container.packery();
        };

        var pckryOptions = {
            itemSelector: '.' + itemSelector,
            horizontal: orientation
        };

        $container.packery(pckryOptions);

        // access Packery properties from jquery object
        var pckry = $container.data('packery');

        var slyOptions = {
            horizontal: orientation,
            scrollBy: 200,
            speed: 2000,
            syncSpeed: 1,
            easing: 'easeOutQuad',
            scrollBar: '.' + scrollbarSelector,
            dynamicHandle: 1,
            dragHandle: 1,
            clickBar: 1,
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1
        };
        $('.' + scrollbarSelector).addClass(GalleryManager.cssAnimations[1]);
        sly = new Sly($('.' + frameSelector), slyOptions).init();

        // Detect whether device supports orientationchange event,
        // otherwise fall back to the resize event.
        var supportsOrientationChange = 'onorientationchange' in window,
            orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

        window.addEventListener(orientationEvent, function() {

            var wWidth      = $(this).width(),
                wHeight     = $(this).height(),
                ratio       = wWidth/wHeight;

            orientation = getOrientation(ratio);

            var _destroy = function() {
                sly.destroy();
                $('.' + scrollbarSelector).removeClass(GalleryManager.cssAnimations[1]);
                $container.packery('destroy');
            },
            _setOption = function(o) {
                sly.options.horizontal = o;
                pckry.options.horizontal = o;
            },
            _reinit = function() { // reinitialize sly and packery with new orientation option flag
                sly = new Sly($('.' + frameSelector), sly.options).init();
                $container.packery(pckry.options);
                $container.on('layoutComplete', function(){ onLayout(); });
            };

            if(orientationEvent == 'orientationchange') {  // MOBILE - TABLET
                //alert(window.orientation + " " + screen.width);
                var o = window.orientation;
                _destroy();
                if (o == 0 || o == 180) _setOption(true); // landscape mode
                else _setOption(false); // portrait mode
                _reinit();

                sly.reload();
            } else { // DESKTOP SCREEN
                loading(isVisible = false);
                _destroy();
                _setOption(orientation);
                _reinit();

                delay(function(){
                    $('.' + scrollbarSelector).addClass(GalleryManager.cssAnimations[1]);
                    sly.reload();
                    setCssCursor(orientation);
                    loading(isVisible = true);
                }, GalleryManager.cst.LOADING_TIME);
            }
            calcEltWidth();
        }, false);

        $container.on('layoutComplete', function(){ onLayout(); });

        var loading = function(isVisible) {
            isVisible ? $g.removeClass('loading')
                      : $g.addClass('loading');
        };

        var onLayout = function() {
            if($targetItem != null && !isTriggered) closeItem($targetItem);
            sly.reload();
            setCssCursor(orientation);
        };

        var getInactiveItems = function() {
            return $('.' + itemSelector).not('.' + expSelector);
        };

        /*var getItemPosition = function(item) {

        };*/

        $container.on('click', function(e) {
            if(e.target.className == 'plus-icon') {
                $('.' + itemSelector).removeClass(expSelector);
                $targetItem = $(e.target).parent().parent();
                $targetItem.addClass(expSelector);
                getInactiveItems().addClass(GalleryManager.cssAnimations[0]);
                isClosed = false;
                calcEltWidth($targetItem);
            }
            e.preventDefault();
        });

        var closeItem = function($trgi) {
            $trgi.find('.' + closeSelector).off().on('click', function(e) {
                $trgi.removeClass(expSelector);
                getInactiveItems().removeClass(GalleryManager.cssAnimations[0]);
                isClosed = true;
                calcEltWidth($trgi);
                e.preventDefault();
            });
        };

        $('.' + triggerSelector).on('click', function(e) {
            // needs behavior : 'twitter' and manual-trigger.js
            isTriggered = true;
            $('.' + itemSelector).removeClass(expSelector);

            isClosed = true;
            $container.isotope().infinitescroll('retrieve');
            e.preventDefault();
        });
    });



    // Infinite Scroll
    $container.infinitescroll({
        navSelector  : '.gallery', // selector for the paged navigation (it will be hidden)
        nextSelector : '.gallery li a', // selector for the NEXT link (to page 2)
        itemSelector : '.' + itemSelector, // selector for all items you'll retrieve
        debug: true,
        loading: {
            selector: '.' + gallerySelector,
            img: '/bundles/imhbase/images/circles_white.svg',
            msgText: '',
            finishedMsg: "<em>No more items !</em>",
            speed: 2000
        },
        behavior : 'twitter',
        //binder : $container, // scroll on this element rather than on the window
        //maxPage: 2,
//        pathParse: function(path, currentPage) {
//            console.log('path: ' + path);
//            console.log('currentPage: ' + currentPage);
//
//            var match = path.match(/gallery\/view\/(\d+)/);
//            if (match) {
//                var id = match[1];
//                console.log(id);
//            }
////            var re = new RegExp('^(.*?page=)'+currentPage+'(\/.*|$)');
////            path = path.match(re).slice(1);
//            //path = 'http://imh.localhost/app_dev.php/media/gallery/view/' + (parseInt(id) + currentPage);
//            //'http://imh.localhost/app_dev.php/media/gallery/view/' + (parseInt(id) + currentPage)
//            return ['http://imh.localhost/app_dev.php/media/gallery/view/', '/'];
//        }
        path: function generatePageUrl(currentPageNumber) {
            return ("http://imh.localhost/app_dev.php/media/gallery/view/" + currentPageNumber);
        }
//        state: {
//            // start from page 3
//            currPage: 3
//        }

    },function(arrayOfNewElems) {
        var opts = $container.data('infinitescroll').options;
        console.log("curr page:", opts.state.currPage);

       // console.log("navSelector:", opts.navSelector);
        var $li = $(opts.navSelector).find('li');
        var cur;
        $li.each(function(i) {
            if($li.hasClass('current')) {
                $(this).removeClass('current');
                cur = i;
            }
        });

        opts.state.currPage = cur + 1;
        $li.eq(cur + 1).addClass('current');
        console.log("curr:" + (cur+1));


        // hide new items while they are loading
        var $newElems = $(arrayOfNewElems).css({
            'opacity': 0
        });

        isTriggered = true;


        $container.imagesLoaded( function() {
//            if($targetItem != null) {
//                //closeItem($targetItem);
//                $targetItem.removeClass(expandedSelector);
//                $container.isotope();
//            }

            $container.isotope('prepended', $newElems);
            //$newElems.addClass('newElts');
            sly.reload();
            sly.toStart();
            setCssCursor();
        });
    });
}(jQuery));