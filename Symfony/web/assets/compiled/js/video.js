/**
 *
	========================================================
	script: image-flow
	author: Gerard Ferrandez - [Ge1doot]
	modified by: Jenkner Gautier
	date: March 15, 2008
	site: http://www.dhteumeuleu.com
	license: CC-BY-NC - do not remove this notice
	========================================================
 *
 */

var imf = function () {
	/* ==== private methods ==== */
	var instances = [];

	/* ===== custom getElementsByClass ==== */
	function getElementsByClass(object, tag, className) {
		var o = object.getElementsByTagName(tag);
		for ( var i = 0, n = o.length, ret = []; i < n; i++)
			if (o[i].className == className) ret.push(o[i]);
		if (ret.length == 1) ret = ret[0];
		return ret;
	}
	
	/* ===== crossbrowsers Events ==== */
	function addEvent(o, e, f) {
		if (window.addEventListener) o.addEventListener(e, f, false);
		else if (window.attachEvent) r = o.attachEvent('on' + e, f);
	}
    function removeEvent(o, e, f) {
        if (window.removeEventListener) o.removeEventListener(e, f, false);
        else if (window.detachEvent) r = o.detachEvent('on' + e, f);
    }
	
	/* ===== create image reflexion ==== */
	function createReflexion(cont, img) {
		var flx = false;
		if (document.createElement("canvas").getContext) {
			/* ---- canvas ---- */
			flx = document.createElement("canvas");
			flx.width = img.width;
			flx.height = img.height;
			var context = flx.getContext("2d");
			context.translate(0, img.height);
			context.scale(1, -1);
			context.drawImage(img, 0, 0, img.width, img.height);
			flx.style.opacity = '0.02';
		} else {
			/* ---- DXImageTransform ---- */
			flx     = document.createElement('img');
			flx.src = img.src;
			flx.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(' +
			                   'opacity=2, style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy=' +
							   (img.height * .25) + ')';
		}
		
		/* ---- insert Reflexion ---- */
		flx.style.position = 'absolute';
		flx.style.left     = '-9999px';
		cont.appendChild(flx);
		return flx;
	}
	
	/** 
	 * ImageFlow Constructor 
	 */
	function ImageFlow(id, horizon, size, zoom, border, start, reflex) {
		this.diapos      = [];
		this.scr         = false;
		this.id          = id;
		this.horizon     = horizon;
		this.size        = size;
		this.zoom        = zoom;
		this.bdw         = border;
		this.start       = start;
		this.reflexion   = reflex;
		this.oc          = document.getElementById(id);
		this.scrollbar   = getElementsByClass(this.oc.parentNode, 'div', 'scrollbar');
		this.bar         = getElementsByClass(this.oc.parentNode, 'div', 'bar');
		this.arL         = getElementsByClass(this.oc.parentNode, 'a', 'left');
		this.arR         = getElementsByClass(this.oc.parentNode, 'a', 'right');
		this.bw          = this.bar.style.width;
		this.alw         = this.arL.offsetWidth;
		this.arw         = this.arR.offsetWidth;
		this.bar.parent  = this.oc.parent  = this;
		this.arL.parent  = this.arR.parent = this;
		this.view        = this.back       = -1;
		this.resize();
		this.oc.onselectstart = function() { return false; };
		this.isScrolling = false;
		this.getIndex    = function(node) {
			for (i = 0; i < node.length; i++) {
				if(node[i].className == "current ") return i;
			}
		};
        this.preventDefault = function(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            e.returnValue = false;
        };
		
		/* ---- create images ---- */
		this.li    = this.oc.getElementsByTagName('li');
		this.NF    = this.li.length;
		this.start = this.start == null ? this.getIndex(this.li) : start;

        /* ---- hide scrollbar if 1 element ---- */
        if(this.NF == 1) { this.scrollbar.style.display = "none"; }

		for (var i = 0; i < this.NF; i++) {
			this.diapos[i] = new Diapo(this, i, this.li, this.start);
		}

        /* ==== add mouse wheel events ==== */
//        addEvent(this.oc, 'mouseover', function(e) {
//            addEvent(window, 'DOMMouseScroll', this.parent.preventDefault);
//
//            addEvent(this, 'DOMMouseScroll', function(e) {
//
//            });
//            this.addEventListener('DOMMouseScroll', function(e) {
//                this.parent.scroll(-e.detail);
//            });
//        });
//        addEvent(this.oc, 'mouseout', function(e) {
//            removeEvent(window, 'DOMMouseScroll', this.parent.preventDefault);
//        });

        /* ==== add mouse wheel events ==== */
        // window scrolling is disabled if target is imageFlow object
		if (window.addEventListener) {
            this.oc.addEventListener('DOMMouseScroll', function(e) {
                window.addEventListener('DOMMouseScroll', this.parent.preventDefault, false);
                this.parent.scroll(-e.detail);
            }, false);

            this.oc.addEventListener('mouseout', function() {
                window.removeEventListener('DOMMouseScroll', this.parent.preventDefault, false);
            }, false);
        /* IE */
        } else {
            this.oc.onmousewheel = function () {
                this.parent.scroll(event.wheelDelta);
                return false;
            };
        }
		
		/* ==== scrollbar drag N drop ==== */
		this.bar.onmousedown = function (e) {
			if (!e) e = window.event;
			var scl = e.screenX - this.offsetLeft;
            var ow  = this.offsetWidth;

			var self = this.parent;

			/* ---- move bar ---- */
			document.onmousemove = function (e) {
				self.isScrolling = true;
				if (!e) e = window.event;
				self.bar.style.left = Math.round(Math.min((self.ws - self.arw - self.bw - ow), Math.max(self.alw, e.screenX - scl))) + 'px';
				self.view = Math.round(((e.screenX - scl) ) / (self.ws - self.alw - self.arw - self.bw) * (self.NF-1));
				if (self.view != self.back) self.calc();
				return false;
			};
			/* ---- release scrollbar ---- */
            document.onmouseup = function (e) {
				self.isScrolling = false;
				document.onmousemove = null;
				return false;
			};
			return false;
		};
        /* ==== left arrow ==== */
        this.arL.onclick = function () {
            if (this.parent.view > 0) this.parent.calc(-1);
            return false;
        };
		/* ==== right arrow ==== */
		this.arR.onclick = function () {
			if (this.parent.view < this.parent.NF - 1) this.parent.calc(1);
		    return false;
        };
	}
	
	/** 
	 * ImageFlow prototype 
	 */
	ImageFlow.prototype = {
		/* ==== targets ==== */
		calc : function (inc) {
			if (inc) this.view += inc;
			
			var tw = 0,
				lw = 0,
				o = this.diapos[this.view],
                ow = this.bar.offsetWidth;
			
			if (o && o.loaded) {
				/* ---- reset ---- */
//				var ob = this.diapos[this.back];
//				if (ob && ob != o) {
//					ob.a.className = 'diapo';
//					ob.z1 = 1;
//				}
				/* ---- calculate target sizes & positions ---- */
				if(o.r < 1) {
					o.w1 = Math.min(o.iw, this.wh * .8, Math.round(this.ht * this.horizon / o.r)) * o.z1;
			    } else {
					o.w1 = Math.round(this.ht * this.horizon / o.r) * o.z1;
				}
				var x0 = o.x1 = (this.wh * .5) - (o.w1 * .5);
				var x = x0 + o.w1 + this.bdw;
				
				for (var i = this.view + 1, o; o = this.diapos[i]; i++) {
					o.x1 = x;
					o.w1 = (this.ht / o.r) * this.size;
					x   += o.w1 + this.bdw;
					tw  += o.w1 + this.bdw;
				}
				x = x0 - this.bdw;
				
				for (var i = this.view - 1, o; o = this.diapos[i]; i--) {
					o.w1 = (this.ht / o.r) * this.size;
					o.x1 = x - o.w1;
					x   -= o.w1 + this.bdw;
					tw  += o.w1 + this.bdw;
					lw  += o.w1 + this.bdw;
				}
				/* ---- move scrollbar ---- */
				if (!this.scr && tw && !this.isScrolling) {
					var r = (this.ws - this.alw - this.arw - this.bw - ow) / tw;
					this.bar.style.left = Math.round(this.alw + lw * r) + 'px';
				}
				/* ---- save preview view ---- */
				this.back = this.view;
			}
		},
		/* ==== mousewheel scrolling ==== */
		scroll : function (sc) {
			if (sc < 0) {
				if (this.view < this.NF - 1) this.calc(1);
			} else {
				if (this.view > 0) this.calc(-1);
			}
		},
		/* ==== resize  ==== */
		resize : function () {
			this.wh = this.oc.clientWidth;
			this.ht = this.oc.clientHeight;
			this.ws = this.scrollbar.offsetWidth;
			this.calc();
			this.run(true);
		},
		/* ==== animation loop ==== */
		run : function (res) {
			/* ---- move all images ---- */
			var i = this.NF;
			while (i--) this.diapos[i].move(res);
		}
	};
	
	/** 
	 * Diapo Constructor 
	 */
	Diapo = function (parent, i, li, start) {
		this.loaded        = false;
		this.parent        = parent;
		this.i			   = i;
		this.li			   = li[this.i];
		this.a			   = this.li.children[0];
		this.a.onclick     = function() { parent.diapos[i].click(); };
		this.img		   = this.a.children[0];
		this.start         = start;
		this.x0            = this.parent.oc.clientWidth / 2;
		this.x1            = this.x0;
		this.w0            = 0;
		this.w1            = 0;
		this.z1            = 1;
		this.z2            = 0;
		
		this.li.className += "diapo";
	};
	
	/** 
	 * Diapo prototype 
	 */
	Diapo.prototype = {
		/* ==== HTML rendering ==== */
		move : function (res) {
			var that = this.parent;
			if (this.loaded) {
				var sx = this.x1 - this.x0;
				var sw = this.w1 - this.w0;
					
				if (Math.abs(sx) > .1 || Math.abs(sw) > .1 || res) {
					/* ---- paint only when moving ---- */
					this.x0 += sx * .1;
					this.w0 += sw * .1;

					var h = this.w0 * this.r;
					//this.z2 = Math.ceil((that.ht * that.horizon + 1 - this.z2 - h) * .5);
					var is = this.img.style;
					var ls = this.li.style;

					if (this.x0 < that.wh && this.x0 + this.w0 > 0) {
						/* ---- paint only visible images ---- */
						this.visible = true;
						ls.display = 'block';
						
						/* ---- diapo ---- */
						ls.left   = Math.round(this.x0) + 'px';
						ls.bottom = Math.round(that.ht * (1 - that.horizon)) + 'px';
						is.width  = Math.round(this.w0) + 'px';
						is.height = Math.round(h) + 'px';
						/* ---- reflexion ---- */
						if (this.flx) {
							var fs = this.flx.style;
							fs.left   = Math.floor(this.x0) + 'px';
							fs.top    = Math.ceil(that.ht * that.horizon + 1) + 'px';
							fs.width  = Math.floor(this.w0) + 'px';
							fs.height = Math.floor(h) + 'px';
						}
					} else {
						/* ---- disable invisible images ---- */
						if (this.visible) {
							this.visible = false;
							ls.display = 'none';
							if (this.flx) this.flx.style.width = '0px';
						}
					}
				}
			} else {
				/* ==== image onload ==== */
				if (this.img.complete && this.img.width) {
					/* ---- get size image ---- */
					this.iw     = this.img.width;
					this.ih     = this.img.height;
					this.r      = this.ih / this.iw;
					this.loaded = true;
					
					/* ---- create reflexion ---- */
					if (that.reflexion) this.flx = createReflexion(that.oc, this.img);
					
					if (that.view < 0) that.view = this.i;
					else if (this.i == 0) that.view = this.i;

					that.calc(that.start);
				}
			}
		},
		/* ==== diapo onclick ==== */
		click : function () {
			if (this.parent.view == this.i) {
				/* ---- zoom in/out ---- */
				this.z1 = this.z1 == 1 ? this.parent.zoom : 1;
				this.parent.calc();
			} else {
				/* ---- select diapo ---- */
				this.parent.view = this.i;
				this.parent.calc();
			}
			return false;
		}
	};
	
	/* ==== public methods ==== */
	return {
		/* ==== initialize script ==== */
		create : function (id, horizon, size, zoom, border, start, reflex) {

			/* ---- instanciate imageFlow ---- */
			var load = function () {

                if (document.readyState === "complete") {

                    /* ---- push new imageFlow instance ---- */
                    instances.push(new ImageFlow(id, horizon, size, zoom, border, start, reflex));

                    document.getElementById(id).setAttribute('style', 'visibility:visible');

                    /* ---- window resize event ---- */
                    addEvent(window, 'resize', function () {
                        var i = instances.length;
                        while (i--) instances[i].resize();
                    });
                    /* ---- stop drag N drop ---- */
                    addEvent(document.getElementById(id), 'mouseout', function (e) {
                        if (!e) e = window.event;
                        var tg = e.relatedTarget || e.toElement;
                        if (tg && tg.tagName == 'HTML') {
                            var i = instances.length;
                            while (i--) instances[i].oc.onmousemove = null;
                        }
                        return false;
                    });
                    /* ---- set interval loop ---- */
                    setInterval(function () {
                        var i = instances.length;
                        while (i--) instances[i].run();
                    }, 10);
                }
			};
			/* ---- window onload event ---- */
			addEvent(window, 'load', function () { load(); });
		}
	}
}();
 
/**
 * Creates ImageFlow
 *
 * @param {string}       id
 * @param {(int|float)}  horizon  0 to 1
 * @param {(int|float)}  size
 * @param {(int|float)}  zoom     1 = no zoom  
 * @param {int}          border
 * @param {(int|null)}   start    null if li has "active" class
 * @param {boolean}      reflexion
 *
 */
imf.create("imh__media-gallery", 0.725, 0.466, 1, 20, 2, false);
(function () {
    'use strict';

    var isCommonjs = typeof module !== 'undefined' && module.exports;
    var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

    var fn = (function () {
        var val;
        var valLength;

        var fnMap = [
            [
                'requestFullscreen',
                'exitFullscreen',
                'fullscreenElement',
                'fullscreenEnabled',
                'fullscreenchange',
                'fullscreenerror'
            ],
            // new WebKit
            [
                'webkitRequestFullscreen',
                'webkitExitFullscreen',
                'webkitFullscreenElement',
                'webkitFullscreenEnabled',
                'webkitfullscreenchange',
                'webkitfullscreenerror'

            ],
            // old WebKit (Safari 5.1)
            [
                'webkitRequestFullScreen',
                'webkitCancelFullScreen',
                'webkitCurrentFullScreenElement',
                'webkitCancelFullScreen',
                'webkitfullscreenchange',
                'webkitfullscreenerror'

            ],
            [
                'mozRequestFullScreen',
                'mozCancelFullScreen',
                'mozFullScreenElement',
                'mozFullScreenEnabled',
                'mozfullscreenchange',
                'mozfullscreenerror'
            ],
            [
                'msRequestFullscreen',
                'msExitFullscreen',
                'msFullscreenElement',
                'msFullscreenEnabled',
                'MSFullscreenChange',
                'MSFullscreenError'
            ]
        ];

        var i = 0;
        var l = fnMap.length;
        var ret = {};

        for (; i < l; i++) {
            val = fnMap[i];
            if (val && val[1] in document) {
                for (i = 0, valLength = val.length; i < valLength; i++) {
                    ret[fnMap[0][i]] = val[i];
                }
                return ret;
            }
        }

        return false;
    })();

    var screenfull = {
        request: function (elem) {
            var request = fn.requestFullscreen;

            elem = elem || document.documentElement;

            // Work around Safari 5.1 bug: reports support for
            // keyboard in fullscreen even though it doesn't.
            // Browser sniffing, since the alternative with
            // setTimeout is even worse.
            if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
                elem[request]();
            } else {
                elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
            }
        },
        exit: function () {
            document[fn.exitFullscreen]();
        },
        toggle: function (elem) {
            if (this.isFullscreen) {
                this.exit();
            } else {
                this.request(elem);
            }
        },
        raw: fn
    };

    if (!fn) {
        if (isCommonjs) {
            module.exports = false;
        } else {
            window.screenfull = false;
        }

        return;
    }

    Object.defineProperties(screenfull, {
        isFullscreen: {
            get: function () {
                return !!document[fn.fullscreenElement];
            }
        },
        element: {
            enumerable: true,
            get: function () {
                return document[fn.fullscreenElement];
            }
        },
        enabled: {
            enumerable: true,
            get: function () {
                // Coerce to boolean in case of old WebKit
                return !!document[fn.fullscreenEnabled];
            }
        }
    });

    if (isCommonjs) {
        module.exports = screenfull;
    } else {
        window.screenfull = screenfull;
    }
})();
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
                content: '.imh__content',
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

