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
;(function(window) {

	'use strict';

	var bodyEl = document.body, 
		docElem = window.document.documentElement,
		support = {transitions: Modernizr.csstransitions},
		// transition end event name
		transEndEventNames = {'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend'},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
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
		},
		// the main container
		contentEl = document.querySelector('.container'),
		// the wrapper of the share container, and a variable to store its height
		shareWrap = contentEl.querySelector('.share-wrap'), shareWrapH,
		// share container element
		shareEl = shareWrap.querySelector('.share'),
		// sharing elements
		shareElems = [].slice.call(shareEl.querySelectorAll('.share__item')),
		// total number of sharing elems
		shareElemsTotal = shareElems.length,
		// window size
		win = {width: window.innerWidth, height: window.innerHeight},
		// percentage (factor from 0 to 1) of the window width to take in consideration
		winfactor= 0.2,
		// media query variable for the matchMedia fn
		mq,
		// the pull to share will only work when the window is smaller than this value
		winSizeLimit = 768,
		// the distance the container needs to be translated
		translateVal,
		// friction factor
		friction = 2.5,
		// distance in px needed to push down the menu in order to be able to share
		triggerDistance = 120,
		// position of the current selected share item
		posShareEl,
		networks = {
			"twitter" : 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text='+ document.title + ' via @codrops',
			"facebook" : 'http://www.facebook.com/sharer.php?s=100&p[url]='+encodeURIComponent(window.location.href)+'&p[title]=' + document.title + '&p[summary]=Description',
			"google" : 'https://plus.google.com/share?url='+encodeURIComponent(window.location.href)
		},
		// touch events: position of the initial touch (y-axis)
		firstTouchY, initialScroll,
		// deviceorientation || touchmove
		triggerOn = 'deviceorientation';

	function scrollY() { return window.pageYOffset || docElem.scrollTop; }

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

	function init() {
		// we will only trigger the pull to share functionality if the window is smaller than winSizeLimit
		if ( matchMedia ) {
			mq = window.matchMedia('(min-width: ' + winSizeLimit + 'px)');
			mq.addListener(changeViewport);
			changeViewport(mq);
		}
	}

	function changeViewport(mq) {
		if (mq.matches) {
			// touch events
			contentEl.removeEventListener('touchstart', touchStart);
			contentEl.removeEventListener('touchmove', touchMove);
			contentEl.removeEventListener('touchend', touchEnd);
			// also remove the window resize event
			window.removeEventListener('resize', winresize);
		}
		else {
			// touch events
			contentEl.addEventListener('touchstart', touchStart);
			contentEl.addEventListener('touchmove', touchMove);
			contentEl.addEventListener('touchend', touchEnd);
			// window resize
			window.addEventListener('resize', winresize);
		}
	}

	function winresize() {
		var resize = function() {
			// reset window sizes
			win = {width: window.innerWidth, height: window.innerHeight};
		};

		throttle(resize(), 10);
	}

	function touchStart(ev) {
		if( triggerOn === 'deviceorientation' ) {
			window.addEventListener('deviceorientation', handleOrientation);
		}

		var touchobj = ev.changedTouches[0];

		// save the initial position of the touch (y-axis)
		firstTouchY = parseInt(touchobj.clientY);
		initialScroll = scrollY();
		// get the current height of the share wrapper
		shareWrapH = shareWrap.offsetHeight;

		// make sure the element doesnt have the transition class (added when the user releases the touch)
		classie.remove(contentEl, 'container--reset');
	}

	function touchMove(ev) {
		var moving = function() {
			var touchobj = ev.changedTouches[0], // reference first touch point for this event
				touchY = parseInt(touchobj.clientY),
				touchYDelta = touchY - firstTouchY;

			if ( scrollY() === 0 && touchYDelta > 0  ) {
				ev.preventDefault();
			}

			if ( initialScroll > 0 || scrollY() > 0 || scrollY() === 0 && touchYDelta < 0 ) {
				firstTouchY = touchY;
				return;
			}
			
			// change the selected share item when moving to the left/right.
			if( triggerOn === 'touchmove' ) {
				selectShareItem(ev);
			}

			// calculate the distance the container needs to be translated
			translateVal = -shareWrapH + touchYDelta/friction;
			
			// set the transform value for the container
			setContentTransform();

			// show the selected sharing item if touchYDelta > triggerDistance
			if( touchYDelta > triggerDistance ) {
				classie.add(contentEl, 'container--active');
			}
			else {
				classie.remove(contentEl, 'container--active');
			}
		};

		throttle(moving(), 60);
	}

	function touchEnd(ev) {
		if( triggerOn === 'deviceorientation' ) {
			window.removeEventListener('deviceorientation', handleOrientation);
		}

		if( classie.has(contentEl, 'container--active') ) {
			// expanding effect on selected item
			classie.add(contentEl, 'container--share');

			onEndTransition(shareEl, function() {
				classie.remove(contentEl, 'container--share');
				classie.remove(contentEl, 'container--active');
				// after expanding trigger the share functionality
				doShare();
			});
		}

		// reset transform
		contentEl.style.webkitTransform = contentEl.style.transform = '';

		// move back the container (css transition)
		if( translateVal !== -shareWrapH ) {
			classie.add(contentEl, 'container--reset');
			onEndTransition(contentEl, function() {
				classie.remove(contentEl, 'container--reset');
			});
		}	
	}

	function setContentTransform() {
		contentEl.style.webkitTransform = contentEl.style.transform = 'translate3d(0, ' + translateVal + 'px, 0)';
	}

	function selectShareItem(ev) {
		// windows width divided by the total number of share items
		var winslice = win.width * winfactor / shareElemsTotal,
			touchpos = parseInt(ev.changedTouches[0].clientX),
			margins = (win.width - win.width * winfactor) / 2;

		// calculate which sharing item should be selected depending on the position of the mouse/touch
		posShareEl = Math.max(Math.min(Math.floor((touchpos - margins) / winslice), shareElemsTotal-1), 0) + 1;
		shareEl.className = 'share share--select-' + posShareEl;
	}

	function handleOrientation(ev) {
		var y = event.gamma; // In degree in the range [-90,90]

		// To make computation easier we shift the range of x and y to [0,180]
		y += 90;

		// max degrees divided by the total number of share items
		var winslice = 180 * winfactor / shareElemsTotal,
			margins = (180 - 180 * winfactor) / 2;

		// calculate which sharing item should be selected depending on the position of the touch/device
		posShareEl = Math.max(Math.min(Math.floor((y - margins) / winslice), shareElemsTotal-1), 0) + 1;
		shareEl.className = 'share share--select-' + posShareEl;
	}

	function doShare() {
		//var network = shareElems[posShareEl-1].getAttribute('data-network');
		//window.location = networks[network];
	}

	init();

})(window);