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

	// some helper functions
	/**
	 * from https://davidwalsh.name/javascript-debounce-function
	 */
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	/**
	 * from http://stackoverflow.com/a/6700
	 */
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	var mainContainer = document.querySelector('.landing-layout'),
		triggerCtrl = mainContainer.querySelector('.button--trigger'),
		landingWrapper = mainContainer.querySelector('.landing-wrap'),
		winsize = {width : window.innerWidth, height : window.innerHeight},
		soundCtrl = mainContainer.querySelector('button.button--sound'),
		isAudioOn = true,

		// from http://stackoverflow.com/q/31184533 - original work: http://www.kaiserapps.com/lab/#ub
		bubbles = {
			canvas : null,
			ctx : null,
			mousex : winsize.width - 30,
			mousey : winsize.height - 30,
			cntr : 0,
			circleArr : new Array(),
			requestId : undefined,
			init : function() {
				this.canvas = document.getElementById('bubbles');
				this.ctx = this.canvas.getContext('2d');
				this.canvas.width = winsize.width;
				this.canvas.height = winsize.height;

				// Window resize.
				var self = this;
				this.debounceResize = debounce(function() {
					winsize = {width : window.innerWidth, height : window.innerHeight};
					self.canvas.height = winsize.height;
					self.canvas.width = winsize.width;
				}, 10);
				window.addEventListener('resize', this.debounceResize);
			},
			loop : function() {
				this.requestId = requestAnimationFrame(bubbles.loop.bind(this));
				this.update();
				this.render();
			},
			update : function() {
				if( this.cntr++ % 1 == 0 ) {
					this.createCircle();
				}

				for(var circle in this.circleArr) {
					circle = this.circleArr[circle];
					var max = 2, min = -2;
					circle.x += Math.floor(Math.random() * (max - min + 1)) + min;
					circle.y -= Math.random()*15;
				}

				while(this.circleArr.length > 2 && (this.circleArr[0].x + this.circleArr[0].s > winsize.width || this.circleArr[0].x + this.circleArr[0].s < 0 || this.circleArr[0].y + this.circleArr[0].s > winsize.height || this.circleArr[0].y + this.circleArr[0].s < 0) ){
					this.circleArr.shift();
				}
			},
			render : function() {
				// clear
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				// draw the data
				for(var circle in this.circleArr) {
					var current = this.circleArr[circle];
					this.drawCircle(current.x, current.y, current.s);
				}
			},
			createCircle : function() {
				var tmp = this.circleArr[this.circleArr.length-1];

				this.circleArr[this.circleArr.length] = {
					x: this.mousex,
					y: this.mousey,
					s: Math.random()*winsize.height/100
				};
			},
			drawCircle : function(x, y, radius) {
				this.ctx.fillStyle = "rgba(255,255,255,0.5)";
				this.ctx.beginPath();
				this.ctx.arc(x,y,radius, 0, Math.PI*2, false);
				this.ctx.closePath();
				this.ctx.fill();
			},
			start : function() {
				if( !this.requestId ) {
					document.onmousemove = this.getMouseCoordinates.bind(this);
					this.loop();
				}
			},
			stop : function() {
				if( this.requestId ) {
					window.cancelAnimationFrame(this.requestId);
					this.requestId = undefined;
					document.onmousemove = null;
					// clear
					this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				}
			},
			getMouseCoordinates : function(ev) {
				var ev = ev || window.event;
				this.mousex = ev.pageX;
				this.mousey = ev.pageY;
			}
		},
		audio = {
			sounds : {},
			sources : [{
				lake : 'sounds/Whales Spouting Out Water-SoundBible.com-966355632.mp3',
				splash : 'sounds/Depth Charge 2-SoundBible.com-338644910.mp3',
				splash2 : 'sounds/Water Splash-SoundBible.com-800223477.mp3',
				underwater : 'sounds/156011__hdvideoguy__scubadiving-01.mp3'
			}],
			load : function(callback) {
				this.totalFiles = Object.size(this.sources[0]);
				
				for(var key in this.sources[0]) {
					var sound = new Howl({ src: [this.sources[0][key]] }), self = this;
					sound.once('load', function(key) {
						return function() {
							self.sounds[key] = this;
							if( Object.size(self.sounds) === self.totalFiles ) {
								if( typeof callback === 'function' ) {
									callback();
								}
							}
						};
					}(key));
				}
			},
			loop : function(name) {
				this.sounds[name].loop(true);
			},
			volume : function(name, val) {
				this.sounds[name].volume(val);
			},
			play : function(name, time) {
				this.sounds[name].stop();
				var self = this;
				setTimeout(function() {
					self.sounds[name].play();
				}, time || 0);
			},
			stop : function(name) {
				this.sounds[name].stop();
			},
			fadeIn : function(name, time) {
				var self = this;
				setTimeout(function() {
					self.sounds[name].fade(0,1,1500);
				}, time || 0);
			},
			fadeOut : function(name, time) {
				var self = this;
				setTimeout(function() {
					self.sounds[name].fade(1,0,1500);
				}, time || 0);
			},
			toggleMuteAll : function(state) {
				for(var key in this.sounds) {
					this.sounds[key].mute(state);
				}
			}
		};

	function init() {
		var loadedMediaItems = 0,
			checkloaded = function() {
				++loadedMediaItems;
				if(loadedMediaItems === 2) {
					mainContainer.classList.add('landing-layout--loaded');
					// Play lake sound.
					audio.loop('lake');
					audio.play('lake');
					// Init the bubbles canvas animation.
					bubbles.init();
					// Init/Bind Events
					initEvents();
				}
			};

		// Preload images..
		imagesLoaded(landingWrapper, { background: true }, checkloaded);
		// Preload sounds..
		audio.load(checkloaded);
	}

	function initEvents() {
		// Trigger the main animation.
		triggerCtrl.addEventListener('click', function() {
			toggleMenu();
		});
		// Mute sounds.
		soundCtrl.addEventListener('click', function() {
			if( !isAudioOn ) {
				audio.toggleMuteAll(false);
				soundCtrl.classList.remove('button--sound-off');
			}
			else {
				audio.toggleMuteAll(true);
				soundCtrl.classList.add('button--sound-off');
			}
			isAudioOn = !isAudioOn;
		});
	}

	function toggleMenu() {
		var isOpen = mainContainer.classList.contains('landing-layout--open');
		// Toggle class on the main container.
		mainContainer.classList.toggle('landing-layout--open');

		if( isOpen ) { // close it.
			// Stop the bubbles canvas animation.
			bubbles.stop();
			// Sounds..
			audio.fadeOut('underwater');
			audio.play('splash2', 700);
			audio.loop('lake');
			audio.fadeIn('lake', 700);
		}
		else {	// open it.
			// Start the bubbles canvas animation.
			bubbles.start();
			// Sounds..
			audio.fadeOut('lake');
			audio.play('splash', 700);
			audio.loop('underwater');
			audio.play('underwater', 700);
			audio.fadeIn('underwater');
		}
	}

	init();

})(window);