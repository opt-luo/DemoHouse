/**
 * main_2.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;( function() {
	
	'use strict';

	// window sizes
	var win = {width: window.innerWidth, height: window.innerHeight};

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
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

	function DragSlide(el, options) {
		this.el = el;

		this.options = extend( {}, this.options );
		extend( this.options, options );

		this.dragEl = this.el.querySelector('.mover-wrap');
		this.moverEl = this.el.querySelector('.mover');
		this.polaroid = this.el.querySelector('.slide__polaroid');
		this.settings = {};
		
		if( this.moverEl.getAttribute('data-minscale') ) {
			this.settings.minscale = this.moverEl.getAttribute('data-minscale');
		}
		if( this.moverEl.getAttribute('data-minopacity') ) {
			this.settings.minopacity = this.moverEl.getAttribute('data-minopacity');
		}
		if( this.moverEl.getAttribute('data-rX') ) {
			this.settings.rX = this.moverEl.getAttribute('data-rX');
		}
		if( this.moverEl.getAttribute('data-rY') ) {
			this.settings.rY = this.moverEl.getAttribute('data-rY');
		}
		if( this.moverEl.getAttribute('data-maxgrayscale') ) {
			this.settings.grayscale = this.moverEl.getAttribute('data-maxgrayscale');
		}
		if( this.moverEl.getAttribute('data-outofbounds-x') ) {
			this.settings.outofboundsX = this.moverEl.getAttribute('data-outofbounds-x');
		}

		// add perspective for 3d transforms
		if( this.settings.rX !== undefined || this.settings.rY !== undefined ) {
			this.el.style.WebkitPerspective = '1000px';
			this.el.style.perspective = '1000px';
			this.dragEl.style.WebkitTransformStyle = 'preserve-3d';
			this.dragEl.style.transformStyle = 'preserve-3d';
		}

		this._initDraggabilly();
	}

	DragSlide.prototype.options = {
		onDragStart : function() { return false; },
		onDragEnd : function() { return false; },
		onOutOfBounds : function() { return false; }
	};

	DragSlide.prototype._initDraggabilly = function() {
		var self = this;
		this.draggie = new Draggabilly(this.dragEl);
		this.draggie.on('dragStart', function(event, pointer, moveVector) { self._onDragStart(event, pointer, moveVector); });
		this.draggie.on('dragMove', function(event, pointer, moveVector) { self._onDragMove(event, pointer, moveVector); });
		this.draggie.on('dragEnd', function(event, pointer, moveVector) { self._onDragEnd(event, pointer, moveVector); });
	};

	DragSlide.prototype._onDragStart = function(event, pointer, moveVector) {
		// callback
		this.options.onDragStart();
		// stop animations
		dynamics.stop(this.draggie.element);
		dynamics.stop(this.moverEl);
		dynamics.stop(this.polaroid);

		classie.remove(this.moverEl, 'slide__bg--filter');
	};

	DragSlide.prototype._onDragMove = function(event, pointer, moveVector) {
		var moverEl_settings = {};

		if( this.settings.rX !== undefined ) {
			// rotateX from -settings.rX to settings.rX
			moverEl_settings.rotateX = 2 * this.settings.rX / win.height * moveVector.y;
		}

		if( this.settings.rY !== undefined ) {
			// rotateY from -settings.rY to settings.rY
			moverEl_settings.rotateY = -2 * this.settings.rY / win.width * moveVector.x;
		}

		if( this.settings.minscale !== undefined ) {
			// scale from 1 to settings.minscale
			moverEl_settings.scale = moveVector.x < 0 ? 2 * (1 - this.settings.minscale) / win.width * moveVector.x + 1 : -1 * (2 * (1 - this.settings.minscale) / win.width) * moveVector.x + 1;
		}
		
		if( this.settings.minopacity !== undefined ) {
			// opacity from 1 to settings.minopacity
			moverEl_settings.opacity = moveVector.x < 0 ? 2 * (1 - this.settings.minopacity) / win.width * moveVector.x + 1 : -1 * (2 * (1 - this.settings.minopacity) / win.width) * moveVector.x + 1;
		}

		// apply settings
		dynamics.css(this.moverEl, moverEl_settings);

		// css filters
		if( this.settings.grayscale !== undefined ) {
			// grayscale from 0(%) to settings.grayscale(%)
			this.moverEl.style.WebkitFilter = moveVector.x < 0 ? 'grayscale(' + Number(-1* (2 * 100 / win.width * moveVector.x)) + '%)' : 'grayscale(' + Number(2 * 100 / win.width * moveVector.x) + '%)';
			this.moverEl.style.filter = moveVector.x < 0 ? 'grayscale(' + Number(-1* (2 * 100 / win.width * moveVector.x)) + '%)' : 'grayscale(' + Number(2 * 100 / win.width * moveVector.x) + '%)';	
		}
		
		// polaroid appearance
		dynamics.css(this.polaroid, {
			scaleX: moveVector.x < 0 ? 2 * (0.875 - 1) / win.width * moveVector.x + 0.875 : -1 * ((0.875 - 1) / win.width * moveVector.x) + 0.875,
			scaleY: moveVector.x < 0 ? 2 * (0.765 - 1) / win.width * moveVector.x + 0.765 : -1 * ((0.765 - 1) / win.width * moveVector.x) + 0.765
		});

		// if it reaches the boundaries then close and reset the elements
		var isOutOfBounds = this._outOfBounds();
		if( isOutOfBounds ) {
			dynamics.stop(this.draggie.element);
			
			// callback
			this.options.onOutOfBounds(this, isOutOfBounds.dir);
		}
	};

	DragSlide.prototype._onDragEnd = function(event, pointer, moveVector) {
		// move the draggable back
		dynamics.animate(this.draggie.element, { translate: 0, left: 0, top: 0 }, { type: dynamics.spring, friction: 400 });
		// reset any transforms applied to the mover element
		dynamics.animate(this.moverEl, { rotate: 0, scale: 1, opacity: 1 }, { type: dynamics.spring, friction: 400 });

		classie.add(this.moverEl, 'slide__bg--filter');
		this.moverEl.style.WebkitFilter = 'grayscale(0%)';
		this.moverEl.style.filter = 'grayscale(0%)';
		
		// and to the polaroid element
		dynamics.animate(this.polaroid, { scaleX: 0.875, scaleY: 0.765 }, { type: dynamics.spring, friction: 400 });

		// callback
		this.options.onDragEnd();
	};

	DragSlide.prototype.reset = function() {
		dynamics.css(this.moverEl, { rotate: 0, scale: 1, opacity: 1 });
		this.moverEl.style.WebkitFilter = 'grayscale(0%)';
		this.moverEl.style.filter = 'grayscale(0%)';

		dynamics.css(this.polaroid, { scaleX: 0.875, scaleY: 0.765 });
		
		dynamics.animate(this.draggie.element, {
			translate: 0,
			left: 0,
			top: 0
		});
	};

	// out of bounds on the x-axis only
	DragSlide.prototype._outOfBounds = function() {
		// the element is considered out of bounds if its center x position is either 
		// x < outofboundsX or x > win.width-outofboundsX
		var el = this.draggie.element, offset = el.getBoundingClientRect(),
			center = {x : offset.left + +el.offsetWidth/2, y : offset.top + +el.offsetHeight/2},

			outLeft = center.x < this.settings.outofboundsX,
			outRight = center.x > win.width - this.settings.outofboundsX;

		if( outLeft || outRight ) {
			return { dir : outLeft ? 'left' : 'right' };
		}

		return false;
	};

	DragSlide.prototype.moveIn = function(dir) {
		dynamics.css(this.el, { translateX: dir === 'right' ? -1*this.el.offsetWidth : win.width });
		// animate the next element in
		dynamics.animate(this.el, { opacity: 1, translateX: win.width/2 - this.el.offsetWidth/2 }, {
			type: dynamics.spring,
			duration: 1200,
			friction: 400
		});
		var self = this;
		setTimeout(function() { self.draggie.enable(); }, 60);
		dynamics.css(this.el, { zIndex: 100 });
	};

	DragSlide.prototype.moveOut = function(dir) {
		var self = this;
		dynamics.animate(this.el, { opacity: 0, translateX: dir === 'right' ? win.width/2 + this.el.offsetWidth/2 : -1 * (win.width/2 + this.el.offsetWidth/2) }, {
			type: dynamics.easeIn,
			duration: 200,
			complete: function() {
				self.reset();
			}
		});
		dynamics.css(this.el, { zIndex: 1 });
	};

	function Slideshow(el, options) {
		this.el = el;
		
		this.options = extend( {}, this.options );
		extend( this.options, options );

		this._init();
	}

	Slideshow.prototype.options = {};

	Slideshow.prototype._init = function() {
		this.slides = [].slice.call(this.el.querySelectorAll('.slide'));
		this.slidesTotal = this.slides.length;
		this.hint = this.el.querySelector('.hint');
		this.current = 0;

		this.dragSlides = [];
		
		var self = this;

		// preload images
		imagesLoaded(this.el, function() {
			self.slides.forEach(function(slide, pos) {
				// set first slide style
				if( pos === self.current ) {
					dynamics.css(slide, { zIndex: 100, opacity: 1, translateX: win.width/2 - slide.offsetWidth/2 });
				}

				var dragSlide = new DragSlide(slide, {
					onDragStart : function() { self._showHint(); },
					onDragEnd : function() { self._hideHint(); },
					onOutOfBounds : function(instance, dir) {
						if( self.slidesTotal > 1 ) {
							instance.draggie.disable();
							self._navigate(dir);

							self._hideHint();
						}
					}
				});

				self.dragSlides.push(dragSlide);
			});
		});

		window.addEventListener('resize', throttle(function(ev) {
			// reset window sizes
			win = {width: window.innerWidth, height: window.innerHeight};

			var currentSlide = self.slides[self.current];
			dynamics.css(currentSlide, { translateX: win.width/2 - currentSlide.offsetWidth/2 });
		}, 50));
	};

	Slideshow.prototype._navigate = function(dir) {
		var slideCurrent = this.dragSlides[this.current];

		// update new current value
		if( dir === 'right' ) {
			this.current = this.current > 0 ? this.current - 1 : this.slidesTotal-1;
		}
		else {
			this.current = this.current < this.slidesTotal-1 ? this.current + 1 : 0;
		}

		// animate the current element out
		slideCurrent.moveOut(dir);
		
		// animate the current element in
		var slideNext = this.dragSlides[this.current];
		slideNext.moveIn(dir);
	};

	Slideshow.prototype._showHint = function() {
		classie.add(this.hint, 'hint--show');
	};

	Slideshow.prototype._hideHint = function() {
		classie.remove(this.hint, 'hint--show');
	};

	// add to global namespace
	window.Slideshow = Slideshow;

})();