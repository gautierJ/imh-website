$(function() {
    var contentSelector   = 'content',
        gallerySelector   = 'gallery-wrapper',
        frameSelector     = 'frame',
        slideeSelector    = 'slidee',
        scrollbarSelector = 'scrollbar',
        sly;

    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    $(window).on('resize', function () {
        delay(function(){
            sly.reload(); // Reload on resize
        }, 500);
    });

    /* Isotope */
    var containerSelector = 'sonata-media-gallery-media-list',
        itemSelector      = 'sonata-media-gallery-media-item',
        imageSelector     = 'media-object',
        expandedSelector  = 'expanded',
        triggerSelector   = 'trigger',
        zoomSelector      = 'zoom',
        closeSelector     = 'close',
        $container        = $('#' + containerSelector),
        isClosed          = true,
        $targetItem       = null,
        isTriggered       = false;

    var setCssCursor = function() {
        if ($('.' + slideeSelector).width() < $('#' + frameSelector).width()) {
            return false;
        } else {
            return $container.css('cursor', 'ew-resize');
        }
    };

    var closeItem = function($trgi) {
        //console.log($trgi);
        $trgi.find('.' + closeSelector).on('click', function(e) {
            $trgi.removeClass(expandedSelector);
            isClosed = true;
            console.log("ITEMS", $('.' + itemSelector));
            $('.' + itemSelector).css('opacity', 1);

            $container.isotope();
            e.preventDefault();
        });
    };



    // layout Isotope after all images have loaded
    $container.imagesLoaded( function() {
        $container.stop().animate({
            'opacity': 1
        }, 500).isotope({
            percentPosition: true,
            layoutMode: 'packery',
            itemSelector: '.' + itemSelector,
            //resizesContainer: true
            packery: {
                rowHeight: 200,
                isHorizontal: true

            }

            /*masonryHorizontal: {
                rowHeight: ($('.' + itemSelector).find('img').height())/2
            }*/

            /*masonry: {
                columnWidth: 50
            }*/

        });

        $(window).smartresize(function(){
            //$container.isotope();



            /*$container.isotope({
             isResizeBound: true

             });*/

            /*$container.isotope({
                masonryHorizontal: {
                    rowHeight: ($('.' + itemSelector).find('img').height())/2
                }
            });*/


        });

        $container.on('click', function(e) {
            if(e.target.className == imageSelector) {
                $('.' + itemSelector).removeClass(expandedSelector);
                $targetItem = $(e.target).parent().parent();
                $targetItem.css('opacity', 0).addClass(expandedSelector);
                isClosed = false;
                $(this).isotope();
            }
            e.preventDefault();
        });

        $container.isotope('on', 'layoutComplete', function(isoInstance, laidOutItems) {
            if($targetItem != null && !isTriggered) {
                console.log('1');
                $targetItem.stop().animate({
                    'opacity': 1
                }, 500, function() {
                    closeItem($targetItem);
                });
            }

            /* a revoir */
            if(!isClosed) {
                console.log('2');
                $('.' + itemSelector).not('.' + expandedSelector).map(function() {
                    $(this).stop().animate({
                        'opacity': .1
                    }, 500);
//                    //.find('.' + imageSelector).css('transform', 'none');
                    //$container.off('click');
                });
            }
            /*******/

            sly.reload();
            setCssCursor();
        });

        $('#' + triggerSelector).on('click', function(e) {
            // needs behavior : 'twitter' and manual-trigger.js
            isTriggered = true;
            $('.' + itemSelector).removeClass(expandedSelector);

            isClosed = true;
            $container.isotope().infinitescroll('retrieve');
            e.preventDefault();
        });

        sly = new Sly($('#' + frameSelector), {
            horizontal: 1,
            scrollBy: 200,
            speed: 2000,
            syncSpeed: 1,
            easing: 'easeOutQuad',
            scrollBar: '#' + scrollbarSelector,
            dynamicHandle: 1,
            dragHandle: 1,
            clickBar: 1,
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1
        }).init();
    });







    // Infinite Scroll
    $container.infinitescroll({
        navSelector  : '.gallery', // selector for the paged navigation (it will be hidden)
        nextSelector : '.gallery li a', // selector for the NEXT link (to page 2)
        itemSelector : '.' + itemSelector, // selector for all items you'll retrieve
        debug: true,
        loading: {
            selector: '#' + gallerySelector,
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
});
;(function($) {
    'use strict';

    $.fn.shape = function (w) {
        var ctx          = $(this),
            ratio        = .2,
            wh           = $(w).height(),
            tw           = Math.round(wh * ratio);

        ctx.css({
            'border-bottom-width': wh + 'px',
            'border-left-width': tw + 'px',
            'left': -tw + 'px'
        });
        return this;
    }
}(jQuery));
