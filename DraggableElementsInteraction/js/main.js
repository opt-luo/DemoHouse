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
;( function() {
	
	'use strict';

	// window sizes
	var win = {width: window.innerWidth, height: window.innerHeight};

	// window resize
	window.addEventListener('resize', throttle(function(ev) {
		// reset window sizes
		win = {width: window.innerWidth, height: window.innerHeight};
	}, 60));

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

	function DialogEl(el, options) {
		this.el = el;
		this.dragEl = el.querySelector('.mover-wrap');

		this.options = extend( {}, this.options );
		extend( this.options, options );

		// add perspective for 3d transforms
		if( this.options.mainElement.rX !== undefined || this.options.mainElement.rY !== undefined ) {
			this.el.style.WebkitPerspective = '1000px';
			this.el.style.perspective = '1000px';
			this.dragEl.style.WebkitTransformStyle = 'preserve-3d';
			this.dragEl.style.transformStyle = 'preserve-3d';
		}

		this._init();
	}

	DialogEl.prototype.options = {};

	DialogEl.prototype._init = function() {
		// inner element to apply transforms without interfering with the draggabily
		this.moverEl = this.el.querySelector('.mover');
		// inner elements that move
		this.innerEl = [].slice.call(this.el.querySelectorAll('.mover__element'));
		// close dialog
		var self = this;
		this.el.querySelector('button.action--close').addEventListener('click', function() { self.close(); });
		// init Draggabilly
		this._initDraggabilly();
	};

	DialogEl.prototype._onDragStart = function(event, pointer, moveVector) {
		// stop animations
		dynamics.stop(this.draggie.element);
		dynamics.stop(this.moverEl);
		dynamics.stop(this.innerEl);
	};

	DialogEl.prototype._onDragMove = function(event, pointer, moveVector) {
		var moverEl_settings = {};

		if( this.options.mainElement.rX !== undefined ) {
			// rotateX from -options.mainElement.rX to options.mainElement.rX
			moverEl_settings.rotateX = 2 * this.options.mainElement.rX / win.height * moveVector.y;
		}

		if( this.options.mainElement.rY !== undefined ) {
			// rotateY from -options.mainElement.rY to options.mainElement.rY
			moverEl_settings.rotateY = -2 * this.options.mainElement.rY / win.width * moveVector.x;
		}

		if( this.options.mainElement.minscale !== undefined ) {
			// scale from 1 to options.mainElement.minscale
			moverEl_settings.scale = moveVector.x < 0 ? 2 * (1 - this.options.mainElement.minscale) / win.width * moveVector.x + 1 : -1 * (2 * (1 - this.options.mainElement.minscale) / win.width) * moveVector.x + 1;
		}
		
		if( this.options.mainElement.minopacity !== undefined ) {
			// opacity from 1 to options.mainElement.minopacity
			moverEl_settings.opacity = moveVector.x < 0 ? 2 * (1 - this.options.mainElement.minopacity) / win.width * moveVector.x + 1 : -1 * (2 * (1 - this.options.mainElement.minopacity) / win.width) * moveVector.x + 1;
		}

		// apply settings
		dynamics.css(this.moverEl, moverEl_settings);

		// inner elements settings
		var innerElements_settings = {};

		// translateX from -options.innerElements.tx to options.innerElements.tx
		if( this.options.innerElements.tx !== undefined ) {
			innerElements_settings.translateX = 2 * (this.options.innerElements.tx) * moveVector.x / win.width;
		}

		// translateY from -options.innerElements.ty to options.innerElements.ty
		if( this.options.innerElements.ty !== undefined ) {
			innerElements_settings.translateY = 2 * (this.options.innerElements.ty) * moveVector.y /win.height;
		}
		// apply settings
		dynamics.css(this.innerEl, innerElements_settings);

		// if it reaches the boundaries then close and reset the elements
		if( this._outOfBounds() ) {
			dynamics.css(this.moverEl, { rotate: 0, scale: 1, opacity: 1 });
			dynamics.css(this.innerEl, { translate: 0 });
			dynamics.animate(this.draggie.element, {
				translate: 0,
				left: 0,
				top: 0
			});
			this.close();
		}
	};

	DialogEl.prototype._onDragEnd = function(event, pointer, moveVector) {
		// move the draggable back
		dynamics.animate(this.draggie.element, { translate: 0, left: 0, top: 0 }, { type: dynamics.spring, friction: 400  });
		// reset any transforms applied to the mover element
		dynamics.animate(this.moverEl, { rotate: 0, scale: 1, opacity: 1 }, { type: dynamics.spring, friction: 400  });
		// reset any transforms applied to the inner elements
		// add a delay to each one
		this.innerEl.forEach(function(el, i) {
			dynamics.setTimeout(function() {
				dynamics.animate(el, { translate: 0 }, { type: dynamics.spring, friction: 200  });
			}, i*100);
		});
	};

	DialogEl.prototype._initDraggabilly = function() {
		var self = this;
		this.draggie = new Draggabilly(this.dragEl, {handle: '.handle'});
		this.draggie.on('dragStart', function(event, pointer, moveVector) { self._onDragStart(event, pointer, moveVector); });
		this.draggie.on('dragMove', function(event, pointer, moveVector) { self._onDragMove(event, pointer, moveVector); });
		this.draggie.on('dragEnd', function(event, pointer, moveVector) { self._onDragEnd(event, pointer, moveVector); });
	};

	DialogEl.prototype.open = function() {
		classie.add(this.el, 'dialog--open');
		this.draggie.enable();
	};

	DialogEl.prototype.close = function() {
		classie.remove(this.el, 'dialog--open');
		this.draggie.disable();
	};

	DialogEl.prototype._outOfBounds = function() {
		// the element is considered out of bounds if its center (x,y) is either 
		// x < outofbounds.x or x > win.width-outofbounds.x or
		// y < outofbounds.y or y > win.height - outofbounds.y
		var el = this.draggie.element, offset = el.getBoundingClientRect(),
			center = {x : offset.left + +el.offsetWidth/2, y : offset.top + +el.offsetHeight/2};

		return center.x < this.options.outofbounds.x || center.x > win.width - this.options.outofbounds.x || center.y < this.options.outofbounds.y || center.y > win.height - this.options.outofbounds.y;
	};

	// add to global namespace
	window.DialogEl = DialogEl;

})();