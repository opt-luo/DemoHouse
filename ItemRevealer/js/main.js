/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * Grid obj.
	 */
	function Grid(el, options) {
		this.el = el;
		// Options/Settings.
		this.options = extend( {}, this.options );
		extend( this.options, options );
		// Array of GridItem objs.
		this.items = [];
		this._init();
	}

	/**
	 * Grid options/settings.
	 */
	Grid.prototype.options = {
		// The default paths (sequence of paths) that all the grid´s items are going to use to either get hidden/covered or shown/uncovered.
		paths : {
			cover : ['M 0,0 10,0 10,0 0,0 Z', 'M 0,0 10,0 10,6 0,8 Z', 'M 0,0 10,0 10,10 0,10 Z'],
			uncover : ['M 0,0 10,0 10,10 0,10 Z', 'M 0,0 10,0 10,6 0,8 Z', 'M 0,0 10,0 10,0 0,0 Z']
		}
	};

	/**
	 * Create and store the GridItem objs. Initialize SVG Path settings.
	 */
	Grid.prototype._init = function() {
		var self = this;

		// Save the default path settings for the grid (if any - data-path-uncover and data-path-cover)
		this.paths = {
			cover : this.el.getAttribute('data-path-cover') ? this.el.getAttribute('data-path-cover').split(';') : this.options.paths.cover,
			uncover : this.el.getAttribute('data-path-uncover') ? this.el.getAttribute('data-path-uncover').split(';') : this.options.paths.uncover,
		};

		[].slice.call(this.el.querySelectorAll('.grid__item')).forEach(function(item) {
			var options = {
				paths : self.paths
			};
			if( self.el.getAttribute('data-delay') ) {
				options.delay = self.el.getAttribute('data-delay');
			}
			if( item.getAttribute('data-delay') ) {
				options.delay = item.getAttribute('data-delay');
			}
			if( self.el.getAttribute('data-fill') ) {
				options.maskFill = self.el.getAttribute('data-fill');
			}
			if( item.getAttribute('data-fill') ) {
				options.maskFill = item.getAttribute('data-fill');
			}
			if( self.el.getAttribute('data-duration') ) {
				options.duration = self.el.getAttribute('data-duration');
			}
			if( item.getAttribute('data-duration') ) {
				options.duration = item.getAttribute('data-duration');
			}
			if( self.el.getAttribute('data-easing-in') ) {
				options.easein = self.el.getAttribute('data-easing-in');
			}
			if( item.getAttribute('data-easing-in') ) {
				options.easein = item.getAttribute('data-easing-in');
			}
			if( self.el.getAttribute('data-easing-out') ) {
				options.easeout = self.el.getAttribute('data-easing-out');
			}
			if( item.getAttribute('data-easing-out') ) {
				options.easeout = item.getAttribute('data-easing-out');
			}

			var gridItem = new GridItem(item, options);
			self.items.push(gridItem);
		});
	};

	/**
	 * Hides or shows each one of it´s items. action is either 'cover' or 'uncover'.
	 */
	Grid.prototype.render = function(action, callback) {
		var action = action === 'cover' || action === 'uncover' ? action : 'cover',
			finished = 0;

		for( var i = 0, len = this.items.length; i < len; ++i ) {
			this.items[i].render(action, function() {
				++finished;
				if( finished === len && typeof callback === 'function' ) {
					callback();
					self.isAnimating = false;
				}
			});
		}
	};

	/**
	 * GridItem obj.
	 */
	function GridItem(el, options) {
		this.el = el;

		var child = this.el.children[0];
		this.type = child.nodeName === 'audio' || child.nodeName === 'video' || 
					child.getAttribute('data-type') && ( child.getAttribute('data-type') === 'youtube' || child.getAttribute('data-type') === 'vimeo' ) ?
						'video' : 'general';
		// Options/Settings.
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	/**
	 * GridItem options/settings.
	 */
	GridItem.prototype.options = {
		duration : 600,
		delay : 0,
		maskFill : '#02161E',
		easein : 'easeInQuad',
		easeout : 'easeOutQuad'
	};

	/**
	 * Create SVG. Initialize SVG Path settings. Init video if any.
	 */
	GridItem.prototype._init = function() {
		// The path settings for the item
		this.paths = {};
		this.paths.cover = this.el.getAttribute('data-path-cover') ? this.el.getAttribute('data-path-cover').split(';') : this.options.paths.cover;
		this.paths.uncover = this.el.getAttribute('data-path-uncover') ? this.el.getAttribute('data-path-uncover').split(';') : this.options.paths.uncover;

		// Create SVG.
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		// Fix rendering gap with 101%.
		this.svg.setAttribute('width', '102%');
		this.svg.setAttribute('height', '102%');
		this.svg.setAttribute('viewBox', '0 0 10 10');
		this.svg.setAttribute('preserveAspectRatio', 'none');
		this.svg.setAttribute('style', 'position: absolute; top: -1px; left: -1px; pointer-events: none;');
		this.svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		this.path.setAttribute('fill', this.options.maskFill);
		this.path.setAttribute('d', '');
		this.svg.appendChild(this.path);
		this.el.appendChild(this.svg);

		// Check if it is a video/audio element.
		if( this.type === 'video' ) {
			this.player = plyr.setup({
				controls : [],
				clickToPlay : false
			})[0].plyr;

			var self = this;
			this.el.querySelector('.plyr').addEventListener('ready', function() {
				self.player.setVolume(0);
			});
			this.el.querySelector('.plyr').addEventListener('ended', function() {
				self.player.seek(0);
				if( self.isUncovered ) {
					self.player.seek(0);
					self.player.play();
				}
			});
		}

		// save the delay
		this.delay = this.options.delay;
	};

	/**
	 * Covers/Uncovers the item. action is either 'cover' or 'uncover'
	 */
	GridItem.prototype.render = function(action, callback) {
		var self = this,
			steps = this.paths[action],
			stepsTotal = this.paths[action].length,
			pos = 1,
			nextStep = function(pos) {
				if( pos > stepsTotal - 1 ) {
					if( callback && typeof callback == 'function' ) {
						callback();

						// It the type is video then play or pause 
						if( self.type === 'video' ) {
							if( action === 'uncover' ) {
								//self.player.seek(0); // this restarts the video 
								self.player.play();
							}
							else {
								self.player.pause();
							}
						}

						self.isUncovered = action === 'uncover';
					}
					return;
				}
				
				anime({
					targets: self.path,
					d : steps[pos],
					duration : self.options.duration / (stepsTotal-1),
					easing : pos & 1 && stepsTotal > 2 ? self.options.easein : self.options.easeout,
					delay : pos === 1 ? self.options.delay : 0,
					complete : function() {
						nextStep(pos);
					}
				});

				++pos;
			};

		this.path.setAttribute('d', steps[0]);
		nextStep(pos);
	};

	/**
	 * GridSlideshow obj.
	 */
	function GridSlideshow(el, options) {
		this.el = el;
		// Options/Settings.
		this.options = extend( {}, this.options );
		extend( this.options, options );
		// DOM Grid elems.
		this.gridElems = [].slice.call(this.el.querySelectorAll('.grid')),
		// Array of Grid objs.
		this.grids = [];
		this.gridsTotal = this.gridElems.length,
		this.currentGridIdx = 0,
		this.nav = {
			prev : this.el.querySelector('.grid-nav > button.grid__button--prev'),
			next : this.el.querySelector('.grid-nav > button.grid__button--next')
		},
		this.isAnimating = false;
		this._init();
	}

	/**
	 * GridSlideshow options/settings.
	 */
	GridSlideshow.prototype.options = {
		onCover : function(direction, gridEl, gridItems) { return false; },
		onUncover : function(direction, gridEl, gridItems) { return false; }
	};

	/**
	 * Init.
	 */
	GridSlideshow.prototype._init = function() {
		var self = this;
		// Preload images.
		imagesLoaded(this.el, function() {
			self.el.classList.add('grid-pages--loaded');
			// Create and store the Grid objs.
			self.gridElems.forEach(function(gridEl) {
				var grid = new Grid(gridEl);
				self.grids.push(grid);
			});

			// Initialize/Bind the events.
			self._initEvents();
		});
	};

	/**
	 * Initialize/Bind events.
	 */
	GridSlideshow.prototype._initEvents = function() {
		var self = this;

		// Navigation ctrls.
		this.nav.prev.addEventListener('click', function() { self._navigate('prev'); });
		this.nav.next.addEventListener('click', function() { self._navigate('next'); });
		
		// Keyboard navigation events.
		document.addEventListener('keydown', function(ev) {
			var keyCode = ev.keyCode || ev.which;
			switch (keyCode) {
				case 38:
					self._navigate('prev');
					break;
				case 40:
					self._navigate('next');
					break;
			}
		});
	};

	/**
	 * Navigate between grids.
	 */
	GridSlideshow.prototype._navigate = function(direction) {
		if( this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

		var currentIdx = this.currentGridIdx;
		
		if( direction === 'next' ) {
			this.currentGridIdx = this.currentGridIdx < this.gridsTotal - 1 ? this.currentGridIdx + 1 : 0;
		}
		else if( direction === 'prev' ) {
			this.currentGridIdx = this.currentGridIdx > 0 ? this.currentGridIdx - 1 : this.gridsTotal - 1;
		}

		var currentGrid = this.grids[currentIdx],
			nextGrid = this.grids[this.currentGridIdx],
			self = this,
			onCovered = function() {
				// Switch the current grid element.
				currentGrid.el.classList.toggle('grid--current');
				nextGrid.el.classList.toggle('grid--current');
				// Show the next grid´s items.
				nextGrid.render('uncover', function() {
					self.isAnimating = false;
				});
				self.options.onUncover(direction, nextGrid, nextGrid.items);
			};

		// First, cover the current grid items.
		currentGrid.render('cover', onCovered);

		// Callback.
		this.options.onCover(direction, currentGrid, currentGrid.items);
	};

	window.GridSlideshow = GridSlideshow;
	document.documentElement.className = 'js';

})(window);