/*! noUiSlider - 7.0.9 - 2014-10-08 16:49:44 */

/*jslint browser: true */
/*jslint white: true */

(function( $ ){

	'use strict';


	// Removes duplicates from an array.
	function unique(array) {
		return $.grep(array, function(el, index) {
			return index === $.inArray(el, array);
		});
	}

	// Round a value to the closest 'to'.
	function closest ( value, to ) {
		return Math.round(value / to) * to;
	}

	// Checks whether a value is numerical.
	function isNumeric ( a ) {
		return typeof a === 'number' && !isNaN( a ) && isFinite( a );
	}

	// Rounds a number to 7 supported decimals.
	function accurateNumber( number ) {
		var p = Math.pow(10, 7);
		return Number((Math.round(number*p)/p).toFixed(7));
	}

	// Sets a class and removes it after [duration] ms.
	function addClassFor ( element, className, duration ) {
		element.addClass(className);
		setTimeout(function(){
			element.removeClass(className);
		}, duration);
	}

	// Limits a value to 0 - 100
	function limit ( a ) {
		return Math.max(Math.min(a, 100), 0);
	}

	// Wraps a variable as an array, if it isn't one yet.
	function asArray ( a ) {
		return $.isArray(a) ? a : [a];
	}


	var
	// Cache the document selector;
	/** @const */
	doc = $(document),
	// Make a backup of the original jQuery/Zepto .val() method.
	/** @const */
	$val = $.fn.val,
	// Namespace for binding and unbinding slider events;
	/** @const */
	namespace = '.nui',
	// Determine the events to bind. IE11 implements pointerEvents without
	// a prefix, which breaks compatibility with the IE10 implementation.
	/** @const */
	actions = window.navigator.pointerEnabled ? {
		start: 'pointerdown',
		move: 'pointermove',
		end: 'pointerup'
	} : window.navigator.msPointerEnabled ? {
		start: 'MSPointerDown',
		move: 'MSPointerMove',
		end: 'MSPointerUp'
	} : {
		start: 'mousedown touchstart',
		move: 'mousemove touchmove',
		end: 'mouseup touchend'
	},
	// Re-usable list of classes;
	/** @const */
	Classes = [
/*  0 */  'noUi-target'
/*  1 */ ,'noUi-base'
/*  2 */ ,'noUi-origin'
/*  3 */ ,'noUi-handle'
/*  4 */ ,'noUi-horizontal'
/*  5 */ ,'noUi-vertical'
/*  6 */ ,'noUi-background'
/*  7 */ ,'noUi-connect'
/*  8 */ ,'noUi-ltr'
/*  9 */ ,'noUi-rtl'
/* 10 */ ,'noUi-dragable'
/* 11 */ ,''
/* 12 */ ,'noUi-state-drag'
/* 13 */ ,''
/* 14 */ ,'noUi-state-tap'
/* 15 */ ,'noUi-active'
/* 16 */ ,''
/* 17 */ ,'noUi-stacking'
	];


// Value calculation

	// Determine the size of a sub-range in relation to a full range.
	function subRangeRatio ( pa, pb ) {
		return (100 / (pb - pa));
	}

	// (percentage) How many percent is this value of this range?
	function fromPercentage ( range, value ) {
		return (value * 100) / ( range[1] - range[0] );
	}

	// (percentage) Where is this value on this range?
	function toPercentage ( range, value ) {
		return fromPercentage( range, range[0] < 0 ?
			value + Math.abs(range[0]) :
				value - range[0] );
	}

	// (value) How much is this percentage on this range?
	function isPercentage ( range, value ) {
		return ((value * ( range[1] - range[0] )) / 100) + range[0];
	}


// Range conversion

	function getJ ( value, arr ) {

		var j = 1;

		while ( value >= arr[j] ){
			j += 1;
		}

		return j;
	}

	// (percentage) Input a value, find where, on a scale of 0-100, it applies.
	function toStepping ( xVal, xPct, value ) {

		if ( value >= xVal.slice(-1)[0] ){
			return 100;
		}

		var j = getJ( value, xVal ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return pa + (toPercentage([va, vb], value) / subRangeRatio (pa, pb));
	}

	// (value) Input a percentage, find where it is on the specified range.
	function fromStepping ( xVal, xPct, value ) {

		// There is no range group that fits 100
		if ( value >= 100 ){
			return xVal.slice(-1)[0];
		}

		var j = getJ( value, xPct ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return isPercentage([va, vb], (value - pa) * subRangeRatio (pa, pb));
	}

	// (percentage) Get the step that applies at a certain value.
	function getStep ( xPct, xSteps, snap, value ) {

		if ( value === 100 ) {
			return value;
		}

		var j = getJ( value, xPct ), a, b;

		// If 'snap' is set, steps are used as fixed points on the slider.
		if ( snap ) {

			a = xPct[j-1];
			b = xPct[j];

			// Find the closest position, a or b.
			if ((value - a) > ((b-a)/2)){
				return b;
			}

			return a;
		}

		if ( !xSteps[j-1] ){
			return value;
		}

		return xPct[j-1] + closest(
			value - xPct[j-1],
			xSteps[j-1]
		);
	}


// Entry parsing

	function handleEntryPoint ( index, value, that ) {

		var percentage;

		// Wrap numerical input in an array.
		if ( typeof value === "number" ) {
			value = [value];
		}

		// Reject any invalid input, by testing whether value is an array.
		if ( Object.prototype.toString.call( value ) !== '[object Array]' ){
			throw new Error("noUiSlider: 'range' contains invalid value.");
		}

		// Covert min/max syntax to 0 and 100.
		if ( index === 'min' ) {
			percentage = 0;
		} else if ( index === 'max' ) {
			percentage = 100;
		} else {
			percentage = parseFloat( index );
		}

		// Check for correct input.
		if ( !isNumeric( percentage ) || !isNumeric( value[0] ) ) {
			throw new Error("noUiSlider: 'range' value isn't numeric.");
		}

		// Store values.
		that.xPct.push( percentage );
		that.xVal.push( value[0] );

		// NaN will evaluate to false too, but to keep
		// logging clear, set step explicitly. Make sure
		// not to override the 'step' setting with false.
		if ( !percentage ) {
			if ( !isNaN( value[1] ) ) {
				that.xSteps[0] = value[1];
			}
		} else {
			that.xSteps.push( isNaN(value[1]) ? false : value[1] );
		}
	}

	function handleStepPoint ( i, n, that ) {

		// Ignore 'false' stepping.
		if ( !n ) {
			return true;
		}

		// Factor to range ratio
		that.xSteps[i] = fromPercentage([
			 that.xVal[i]
			,that.xVal[i+1]
		], n) / subRangeRatio (
			that.xPct[i],
			that.xPct[i+1] );
	}


// Interface

	// The interface to Spectrum handles all direction-based
	// conversions, so the above values are unaware.

	function Spectrum ( entry, snap, direction, singleStep ) {

		this.xPct = [];
		this.xVal = [];
		this.xSteps = [ singleStep || false ];
		this.xNumSteps = [ false ];

		this.snap = snap;
		this.direction = direction;

		var that = this, index;

		// Loop all entries.
		for ( index in entry ) {
			if ( entry.hasOwnProperty(index) ) {
				handleEntryPoint(index, entry[index], that);
			}
		}

		// Store the actual step values.
		that.xNumSteps = that.xSteps.slice(0);

		for ( index in that.xNumSteps ) {
			if ( that.xNumSteps.hasOwnProperty(index) ) {
				handleStepPoint(Number(index), that.xNumSteps[index], that);
			}
		}
	}

	Spectrum.prototype.getMargin = function ( value ) {
		return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
	};

	Spectrum.prototype.toStepping = function ( value ) {

		value = toStepping( this.xVal, this.xPct, value );

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.fromStepping = function ( value ) {

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return accurateNumber(fromStepping( this.xVal, this.xPct, value ));
	};

	Spectrum.prototype.getStep = function ( value ) {

		// Find the proper step for rtl sliders by search in inverse direction.
		// Fixes issue #262.
		if ( this.direction ) {
			value = 100 - value;
		}

		value = getStep(this.xPct, this.xSteps, this.snap, value );

		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.getApplicableStep = function ( value ) {

		// If the value is 100%, return the negative step twice.
		var j = getJ(value, this.xPct), offset = value === 100 ? 2 : 1;
		return [this.xNumSteps[j-2], this.xVal[j-offset], this.xNumSteps[j-offset]];
	};

	// Outside testing
	Spectrum.prototype.convert = function ( value ) {
		return this.getStep(this.toStepping(value));
	};

/*	Every input option is tested and parsed. This'll prevent
	endless validation in internal methods. These tests are
	structured with an item for every option available. An
	option can be marked as required by setting the 'r' flag.
	The testing function is provided with three arguments:
		- The provided value for the option;
		- A reference to the options object;
		- The name for the option;

	The testing function returns false when an error is detected,
	or true when everything is OK. It can also modify the option
	object, to make sure all values can be correctly looped elsewhere. */

	/** @const */
	var defaultFormatter = { 'to': function( value ){
		return value.toFixed(2);
	}, 'from': Number };

	function testStep ( parsed, entry ) {

		if ( !isNumeric( entry ) ) {
			throw new Error("noUiSlider: 'step' is not numeric.");
		}

		// The step option can still be used to set stepping
		// for linear sliders. Overwritten if set in 'range'.
		parsed.singleStep = entry;
	}

	function testRange ( parsed, entry ) {

		// Filter incorrect input.
		if ( typeof entry !== 'object' || $.isArray(entry) ) {
			throw new Error("noUiSlider: 'range' is not an object.");
		}

		// Catch missing start or end.
		if ( entry.min === undefined || entry.max === undefined ) {
			throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
		}

		parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.dir, parsed.singleStep);
	}

	function testStart ( parsed, entry ) {

		entry = asArray(entry);

		// Validate input. Values aren't tested, as the public .val method
		// will always provide a valid location.
		if ( !$.isArray( entry ) || !entry.length || entry.length > 2 ) {
			throw new Error("noUiSlider: 'start' option is incorrect.");
		}

		// Store the number of handles.
		parsed.handles = entry.length;

		// When the slider is initialized, the .val method will
		// be called with the start options.
		parsed.start = entry;
	}

	function testSnap ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.snap = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'snap' option must be a boolean.");
		}
	}

	function testAnimate ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.animate = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'animate' option must be a boolean.");
		}
	}

	function testConnect ( parsed, entry ) {

		if ( entry === 'lower' && parsed.handles === 1 ) {
			parsed.connect = 1;
		} else if ( entry === 'upper' && parsed.handles === 1 ) {
			parsed.connect = 2;
		} else if ( entry === true && parsed.handles === 2 ) {
			parsed.connect = 3;
		} else if ( entry === false ) {
			parsed.connect = 0;
		} else {
			throw new Error("noUiSlider: 'connect' option doesn't match handle count.");
		}
	}

	function testOrientation ( parsed, entry ) {

		// Set orientation to an a numerical value for easy
		// array selection.
		switch ( entry ){
		  case 'horizontal':
			parsed.ort = 0;
			break;
		  case 'vertical':
			parsed.ort = 1;
			break;
		  default:
			throw new Error("noUiSlider: 'orientation' option is invalid.");
		}
	}

	function testMargin ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'margin' option must be numeric.");
		}

		parsed.margin = parsed.spectrum.getMargin(entry);

		if ( !parsed.margin ) {
			throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.");
		}
	}

	function testLimit ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'limit' option must be numeric.");
		}

		parsed.limit = parsed.spectrum.getMargin(entry);

		if ( !parsed.limit ) {
			throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.");
		}
	}

	function testDirection ( parsed, entry ) {

		// Set direction as a numerical value for easy parsing.
		// Invert connection for RTL sliders, so that the proper
		// handles get the connect/background classes.
		switch ( entry ) {
		  case 'ltr':
			parsed.dir = 0;
			break;
		  case 'rtl':
			parsed.dir = 1;
			parsed.connect = [0,2,1,3][parsed.connect];
			break;
		  default:
			throw new Error("noUiSlider: 'direction' option was not recognized.");
		}
	}

	function testBehaviour ( parsed, entry ) {

		// Make sure the input is a string.
		if ( typeof entry !== 'string' ) {
			throw new Error("noUiSlider: 'behaviour' must be a string containing options.");
		}

		// Check if the string contains any keywords.
		// None are required.
		var tap = entry.indexOf('tap') >= 0,
			drag = entry.indexOf('drag') >= 0,
			fixed = entry.indexOf('fixed') >= 0,
			snap = entry.indexOf('snap') >= 0;

		parsed.events = {
			tap: tap || snap,
			drag: drag,
			fixed: fixed,
			snap: snap
		};
	}

	function testFormat ( parsed, entry ) {

		parsed.format = entry;

		// Any object with a to and from method is supported.
		if ( typeof entry.to === 'function' && typeof entry.from === 'function' ) {
			return true;
		}

		throw new Error( "noUiSlider: 'format' requires 'to' and 'from' methods.");
	}

	// Test all developer settings and parse to assumption-safe values.
	function testOptions ( options ) {

		var parsed = {
			margin: 0,
			limit: 0,
			animate: true,
			format: defaultFormatter
		}, tests;

		// Tests are executed in the order they are presented here.
		tests = {
			'step': { r: false, t: testStep },
			'start': { r: true, t: testStart },
			'connect': { r: true, t: testConnect },
			'direction': { r: true, t: testDirection },
			'snap': { r: false, t: testSnap },
			'animate': { r: false, t: testAnimate },
			'range': { r: true, t: testRange },
			'orientation': { r: false, t: testOrientation },
			'margin': { r: false, t: testMargin },
			'limit': { r: false, t: testLimit },
			'behaviour': { r: true, t: testBehaviour },
			'format': { r: false, t: testFormat }
		};

		// Set defaults where applicable.
		options = $.extend({
			'connect': false,
			'direction': 'ltr',
			'behaviour': 'tap',
			'orientation': 'horizontal'
		}, options);

		// Run all options through a testing mechanism to ensure correct
		// input. It should be noted that options might get modified to
		// be handled properly. E.g. wrapping integers in arrays.
		$.each( tests, function( name, test ){

			// If the option isn't set, but it is required, throw an error.
			if ( options[name] === undefined ) {

				if ( test.r ) {
					throw new Error("noUiSlider: '" + name + "' is required.");
				}

				return true;
			}

			test.t( parsed, options[name] );
		});

		// Pre-define the styles.
		parsed.style = parsed.ort ? 'top' : 'left';

		return parsed;
	}

