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