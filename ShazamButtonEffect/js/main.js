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

	/**
	 * some helper functions
	 */
	
		// from http://stackoverflow.com/a/25273333
	var bezier = function(x1, y1, x2, y2, epsilon) {
			var curveX = function(t){
				var v = 1 - t;
				return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
			};
			var curveY = function(t){
				var v = 1 - t;
				return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
			};
			var derivativeCurveX = function(t){
				var v = 1 - t;
				return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
			};
			return function(t){
				var x = t, t0, t1, t2, x2, d2, i;
				// First try a few iterations of Newton's method -- normally very fast.
				for (t2 = x, i = 0; i < 8; i++){
					x2 = curveX(t2) - x;
					if (Math.abs(x2) < epsilon) return curveY(t2);
					d2 = derivativeCurveX(t2);
					if (Math.abs(d2) < 1e-6) break;
					t2 = t2 - x2 / d2;
				}

				t0 = 0, t1 = 1, t2 = x;

				if (t2 < t0) return curveY(t0);
				if (t2 > t1) return curveY(t1);

				// Fallback to the bisection method for reliability.
				while (t0 < t1){
					x2 = curveX(t2);
					if (Math.abs(x2 - x) < epsilon) return curveY(t2);
					if (x > x2) t0 = t2;
					else t1 = t2;
					t2 = (t1 - t0) * .5 + t0;
				}
				// Failure
				return curveY(t2);
			};
		},
		getRandomNumber = function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		throttle = function(fn, delay) {
			var allowSample = true;

			return function(e) {
				if (allowSample) {
					allowSample = false;
					setTimeout(function() { allowSample = true; }, delay);
					fn(e);
				}
			};
		},
		// from https://davidwalsh.name/vendor-prefix
		prefix = (function () {
			var styles = window.getComputedStyle(document.documentElement, ''),
				pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
				dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
			
			return {
				dom: dom,
				lowercase: pre,
				css: '-' + pre + '-',
				js: pre[0].toUpperCase() + pre.substr(1)
			};
		})();
	
	var support = {transitions : Modernizr.csstransitions},
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		onEndTransition = function( el, callback, propTest ) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this || propTest && ev.propertyName !== propTest && ev.propertyName !== prefix.css + propTest ) return;
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
		},
		// the main component element/wrapper
		shzEl = document.querySelector('.component'),
		// the initial button
		shzCtrl = shzEl.querySelector('button.button--start'),
		// the svg element which contains the shape paths
		shzSVGEl = shzEl.querySelector('svg.morpher'),
		// snapsvg instance
		snap = Snap(shzSVGEl),
		// the SVG path
		shzPathEl = snap.select('path'),
		// total number of notes/symbols moving towards the listen button
		totalNotes = 50,
		// the notes elements
		notes,
		// the note´s speed factor relative to the distance from the note element to the button. 
		// if notesSpeedFactor = 1, then the speed equals the distance (in ms)
		notesSpeedFactor = 4.5,
		// simulation time for listening (ms)
		simulateTime = 6500,
		// window sizes
		winsize = {width: window.innerWidth, height: window.innerHeight},
		// button offset
		shzCtrlOffset = shzCtrl.getBoundingClientRect(),
		// button sizes
		shzCtrlSize = {width: shzCtrl.offsetWidth, height: shzCtrl.offsetHeight},
		// tells us if the listening animation is taking place
		isListening = false,
		// audio player element
		playerEl = shzEl.querySelector('.player'),
		// close player control
		playerCloseCtrl = playerEl.querySelector('.button--close');

	function init() {
		// create the music notes elements - the musical symbols that will animate/move towards the listen button
		createNotes();
		// bind events
		initEvents();
	}

	/**
	 * creates [totalNotes] note elements (the musical symbols that will animate/move towards the listen button)
	 */
	function createNotes() {
		var notesEl = document.createElement('div'), notesElContent = '';
		notesEl.className = 'notes';
		for(var i = 0; i < totalNotes; ++i) {
			// we have 6 different types of symbols (icon--note1, icon--note2 ... icon--note6)
			var j = (i + 1) - 6 * Math.floor(i/6);
			notesElContent += '<div class="note icon icon--note' + j + '"></div>';
		}
		notesEl.innerHTML = notesElContent;
		shzEl.insertBefore(notesEl, shzEl.firstChild)

		// reference to the notes elements
		notes = [].slice.call(notesEl.querySelectorAll('.note'));
	}

	/**
	 * event binding
	 */
	function initEvents() {
		// click on the initial button
		shzCtrl.addEventListener('click', listen);

		// close the player view
		playerCloseCtrl.addEventListener('click', closePlayer);

		// window resize: update window sizes and button offset
		window.addEventListener('resize', throttle(function(ev) {
			winsize = {width: window.innerWidth, height: window.innerHeight};
			shzCtrlOffset = shzCtrl.getBoundingClientRect();
		}, 10));
	}

	/**
	 * transform the initial button into a circle shaped one that "listens" to the current song..
	 */
	function listen() {
		isListening = true;
		
		// toggle classes (button content/text changes)
		classie.remove(shzCtrl, 'button--start');
		classie.add(shzCtrl, 'button--listen');

		// animate the shape of the button (we are using Snap.svg for this)
		animatePath(shzPathEl, shzEl.getAttribute('data-path-listen'), 400, [0.8, -0.6, 0.2, 1], function() {
			// ripples start...
			classie.add(shzCtrl, 'button--animate');
			// music notes animation starts...
			showNotes();
			// simulate the song detection
			setTimeout(showPlayer, simulateTime);
		});
	}

	/**
	 * stop the ripples and notes animations
	 */
	function stopListening() {
		isListening = false;
		// ripples stop...
		classie.remove(shzCtrl, 'button--animate');
		// music notes animation stops...
		hideNotes();
	}

	/**
	 * show the notes elements: first set a random position and then animate them towards the button
	 */
	function showNotes() {
		notes.forEach(function(note) {
			// first position the notes randomly on the page
			positionNote(note);
			// now, animate the notes torwards the button
			animateNote(note);
		});
	}

	/**
	 * fade out the notes elements
	 */
	function hideNotes() {
		notes.forEach(function(note) {
			note.style.opacity = 0;
		});
	}

	/**
	 * positions a note/symbol randomly on the page. The area is restricted to be somewhere outside of the viewport.
	 * @param {Element Node} note - the note element
	 */
	function positionNote(note) {
		// we want to position the notes randomly (translation and rotation) outside of the viewport
		var x = getRandomNumber(-2*(shzCtrlOffset.left + shzCtrlSize.width/2), 2*(winsize.width - (shzCtrlOffset.left + shzCtrlSize.width/2))), y,
			rotation = getRandomNumber(-30, 30);

		if( x > -1*(shzCtrlOffset.top + shzCtrlSize.height/2) && x < shzCtrlOffset.top + shzCtrlSize.height/2 ) {
			y = getRandomNumber(0,1) > 0 ? getRandomNumber(-2*(shzCtrlOffset.top + shzCtrlSize.height/2), -1*(shzCtrlOffset.top + shzCtrlSize.height/2)) : getRandomNumber(winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2), winsize.height + winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2));
		}
		else {
			y = getRandomNumber(-2*(shzCtrlOffset.top + shzCtrlSize.height/2), winsize.height + winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2));
		}

		// first reset transition if any
		note.style.WebkitTransition = note.style.transition = 'none';
		
		// apply the random transforms
		note.style.WebkitTransform = note.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate3d(0,0,1,' + rotation + 'deg)';

		// save the translation values for later
		note.setAttribute('data-tx', Math.abs(x));
		note.setAttribute('data-ty', Math.abs(y));
	}

	/**
	 * animates a note torwards the button. Once that's done, it repositions the note and animates it again until the component is no longer listening.
	 * @param {Element Node} note - the note element
	 */
	function animateNote(note) {
		setTimeout(function() {
			if(!isListening) return;
			// the transition speed of each note will be proportional to the its distance to the button
			// speed = notesSpeedFactor * distance
			var noteSpeed = notesSpeedFactor * Math.sqrt(Math.pow(note.getAttribute('data-tx'),2) + Math.pow(note.getAttribute('data-ty'),2));

			// apply the transition
			note.style.WebkitTransition = '-webkit-transform ' + noteSpeed + 'ms ease, opacity 0.8s';
			note.style.transition = 'transform ' + noteSpeed + 'ms ease-in, opacity 0.8s';
			
			// now apply the transform (reset the transform so the note moves to its original position) and fade in the note
			note.style.WebkitTransform = note.style.transform = 'translate3d(0,0,0)';
			note.style.opacity = 1;
			
			// after the animation is finished, 
			var onEndTransitionCallback = function() {
				// reset transitions and styles
				note.style.WebkitTransition = note.style.transition = 'none';
				note.style.opacity = 0;

				if(!isListening) return;

				positionNote(note);
				animateNote(note);
			};

			onEndTransition(note, onEndTransitionCallback, 'transform');
		}, 60);
	}

	/**
	 * shows the audio player
	 */
	function showPlayer() {
		// stop the ripples and notes animations
		stopListening();

		// morph the listening button shape into the audio player shape
		// we are setting a timeout so that there´s a small delay (it just looks nicer)
		setTimeout(function() {
			animatePath(shzPathEl, shzEl.getAttribute('data-path-player'), 450, [0.7, 0, 0.3, 1], function() {
				// show audio player
				classie.remove(playerEl, 'player--hidden');
			});
			// hide button
			classie.add(shzCtrl, 'button--hidden');
		}, 250);
		// remove this class so the button content/text gets hidden
		classie.remove(shzCtrl, 'button--listen');
	}

	/**
	 * closes the audio player
	 */
	function closePlayer() {
		// hide the player
		classie.add(playerEl, 'player--hidden');
		// morph the player shape into the initial button shape
		animatePath(shzPathEl, shzEl.getAttribute('data-path-start'), 400, [0.4, 1, 0.3, 1]);
		// show again the button and its content
		// we are setting a timeout so that there´s a small delay (it just looks nicer)
		setTimeout(function() {
			classie.remove(shzCtrl, 'button--hidden');
			classie.add(shzCtrl, 'button--start');
		}, 50);
	}

	/**
	 * animates an SVG Path (using Snap.svg)
	 * 
	 * @param {Element Node}  el - the path element
	 * @param {string} path - the new path definition
	 * @param {number} duration - animation time
	 * @param {array|function} timingFunction - the animation easing. Either a Snap mina function or an array for the 4 bezier points
	 * @param {function} callback - callback function
	 */
	function animatePath(el, path, duration, timingFunction, callback) {
		var epsilon = (1000 / 60 / duration) / 4,
			timingFunction = typeof timingFunction == 'function' ? timingFunction : bezier(timingFunction[0], timingFunction[1], timingFunction[2], timingFunction[3], epsilon);

		el.stop().animate({'path' : path}, duration, timingFunction, callback);
	}

	init();

})(window);