// Class handling

	// Delimit proposed values for handle positions.
	function getPositions ( a, b, delimit ) {

		// Add movement to current position.
		var c = a + b[0], d = a + b[1];

		// Only alter the other position on drag,
		// not on standard sliding.
		if ( delimit ) {
			if ( c < 0 ) {
				d += Math.abs(c);
			}
			if ( d > 100 ) {
				c -= ( d - 100 );
			}

			// Limit values to 0 and 100.
			return [limit(c), limit(d)];
		}

		return [c,d];
	}


// Event handling

	// Provide a clean event with standardized offset values.
	function fixEvent ( e ) {

		// Prevent scrolling and panning on touch events, while
		// attempting to slide. The tap event also depends on this.
		e.preventDefault();

		// Filter the event to register the type, which can be
		// touch, mouse or pointer. Offset changes need to be
		// made on an event specific basis.
		var  touch = e.type.indexOf('touch') === 0
			,mouse = e.type.indexOf('mouse') === 0
			,pointer = e.type.indexOf('pointer') === 0
			,x,y, event = e;

		// IE10 implemented pointer events with a prefix;
		if ( e.type.indexOf('MSPointer') === 0 ) {
			pointer = true;
		}

		// Get the originalEvent, if the event has been wrapped
		// by jQuery. Zepto doesn't wrap the event.
		if ( e.originalEvent ) {
			e = e.originalEvent;
		}

		if ( touch ) {
			// noUiSlider supports one movement at a time,
			// so we can select the first 'changedTouch'.
			x = e.changedTouches[0].pageX;
			y = e.changedTouches[0].pageY;
		}

		if ( mouse || pointer ) {

			// Polyfill the pageXOffset and pageYOffset
			// variables for IE7 and IE8;
			if( !pointer && window.pageXOffset === undefined ){
				window.pageXOffset = document.documentElement.scrollLeft;
				window.pageYOffset = document.documentElement.scrollTop;
			}

			x = e.clientX + window.pageXOffset;
			y = e.clientY + window.pageYOffset;
		}

		event.points = [x, y];
		event.cursor = mouse;

		return event;
	}


