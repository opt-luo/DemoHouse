/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	/**********************************************/
	/** https://gist.github.com/desandro/1866474 **/
	/**********************************************/
	var lastTime = 0;
	var prefixes = 'webkit moz ms o'.split(' ');
	// get unprefixed rAF and cAF, if present
	var requestAnimationFrame = window.requestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame;
	// loop through vendor prefixes and get prefixed rAF and cAF
	var prefix;
	for( var i = 0; i < prefixes.length; i++ ) {
		if ( requestAnimationFrame && cancelAnimationFrame ) {
			break;
		}
		prefix = prefixes[i];
		requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
		cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
		window[ prefix + 'CancelRequestAnimationFrame' ];
	}

	// fallback to setTimeout and clearTimeout if either request/cancel is not supported
	if ( !requestAnimationFrame || !cancelAnimationFrame ) {
		requestAnimationFrame = function( callback, element ) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() {
				callback( currTime + timeToCall );
			}, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};

		cancelAnimationFrame = function( id ) {
			window.clearTimeout( id );
		};
	}
	/**********************************************/
	/** https://gist.github.com/desandro/1866474 **/
	/**********************************************/


	var support = { animations : Modernizr.cssanimations, transitions : Modernizr.csstransitions, preserve3d : Modernizr.preserve3d },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		onEndTransition = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	// from http://www.quirksmode.org/js/events_properties.html#position
	function getMousePos(e) {
		var posx = 0;
		var posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		return {
			x : posx,
			y : posy
		}
	}

	function Slideshow(el, options) {
		// if no support for preserve3d then return
		if( !support.preserve3d ) {
			return false;
		}

		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );

		// the slides
		this.slides = [].slice.call(this.el.querySelectorAll('.slide'));
		// total slides
		this.slidesTotal = this.slides.length;
		// the items
		this.items = [].slice.call(this.el.querySelectorAll('.item'));
		// the navigation wrapper
		this.nav = this.el.querySelector('.nav');
		// the navigation controls/anchors
		this.navCtrls = [].slice.call(this.nav.querySelectorAll('.nav__item'));
		// the titles
		this.titles = [].slice.call(this.el.querySelectorAll('.titles > .title'));
		// index of current slide
		this.current = 0;

		this._init();
	}

	Slideshow.prototype.options = {
		// how much each slider/scene will rotate when the user moves the mouse
		movement : {
			rotateX : 5, // a relative rotation of -5deg to 5deg on the x-axis
			rotateY : 10 // a relative rotation of -10deg to 10deg on the y-axis
		}
	};

	Slideshow.prototype._init = function() {
		// update current elements
		this._updateCurrent();
		
		// set current slide, current navigation element and current title
		classie.add(this.currentSlide, 'slide--current');
		classie.add(this.navCtrls[this.current], 'nav__item--current');
		classie.add(this.titles[this.current], 'title--current');

		// set items images transforms
		this.items.forEach(function(item) {
			var itemImg = item.querySelector('img');
			itemImg.style.WebkitTransform = itemImg.style.transform = 'translate3d(0,0,' + itemImg.getAttribute('data-transform-z') + 'px)';
		});

		// bind events
		this._initEvents();
	};

	Slideshow.prototype._updateCurrent = function() {
		this.currentSlide = this.slides[this.current];
		this.currentScene = this.currentSlide.querySelector('.scene');
		this.slideSizes = {width : this.currentSlide.offsetWidth, height : this.currentSlide.offsetHeight};
	};

	Slideshow.prototype._initEvents = function() {
		var self = this;

		// navigation events
		this.navCtrls.forEach(function(navEl, pos) {
			navEl.addEventListener('click', function(ev) {
				ev.preventDefault();
				self._navigate(pos);

				// mouse position relative to the document.
				var mousepos = getMousePos(ev);
				// apply the rotation to the slide, i.e the upcoming slide/scene will be already transformed proportionally to the mouse position
				self._rotateSlide(mousepos);
			});
		});

		// item's events
		this.items.forEach(function(item) {
			// open the item
			item.querySelector('img').addEventListener('click', function() {
				self._openItem(item);
			});

			// close the item
			item.querySelector('.button--close').addEventListener('click', function() {
				self._closeItem(item);
			});
		});

		// mousemove event / tilt functionality
		document.addEventListener('mousemove', function(ev) {
			requestAnimationFrame(function() {
				if( self.lockedTilt ) return;
				// mouse position relative to the document.
				var mousepos = getMousePos(ev);
				// apply the rotation to the slide. This will depend on the mouse position
				self._rotateSlide(mousepos);
			});
		});

		// keyboard navigation events
		document.addEventListener('keydown', function(ev) {
			var keyCode = ev.keyCode || ev.which;
			if( keyCode !== 37 && keyCode !== 38 && keyCode !== 39 && keyCode !== 40 ) return;

			switch (keyCode) {
				// left
				case 37:
					if( self.current - 1 >= 0 ) {
						self._navigate(self.current - 1);
					}
					break;
				// right
				case 39:
					if( self.current + 1 < self.slidesTotal ) {
						self._navigate(self.current + 1);
					}
					break;
				// down
				case 40:
					if( self.current + 2 < self.slidesTotal ) {
						self._navigate(self.current + 2);
					}
					break;
				// up
				case 38:
					if( self.current - 2 >= 0 ) {
						self._navigate(self.current - 2);
					}
					break;
			}
			// mouse position relative to the document.
			var mousepos = {x : window.innerWidth/2, y : window.innerHeight/2};
			// apply the rotation to the slide. This will depend on the mouse position
			self._rotateSlide(mousepos);
		});

		// window resize: update view sizes
		window.addEventListener('resize', throttle(function(ev) {
			self.slideSizes = {width : self.currentSlide.offsetWidth, height : self.currentSlide.offsetHeight};
		}, 10));
	};

	Slideshow.prototype._openItem = function(item) {
		if( this.isItemOpen ) {
			return false;
		}
		// item is now open
		this.isItemOpen = true;

		// the view (item's parent) gets a higher z-index so that other views don't overlap
		var view = item.parentNode;
		view.style.zIndex = 10;

		// the view's parent (.views) gets the class view-open. This allows us to control the transitions of all the other items
		var views = view.parentNode;
		classie.add(views, 'view-open');

		// while the item is open, the tilt movement (mousemove) gets disabled
		this.lockedTilt = true;
		this.currentScene.style.WebkitTransform = this.currentScene.style.transform = 'rotate3d(1,1,0,0deg)';

		// class for the popup
		classie.add(item, 'item--popup');

		// scale up the item's image and reset translateZ value
		var itemImg = item.querySelector('img');
		itemImg.style.WebkitTransform = itemImg.style.transform = 'translate3d(0,0,0) scale3d(1.3, 1.3, 1)';

		// now, reset the other item's images transforms, so when we open an item, all others "move down"
		[].slice.call(views.querySelectorAll('.item > img')).forEach(function(img) {
			if( itemImg != img ) {
				img.style.WebkitTransform = img.style.transform = 'translate3d(0,0,0)';
			}
		});

		// the current open item
		this.currentOpenItem = item;
	};

	Slideshow.prototype._closeItem = function(item) {
		var item = item || this.currentOpenItem;
		
		// item is now closed
		this.isItemOpen = false;

		// the view (item's parent) and its parent
		var view = item.parentNode, views = view.parentNode;

		// remove class view-open from views (This allows us to control the transitions of all the other items)
		classie.remove(views, 'view-open');

		// remove the popup class from the item
		classie.remove(item, 'item--popup');
		
		// reset the item's image transform
		var itemImg = item.querySelector('img'),
			self = this;
		
		setTimeout(function() {
			itemImg.style.WebkitTransform = itemImg.style.transform = 'translate3d(0,0,' + itemImg.getAttribute('data-transform-z') + 'px)';
			
			// after the transition is done..
			onEndTransition(itemImg, function() {
				// reset the view's z-index
				view.style.zIndex = 1;

				// the tilt movement (mousemove) gets enabled again
				self.lockedTilt = false;
			});
		}, 60);
		
		// now, reset the other item's images transforms ("move up")
		[].slice.call(views.querySelectorAll('.item > img')).forEach(function(img) {
			if( itemImg != img ) {
				img.style.WebkitTransform = img.style.transform = 'translate3d(0,0,' + img.getAttribute('data-transform-z') + 'px)';
			}
		});
	};

	Slideshow.prototype._navigate = function(pos) {
		if( this.isAnimating || this.current === pos ) {
			return false;
		}
		this.isAnimating = true;

		// close the open item if any
		if( this.isItemOpen ) {
			this._closeItem();
		}

		// get the navigation direction
		var direction = this._getNavDirection(pos);

		// set current navigation element
		classie.remove(this.navCtrls[this.current], 'nav__item--current');
		classie.add(this.navCtrls[pos], 'nav__item--current');

		// hide current slide title
		classie.remove(this.titles[this.current], 'title--current');
		
		// current slide and next slide
		var currentSlide = this.slides[this.current],
			nextSlide = this.slides[pos];

		// update current value
		this.current = pos;
		// update current elements
		this._updateCurrent();
		
		// apply animation classes
		classie.add(currentSlide, 'to-' + direction.out);
		classie.add(nextSlide, 'from-' + direction.in);

		var self = this;
		onEndAnimation(nextSlide, function() {
			classie.remove(currentSlide, 'to-' + direction.out);
			classie.remove(nextSlide, 'from-' + direction.in);

			classie.remove(currentSlide, 'slide--current');
			classie.add(nextSlide, 'slide--current');

			// show current slide title
			classie.add(self.titles[pos], 'title--current');

			self.isAnimating = false;
		});
	};

	Slideshow.prototype._rotateSlide = function(mousepos) {
		// transform values
		var rotX = this.options.movement.rotateX ? 2 * this.options.movement.rotateX / this.slideSizes.height * mousepos.y - this.options.movement.rotateX : 0,
			rotY = this.options.movement.rotateY ? 2 * this.options.movement.rotateY / this.slideSizes.width * mousepos.x - this.options.movement.rotateY : 0;
		
		this.currentScene.style.WebkitTransform = this.currentScene.style.transform = 'rotate3d(1,0,0,' + rotX + 'deg) rotate3d(0,1,0,' + rotY + 'deg)';
	};

	Slideshow.prototype._getNavDirection = function(pos) {
		var direction = {},
			isEven = function(val) { return (val%2 == 0); }

		if( isEven(this.current) && isEven(pos) || !isEven(this.current) && !isEven(pos) ) {
			if( this.current < pos ) {
				direction.in = 'bottom';
				direction.out = 'top';
			}
			else {
				direction.in = 'top';
				direction.out = 'bottom';
			}
		}
		else if( isEven(this.current) ) {
			if( pos === this.current + 1 ) {
				direction.in = 'right';
				direction.out = 'left';
			}
			else if( pos < this.current ) {
				direction.in = 'topright';
				direction.out = 'bottomleft';
			}
			else {
				direction.in = 'bottomright';
				direction.out = 'topleft';
			}
		}
		else {
			if( pos === this.current - 1 ) {
				direction.in = 'left';
				direction.out = 'right';
			}
			else if( pos < this.current ) {
				direction.in = 'topleft';
				direction.out = 'bottomright';
			}
			else {
				direction.in = 'bottomleft';
				direction.out = 'topright';	
			}
		}

		return direction;
	};

	window.Slideshow = Slideshow;

})(window);