// DOM additions

	// Append a handle to the base.
	function addHandle ( direction, index ) {

		var handle = $('<div><div/></div>').addClass( Classes[2] ),
			additions = [ '-lower', '-upper' ];

		if ( direction ) {
			additions.reverse();
		}

		handle.children().addClass(
			Classes[3] + " " + Classes[3]+additions[index]
		);

		return handle;
	}

	// Add the proper connection classes.
	function addConnection ( connect, target, handles ) {

		// Apply the required connection classes to the elements
		// that need them. Some classes are made up for several
		// segments listed in the class list, to allow easy
		// renaming and provide a minor compression benefit.
		switch ( connect ) {
			case 1:	target.addClass( Classes[7] );
					handles[0].addClass( Classes[6] );
					break;
			case 3: handles[1].addClass( Classes[6] );
					/* falls through */
			case 2: handles[0].addClass( Classes[7] );
					/* falls through */
			case 0: target.addClass(Classes[6]);
					break;
		}
	}

	// Add handles to the slider base.
	function addHandles ( nrHandles, direction, base ) {

		var index, handles = [];

		// Append handles.
		for ( index = 0; index < nrHandles; index += 1 ) {

			// Keep a list of all added handles.
			handles.push( addHandle( direction, index ).appendTo(base) );
		}

		return handles;
	}

	// Initialize a single slider.
	function addSlider ( direction, orientation, target ) {

		// Apply classes and data to the target.
		target.addClass([
			Classes[0],
			Classes[8 + direction],
			Classes[4 + orientation]
		].join(' '));

		return $('<div/>').appendTo(target).addClass( Classes[1] );
	}

function closure ( target, options, originalOptions ){

// Internal variables

	// All variables local to 'closure' are marked $.
	var $Target = $(target),
		$Locations = [-1, -1],
		$Base,
		$Handles,
		$Spectrum = options.spectrum,
		$Values = [],
	// libLink. For rtl sliders, 'lower' and 'upper' should not be inverted
	// for one-handle sliders, so trim 'upper' it that case.
		triggerPos = ['lower', 'upper'].slice(0, options.handles);

	// Invert the libLink connection for rtl sliders.
	if ( options.dir ) {
		triggerPos.reverse();
	}

// Helpers

	// Shorthand for base dimensions.
	function baseSize ( ) {
		return $Base[['width', 'height'][options.ort]]();
	}

	// External event handling
	function fireEvents ( events ) {

		// Use the external api to get the values.
		// Wrap the values in an array, as .trigger takes
		// only one additional argument.
		var index, values = [ $Target.val() ];

		for ( index = 0; index < events.length; index += 1 ){
			$Target.trigger(events[index], values);
		}
	}

	// Returns the input array, respecting the slider direction configuration.
	function inSliderOrder ( values ) {

		// If only one handle is used, return a single value.
		if ( values.length === 1 ){
			return values[0];
		}

		if ( options.dir ) {
			return values.reverse();
		}

		return values;
	}

// libLink integration

	// Create a new function which calls .val on input change.
	function createChangeHandler ( trigger ) {
		return function ( ignore, value ){
			// Determine which array position to 'null' based on 'trigger'.
			$Target.val( [ trigger ? null : value, trigger ? value : null ], true );
		};
	}

	// Called by libLink when it wants a set of links updated.
	function linkUpdate ( flag ) {

		var trigger = $.inArray(flag, triggerPos);

		// The API might not have been set yet.
		if ( $Target[0].linkAPI && $Target[0].linkAPI[flag] ) {
			$Target[0].linkAPI[flag].change(
				$Values[trigger],
				$Handles[trigger].children(),
				$Target
			);
		}
	}

	// Called by libLink to append an element to the slider.
	function linkConfirm ( flag, element ) {

		// Find the trigger for the passed flag.
		var trigger = $.inArray(flag, triggerPos);

		// If set, append the element to the handle it belongs to.
		if ( element ) {
			element.appendTo( $Handles[trigger].children() );
		}

		// The public API is reversed for rtl sliders, so the changeHandler
		// should not be aware of the inverted trigger positions.
		// On rtl slider with one handle, 'lower' should be used.
		if ( options.dir && options.handles > 1 ) {
			trigger = trigger === 1 ? 0 : 1;
		}

		return createChangeHandler( trigger );
	}

	// Place elements back on the slider.
	function reAppendLink ( ) {

		var i, flag;

		// The API keeps a list of elements: we can re-append them on rebuild.
		for ( i = 0; i < triggerPos.length; i += 1 ) {
			if ( this.linkAPI && this.linkAPI[(flag = triggerPos[i])] ) {
				this.linkAPI[flag].reconfirm(flag);
			}
		}
	}

	target.LinkUpdate = linkUpdate;
	target.LinkConfirm = linkConfirm;
	target.LinkDefaultFormatter = options.format;
	target.LinkDefaultFlag = 'lower';

	target.reappend = reAppendLink;


	// Handler for attaching events trough a proxy.
	function attach ( events, element, callback, data ) {

		// This function can be used to 'filter' events to the slider.

		// Add the noUiSlider namespace to all events.
		events = events.replace( /\s/g, namespace + ' ' ) + namespace;

		// Bind a closure on the target.
		return element.on( events, function( e ){

			// jQuery and Zepto (1) handle unset attributes differently,
			// but always falsy; #208
			if ( !!$Target.attr('disabled') ) {
				return false;
			}

			// Stop if an active 'tap' transition is taking place.
			if ( $Target.hasClass( Classes[14] ) ) {
				return false;
			}

			e = fixEvent(e);
			e.calcPoint = e.points[ options.ort ];

			// Call the event handler with the event [ and additional data ].
			callback ( e, data );
		});
	}

	// Handle movement on document for handle and range drag.
	function move ( event, data ) {

		var handles = data.handles || $Handles, positions, state = false,
			proposal = ((event.calcPoint - data.start) * 100) / baseSize(),
			h = handles[0][0] !== $Handles[0][0] ? 1 : 0;

		// Calculate relative positions for the handles.
		positions = getPositions( proposal, data.positions, handles.length > 1);

		state = setHandle ( handles[0], positions[h], handles.length === 1 );

		if ( handles.length > 1 ) {
			state = setHandle ( handles[1], positions[h?0:1], false ) || state;
		}

		// Fire the 'slide' event if any handle moved.
		if ( state ) {
			fireEvents(['slide']);
		}
	}

	// Unbind move events on document, call callbacks.
	function end ( event ) {

		// The handle is no longer active, so remove the class.
		$('.' + Classes[15]).removeClass(Classes[15]);

		// Remove cursor styles and text-selection events bound to the body.
		if ( event.cursor ) {
			$('body').css('cursor', '').off( namespace );
		}

		// Unbind the move and end events, which are added on 'start'.
		doc.off( namespace );

		// Remove dragging class.
		$Target.removeClass(Classes[12]);

		// Fire the change and set events.
		fireEvents(['set', 'change']);
	}

	// Bind move events on document.
	function start ( event, data ) {

		// Mark the handle as 'active' so it can be styled.
		if( data.handles.length === 1 ) {
			data.handles[0].children().addClass(Classes[15]);
		}

		// A drag should never propagate up to the 'tap' event.
		event.stopPropagation();

		// Attach the move event.
		attach ( actions.move, doc, move, {
			start: event.calcPoint,
			handles: data.handles,
			positions: [
				$Locations[0],
				$Locations[$Handles.length - 1]
			]
		});

		// Unbind all movement when the drag ends.
		attach ( actions.end, doc, end, null );

		// Text selection isn't an issue on touch devices,
		// so adding cursor styles can be skipped.
		if ( event.cursor ) {

			// Prevent the 'I' cursor and extend the range-drag cursor.
			$('body').css('cursor', $(event.target).css('cursor'));

			// Mark the target with a dragging state.
			if ( $Handles.length > 1 ) {
				$Target.addClass(Classes[12]);
			}

			// Prevent text selection when dragging the handles.
			$('body').on('selectstart' + namespace, false);
		}
	}

	// Move closest handle to tapped location.
	function tap ( event ) {

		var location = event.calcPoint, total = 0, to;

		// The tap event shouldn't propagate up and cause 'edge' to run.
		event.stopPropagation();

		// Add up the handle offsets.
		$.each( $Handles, function(){
			total += this.offset()[ options.style ];
		});

		// Find the handle closest to the tapped position.
		total = ( location < total/2 || $Handles.length === 1 ) ? 0 : 1;

		location -= $Base.offset()[ options.style ];

		// Calculate the new position.
		to = ( location * 100 ) / baseSize();

		if ( !options.events.snap ) {
			// Flag the slider as it is now in a transitional state.
			// Transition takes 300 ms, so re-enable the slider afterwards.
			addClassFor( $Target, Classes[14], 300 );
		}

		// Find the closest handle and calculate the tapped point.
		// The set handle to the new position.
		setHandle( $Handles[total], to );

		fireEvents(['slide', 'set', 'change']);

		if ( options.events.snap ) {
			start(event, { handles: [$Handles[total]] });
		}
	}

	// Attach events to several slider parts.
	function events ( behaviour ) {

		var i, drag;

		// Attach the standard drag event to the handles.
		if ( !behaviour.fixed ) {

			for ( i = 0; i < $Handles.length; i += 1 ) {

				// These events are only bound to the visual handle
				// element, not the 'real' origin element.
				attach ( actions.start, $Handles[i].children(), start, {
					handles: [ $Handles[i] ]
				});
			}
		}

		// Attach the tap event to the slider base.
		if ( behaviour.tap ) {

			attach ( actions.start, $Base, tap, {
				handles: $Handles
			});
		}

		// Make the range dragable.
		if ( behaviour.drag ){

			drag = $Base.find( '.' + Classes[7] ).addClass( Classes[10] );

			// When the range is fixed, the entire range can
			// be dragged by the handles. The handle in the first
			// origin will propagate the start event upward,
			// but it needs to be bound manually on the other.
			if ( behaviour.fixed ) {
				drag = drag.add($Base.children().not( drag ).children());
			}

			attach ( actions.start, drag, start, {
				handles: $Handles
			});
		}
	}


	// Test suggested values and apply margin, step.
	function setHandle ( handle, to, noLimitOption ) {

		var trigger = handle[0] !== $Handles[0][0] ? 1 : 0,
			lowerMargin = $Locations[0] + options.margin,
			upperMargin = $Locations[1] - options.margin,
			lowerLimit = $Locations[0] + options.limit,
			upperLimit = $Locations[1] - options.limit;

		// For sliders with multiple handles,
		// limit movement to the other handle.
		// Apply the margin option by adding it to the handle positions.
		if ( $Handles.length > 1 ) {
			to = trigger ? Math.max( to, lowerMargin ) : Math.min( to, upperMargin );
		}

		// The limit option has the opposite effect, limiting handles to a
		// maximum distance from another. Limit must be > 0, as otherwise
		// handles would be unmoveable. 'noLimitOption' is set to 'false'
		// for the .val() method, except for pass 4/4.
		if ( noLimitOption !== false && options.limit && $Handles.length > 1 ) {
			to = trigger ? Math.min ( to, lowerLimit ) : Math.max( to, upperLimit );
		}

		// Handle the step option.
		to = $Spectrum.getStep( to );

		// Limit to 0/100 for .val input, trim anything beyond 7 digits, as
		// JavaScript has some issues in its floating point implementation.
		to = limit(parseFloat(to.toFixed(7)));

		// Return false if handle can't move.
		if ( to === $Locations[trigger] ) {
			return false;
		}

		// Set the handle to the new position.
		handle.css( options.style, to + '%' );

		// Force proper handle stacking
		if ( handle.is(':first-child') ) {
			handle.toggleClass(Classes[17], to > 50 );
		}

		// Update locations.
		$Locations[trigger] = to;

		// Convert the value to the slider stepping/range.
		$Values[trigger] = $Spectrum.fromStepping( to );

		linkUpdate(triggerPos[trigger]);

		return true;
	}

	// Loop values from value method and apply them.
	function setValues ( count, values ) {

		var i, trigger, to;

		// With the limit option, we'll need another limiting pass.
		if ( options.limit ) {
			count += 1;
		}

		// If there are multiple handles to be set run the setting
		// mechanism twice for the first handle, to make sure it
		// can be bounced of the second one properly.
		for ( i = 0; i < count; i += 1 ) {

			trigger = i%2;

			// Get the current argument from the array.
			to = values[trigger];

			// Setting with null indicates an 'ignore'.
			// Inputting 'false' is invalid.
			if ( to !== null && to !== false ) {

				// If a formatted number was passed, attemt to decode it.
				if ( typeof to === 'number' ) {
					to = String(to);
				}

				to = options.format.from( to );

				// Request an update for all links if the value was invalid.
				// Do so too if setting the handle fails.
				if ( to === false || isNaN(to) || setHandle( $Handles[trigger], $Spectrum.toStepping( to ), i === (3 - options.dir) ) === false ) {

					linkUpdate(triggerPos[trigger]);
				}
			}
		}
	}

	// Set the slider value.
	function valueSet ( input ) {

		// LibLink: don't accept new values when currently emitting changes.
		if ( $Target[0].LinkIsEmitting ) {
			return this;
		}

		var count, values = asArray( input );

		// The RTL settings is implemented by reversing the front-end,
		// internal mechanisms are the same.
		if ( options.dir && options.handles > 1 ) {
			values.reverse();
		}

		// Animation is optional.
		// Make sure the initial values where set before using animated
		// placement. (no report, unit testing);
		if ( options.animate && $Locations[0] !== -1 ) {
			addClassFor( $Target, Classes[14], 300 );
		}

		// Determine how often to set the handles.
		count = $Handles.length > 1 ? 3 : 1;

		if ( values.length === 1 ) {
			count = 1;
		}

		setValues ( count, values );

		// Fire the 'set' event. As of noUiSlider 7,
		// this is no longer optional.
		fireEvents(['set']);

		return this;
	}

	// Get the slider value.
	function valueGet ( ) {

		var i, retour = [];

		// Get the value from all handles.
		for ( i = 0; i < options.handles; i += 1 ){
			retour[i] = options.format.to( $Values[i] );
		}

		return inSliderOrder( retour );
	}

	// Destroy the slider and unbind all events.
	function destroyTarget ( ) {

		// Unbind events on the slider, remove all classes and child elements.
		$(this).off(namespace)
			.removeClass(Classes.join(' '))
			.empty();

		delete this.LinkUpdate;
		delete this.LinkConfirm;
		delete this.LinkDefaultFormatter;
		delete this.LinkDefaultFlag;
		delete this.reappend;
		delete this.vGet;
		delete this.vSet;
		delete this.getCurrentStep;
		delete this.getInfo;
		delete this.destroy;

		// Return the original options from the closure.
		return originalOptions;
	}

	// Get the current step size for the slider.
	function getCurrentStep ( ) {

		// Check all locations, map them to their stepping point.
		// Get the step point, then find it in the input list.
		var retour = $.map($Locations, function( location, index ){

			var step = $Spectrum.getApplicableStep( location ),
				value = $Values[index],
				increment = step[2],
				decrement = (value - step[2]) >= step[1] ? step[2] : step[0];

			return [[decrement, increment]];
		});

		// Return values in the proper order.
		return inSliderOrder( retour );
	}

	// Get the original set of options.
	function getOriginalOptions ( ) {
		return originalOptions;
	}


// Initialize slider

	// Throw an error if the slider was already initialized.
	if ( $Target.hasClass(Classes[0]) ) {
		throw new Error('Slider was already initialized.');
	}

	// Create the base element, initialise HTML and set classes.
	// Add handles and links.
	$Base = addSlider( options.dir, options.ort, $Target );
	$Handles = addHandles( options.handles, options.dir, $Base );

	// Set the connect classes.
	addConnection ( options.connect, $Target, $Handles );

	// Attach user events.
	events( options.events );

// Methods

	target.vSet = valueSet;
	target.vGet = valueGet;
	target.destroy = destroyTarget;

	target.getCurrentStep = getCurrentStep;
	target.getOriginalOptions = getOriginalOptions;

	target.getInfo = function(){
		return [
			$Spectrum,
			options.style,
			options.ort
		];
	};

	// Use the public value method to set the start values.
	$Target.val( options.start );

}


	// Run the standard initializer
	function initialize ( originalOptions ) {

		// Throw error if group is empty.
		if ( !this.length ){
			throw new Error("noUiSlider: Can't initialize slider on empty selection.");
		}

		// Test the options once, not for every slider.
		var options = testOptions( originalOptions, this );

		// Loop all items, and provide a new closed-scope environment.
		return this.each(function(){
			closure(this, options, originalOptions);
		});
	}

	// Destroy the slider, then re-enter initialization.
	function rebuild ( options ) {

		return this.each(function(){

			// The rebuild flag can be used if the slider wasn't initialized yet.
			if ( !this.destroy ) {
				$(this).noUiSlider( options );
				return;
			}

			// Get the current values from the slider,
			// including the initialization options.
			var values = $(this).val(), originalOptions = this.destroy(),

				// Extend the previous options with the newly provided ones.
				newOptions = $.extend( {}, originalOptions, options );

			// Run the standard initializer.
			$(this).noUiSlider( newOptions );

			// Place Link elements back.
			this.reappend();

			// If the start option hasn't changed,
			// reset the previous values.
			if ( originalOptions.start === newOptions.start ) {
				$(this).val(values);
			}
		});
	}

	// Access the internal getting and setting methods based on argument count.
	function value ( ) {
		return this[0][ !arguments.length ? 'vGet' : 'vSet' ].apply(this[0], arguments);
	}

	// Override the .val() method. Test every element. Is it a slider? Go to
	// the slider value handling. No? Use the standard method.
	// Note how $.fn.val expects 'this' to be an instance of $. For convenience,
	// the above 'value' function does too.
	$.fn.val = function ( arg ) {

		// this === instanceof $

		function valMethod( a ){
			return a.hasClass(Classes[0]) ? value : $val;
		}

		// If no value is passed, this is 'get'.
		if ( arg === undefined ) {
			var first = $(this[0]);
			return valMethod(first).call(first);
		}

		var isFunction = $.isFunction(arg);

		// Return the set so it remains chainable. Make sure not to break
		// jQuery's .val(function( index, value ){}) signature.
		return this.each(function( i ){

			var val = arg, $t = $(this);

			if ( isFunction ) {
				val = arg.call(this, i, $t.val());
			}

			valMethod($t).call($t, val);
		});
	};

// Extend jQuery/Zepto with the noUiSlider method.
	$.fn.noUiSlider = function ( options, rebuildFlag ) {

		switch ( options ) {
			case 'step': return this[0].getCurrentStep();
			case 'options': return this[0].getOriginalOptions();
		}

		return ( rebuildFlag ? rebuild : initialize ).call(this, options);
	};

}( window.jQuery || window.Zepto ));

var YT_ready = function() {

    var cssMedia           = 'media';
    var cssClassPlay       = 'Play';
    var cssClassReplay     = 'Replay';
    var cssClassPause      = 'Pause';
    var cssVolumeCtn       = 'volume';
    var cssVolumeLevelWrap = 'wrap-level';
    var cssVolumeLevel     = 'level';
    var cssVolumeSlider    = 'slider';
    var cssLayer           = 'layer';
    var cssProgBarWrap     = 'progress-bar-wrapper';
    var cssAdvancementBar  = 'advancement';
    var cssBufferBar       = 'buffer';
    var playBtn            = $('.' + cssLayer).find('.play');
    var playPauseBtn       = $('.play-pause a');
    var volumeCtn          = $('.' + cssVolumeCtn);
    var volumeBtn          = volumeCtn.find('a');
    var volumeLevelWrap    = $('.' + cssVolumeLevelWrap);
    var volumeLevel        = volumeLevelWrap.find('.' + cssVolumeLevel);
    var fsButton           = $('.fullscreen a');
    var video              = $('#ytplayer')[0];
    var progressBar        = $('.progress-bar');
    var time               = $('.time');

    var player = new YT.Player('ytplayer', {
        events: {
            'onReady'       : onPlayerReady,
            'onStateChange' : onPlayerStateChange
        }
    });
    var status;
    var timer;
    var slider;
    var playerTotalTime;

    function onPlayerReady(event) {

        status = player.getPlayerState();
        playerTotalTime = player.getDuration();

        time.find('.total').text(formatDuration(playerTotalTime));
        time.width((Math.round(time.width()) + 10 + 'px'));

        progressBar.width($('.' + cssMedia).width() - time.width());

        $('.' + cssProgBarWrap).animate({opacity: 1}, 500);

        playBtn.parent().on('click', function(e) {
            e.preventDefault();
        }).end().on('click', function(e) {
            $(this).parents('.' + cssLayer).animate({
                opacity: 0
            }, 500, function() {
                $(this).hide();
                $(video).css('visibility', 'visible');
            });
            playPause(status);
            e.preventDefault();
        });

        playPauseBtn.off().on('click', function(e) {
            playBtn.click();
            //playPause(status);
            e.preventDefault();
        }).attr('title', cssClassPlay);

        var opts = {
            'start': 50,
            'step': 5,
            'minRange' : 0,
            'maxRange' : 100
        };
        slider = volumeLevel.find('.' + cssVolumeSlider);
        slider.noUiSlider({
            start: [ opts.start ],
            orientation: "vertical",
            behaviour: 'drag',
            step: opts.step,
            range: {
                'min': [ opts.minRange ],
                'max': [ opts.maxRange ]
            }
        }).on('slide', function() {
            var value = opts.maxRange - $(this).val();
            player.setVolume(value);

            switch(Math.round(value)) {
                case opts.minRange: setImage(opts.minRange, true); break;
                case opts.maxRange/4: setImage(opts.maxRange/4, true); break;
                case (opts.maxRange/4)*2: setImage((opts.maxRange/4)*2, true); break;
                case (opts.maxRange/4)*3: setImage((opts.maxRange/4)*3, true); break;
                case opts.maxRange: setImage(opts.maxRange, true); break;
            }
        });

        var setImage = function(range, hovered) {
            volumeBtn.removeClass().addClass('_' + range + (hovered == true ? ' hover' : ''));
        };

        // set css image for the first call
        setImage(opts.start, false);

        volumeBtn.hover(
            function() {
                $(this).addClass('hover');
                animateVolume(volumeLevel, true, true, 'show', '6', 'slow');
            }, function(e) {
                var relTCN = e.relatedTarget.parentNode.className;
                if ((relTCN != cssVolumeLevelWrap) && (relTCN != cssVolumeLevel) && (relTCN != cssVolumeCtn)) {
                    $(this).removeClass('hover');
                    animateVolume(volumeLevel, true, true, 'hide', '10', 'fast');
                } else {
                    volumeLevelWrap.mouseleave(function() {
                        volumeBtn.removeClass('hover');
                        animateVolume(volumeLevel, true, false, 'hide', '10', 'fast');
                    });
                }
            }
        ).click(function(e) { e.preventDefault(); });

        fsButton.on('click', function(e) {
            if (screenfull.enabled) {
                if (status != -1 && status != 5) {
                    screenfull.request(video);
                }
            }
            e.preventDefault();
        });
    }

    function onPlayerStateChange(event) {
        status = player.getPlayerState();

        if (status == 1) {
            playPause(2);

            timer = setInterval(function() {
                var playerCurrentTime = player.getCurrentTime(),
                    playerTimeDifference = (playerCurrentTime / playerTotalTime) * 100,
                    playerLoaded = player.getVideoLoadedFraction() * 100;

                time.find('.current').empty().text(formatDuration(playerCurrentTime) + " /");
                progress(playerTimeDifference, progressBar, cssAdvancementBar);
                progress(playerLoaded, progressBar, cssBufferBar);
                progressBar.width($('.' + cssMedia).width() - time.outerWidth(true));
            }, 500);
        } else { clearTimeout(timer); }

        if (status == 2) playPause(1);
        if (status == 0) playPause(0);

        playPauseBtn.off().on('click', function(e) {
            if (status == 0) player.playVideo(); // Replay
            playPause(status);
            e.preventDefault();
        });
    }

    /**
     *
     * @param status
     *
     * player.getPlayerState():Number
     * Cette fonction renvoie l'état du lecteur.
     * Les valeurs possibles sont :
     * -1 : non démarré
     *  0 : arrêté
     *  1 : en lecture
     *  2 : en pause
     *  3 : en mémoire tampon
     *  5 : en file d'attente
     */

    function playPause(status) {
        var changeText = function(text) {
            playPauseBtn.contents().filter(function() {
                return this.nodeType == 3;
            }).replaceWith(text);
        };
        if (status == 0) {
            changeText(cssClassReplay);
            playPauseBtn.removeClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassReplay);
        }
        if (status == 1) {
            player.pauseVideo();
            changeText(cssClassPlay);
            playPauseBtn.removeClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassPlay);
        }
        if (status == -1 || status == 2 || status == 5) {
            player.playVideo();
            changeText(cssClassPause);
            playPauseBtn.addClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassPause);
        }
    }

    function animateVolume(object, clearQueue, jumpToEnd, opacityValue, marginTopValue, speed) {
        object.stop(clearQueue, jumpToEnd).animate({
                opacity: opacityValue,
                marginTop: marginTopValue
            }, speed
        );
    }

    function progress(percent, $container, $bar) {
        var progressBarWidth = Math.round(percent * $container.width() / 100);
        $container.find('.' + $bar).animate({ width: progressBarWidth });
    }

    function formatDuration(duration){
        // We only accept numbers
        if(typeof duration != "number"){
            return;
        }

        var pad = function(n) {return n < 10 ? "0" + n : "" + n},
            timeComponents = [],
            multiplier = 3600;

        // Compute the value of each component (hours, minute, seconds)
        for(; multiplier != 0; multiplier = parseInt(multiplier / 60)) {
            var component = parseInt(duration / multiplier);
            duration %= multiplier;

            // If hours equal to 0, do not add them.
            if(multiplier == 3600 && component == 0){
                continue;
            }

            timeComponents.push(component);
        }

        // Pad each component (2 -&gt; 02)
        var padded;
        for(var i = 0; i < timeComponents.length; i++){
            padded = pad(timeComponents[i]);
            timeComponents[i] = padded;
        }

        return timeComponents.join(":");
    }
};

// This function will be called when the API is fully loaded
function onYouTubePlayerAPIReady() { YT_ready(); }

// Load YouTube Player API (Asynchronous)
(function() { // Closure, to not leak to the scope
    var s = document.createElement('script');
    s.src = (location.protocol == 'https:' ? 'https' : 'http') + '://www.youtube.com/player_api';
    var before = document.getElementsByTagName('script')[0];
    before.parentNode.insertBefore(s, before);
})();
window.twttr=(function(d,s,id){var t,js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id)){return}js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);return window.twttr||(t={_e:[],ready:function(f){t._e.push(f)}})}(document,"script","twitter-wjs"));

