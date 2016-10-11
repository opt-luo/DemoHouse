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

	// helper functions
	
	/**
	 * enable/disable page scrolling. from http://stackoverflow.com/a/4770179
	 */
	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	var keys = {37: 1, 38: 1, 39: 1, 40: 1};

	function preventDefault(e) {
	  e = e || window.event;
	  if (e.preventDefault)
		  e.preventDefault();
	  e.returnValue = false;  
	}

	function preventDefaultForScrollKeys(e) {
		if (keys[e.keyCode]) {
			preventDefault(e);
			return false;
		}
	}

	function disableScroll() {
	  if (window.addEventListener) // older FF
		  window.addEventListener('DOMMouseScroll', preventDefault, false);
	  window.onwheel = preventDefault; // modern standard
	  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
	  window.ontouchmove  = preventDefault; // mobile
	  document.onkeydown  = preventDefaultForScrollKeys;
	}

	function enableScroll() {
		if (window.removeEventListener)
			window.removeEventListener('DOMMouseScroll', preventDefault, false);
		window.onmousewheel = document.onmousewheel = null; 
		window.onwheel = null; 
		window.ontouchmove = null;  
		document.onkeydown = null;  
	}

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
	 * from http://stackoverflow.com/a/7228322
	 */
	function randomIntFromInterval(min,max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	}

		// main page container
	var mainContainer = document.querySelector('.view'),
		// the grid element
		gridEl = mainContainer.querySelector('.grid'),
		// grid items
		gridItems = [].slice.call(gridEl.querySelectorAll('.grid__item')),
		// main title element
		titleEl = mainContainer.querySelector('.title-wrap > .title--main'),
		// main subtitle element
		subtitleEl = mainContainer.querySelector('.title-wrap > .title--sub'),
		// the fullscreen element/division that will slide up, giving the illusion the items will fall down
		pagemover = mainContainer.querySelector('.page--mover'),
		// the loading element shown while the images are loaded
		loadingStatusEl = pagemover.querySelector('.la-square-loader'),
		// window sizes (width and height)
		winsize = {width: window.innerWidth, height: window.innerHeight},
		// translation values (x and y): percentages of the item´s width and height; scale value; rotation (z) value
		// these are the values that the 6 initial images will have
		introPositions = [
			{tx: -.6, ty:-.3, s:1.1, r:-20},
			{tx: .2, ty:-.7, s:1.4, r:1},
			{tx: .5, ty:-.5, s:1.3, r:15},
			{tx: -.2, ty:-.4, s:1.4, r:-17},
			{tx: -.15, ty:-.4, s:1.2, r:-5},
			{tx: .7, ty:-.2, s:1.1, r:15}
		],
		// the phone
		deviceEl = mainContainer.querySelector('.device'),
		// the animated button that triggers the effect when clicked
		showGridCtrl = document.getElementById('showgrid'),
		// the title and subtitle shown on top of the grid
		pageTitleEl = mainContainer.querySelector('.page__title > .page__title-main'),
		pageSubTitleEl = mainContainer.querySelector('.page__title > .page__title-sub'),
		// the grid´s load more button
		loadMoreCtrl = mainContainer.querySelector('button.button--load'),
		// true if the animation is currently running
		isAnimating,
		// true if the user scrolls (rather than clicking the down arrow)
		scrolled,
		// current view: stack | grid
		view = 'stack';

	function init() {
		// appending a unique string to every image src as a workaround for an apparent Chrome issue with the imagesLoaded (cache is not cleared, premature firing seems to happen)
		[].slice.call(gridEl.querySelectorAll('img')).forEach(function(el) { el.src += '?' + Number(new Date()); });

		// disable scroll while loading images
		classie.add(document.body, 'overflow');
		disableScroll();
		// preload images
		imagesLoaded(gridEl, function() {
			// enable page scroll again
			enableScroll();
			// controls the visibility of the grid items. Adding this class will make them visible.
			classie.add(mainContainer, 'view--loaded');
			// show initial view
			showIntro();
			// bind events
			initEvents();
		});
	}

	/**
	 * shows the initial stack with the 6 images behind the phone
	 */
	function showIntro() {
		// display the first set of 6 grid items behind the phone
		gridItems.slice(0,6).forEach(function(item, pos) {
			// first we position all the 6 items on the bottom of the page (item´s center is positioned on the middle of the page bottom)
			// then we move them up and to the sides (extra values) and also apply a scale and rotation
			var itemOffset = item.getBoundingClientRect(),
				settings = introPositions[pos],
				center = {
					x : winsize.width/2 - (itemOffset.left + item.offsetWidth/2),
					y : winsize.height - (itemOffset.top + item.offsetHeight/2)
				}

			// first position the items behind the phone
			dynamics.css(item, {
				opacity: 1,
				translateX: center.x,
				translateY: center.y,
				scale: 0.5
			});

			// now animate each item to its final position
			dynamics.animate(item, {
				translateX: center.x + settings.tx*item.offsetWidth,
				translateY: center.y + settings.ty*item.offsetWidth,
				scale : settings.s,
				rotateZ: settings.r
			}, {
				type: dynamics.spring,
				duration: 2000,
				frequency: 400,
				friction: 550,
				delay: pos * 100
			});
		});

		// also animate/slide the device in:
		// first, push it slightly down (to make it complete out of the viewport we´d need to set the translateY to winsize.height * 0.45 --> 45vh)
		dynamics.css(deviceEl, { translateY: winsize.height * 0.25 } );
		// now animate it up
		dynamics.animate(deviceEl, { translateY: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 1000
		});
	}

	/**
	 * bind/initialize the events
	 */
	function initEvents() {
		// show the grid when the showGridCtrl is clicked
		showGridCtrl.addEventListener('click', showGrid);

		// show the grid when the user scrolls the page
		var scrollfn = function() {
			scrolled = true;
			showGrid();
			window.removeEventListener('scroll', scrollfn);	
		};
		window.addEventListener('scroll', scrollfn);

		// todo: show/load more grid items
		loadMoreCtrl.addEventListener('click', loadNextItems);

		// window resize: recalculate window sizes and reposition the 6 grid items behind the phone (if the grid view is not yet shown)
		window.addEventListener('resize', debounce(function(ev) {
			// reset window sizes
			winsize = {width: window.innerWidth, height: window.innerHeight};
			
			if( view === 'stack' ) {
				gridItems.slice(0,6).forEach(function(item, pos) {
					// first reset all items
					dynamics.css(item, { scale: 1, translateX: 0, translateY: 0, rotateZ: 0 });

					// now, recalculate..
					var itemOffset = item.getBoundingClientRect(),
						settings = introPositions[pos];

					dynamics.css(item, {
						translateX: winsize.width/2 - (itemOffset.left + item.offsetWidth/2) + settings.tx*item.offsetWidth,
						translateY: winsize.height - (itemOffset.top + item.offsetHeight/2) + settings.ty*item.offsetWidth,
						scale : settings.s,
						rotateZ: settings.r
					});
				});
			}
		}, 10));
	}

	/**
	 * shows the grid
	 */
	function showGrid() {
		// return if currently animating
		if( isAnimating ) return;
		isAnimating = true;

		// hide the showGrid ctrl
		dynamics.css(showGridCtrl, {display: 'none'});

		// main title animation
		dynamics.animate(titleEl, { translateY: -winsize.height/2, opacity: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.7,"y":0}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 600
		});

		// main subtitle animation
		dynamics.animate(subtitleEl, { translateY: -winsize.height/2, opacity: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.7,"y":0}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 600,
			delay: 100
		});

		// device animation
		dynamics.animate(deviceEl, { translateY: 500, opacity: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.7,"y":0}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 600
		});

		// pagemover animation
		dynamics.animate(pagemover, { translateY: -winsize.height}, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.7,"y":0}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 600,
			delay: scrolled ? 0 : 120,
			complete: function(el) {
				// hide the pagemover
				dynamics.css(el, { opacity: 0 });
				// view is now ´grid´
				view = 'grid';
				classie.add(mainContainer, 'view--grid');
			}
		});		
		
		// items animation
		gridItems.slice(0,6).forEach(function(item, pos) {
			dynamics.stop(item);
			dynamics.animate(item, { scale: 1, translateX: 0, translateY: 0, rotateZ: 0 }, {
				type: dynamics.spring,
				duration: scrolled ? 2400 : 2400,
				frequency: 400,
				friction: 400,
				delay: scrolled ? 0 : pos * 30 + 100
			});
		});

		// page title animation
		dynamics.css(pageTitleEl, { translateY: 200, opacity: 0 });
		dynamics.animate(pageTitleEl, { translateY: 0, opacity: 1 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 800,
			delay: 400
		});

		// page subtitle animation
		dynamics.css(pageSubTitleEl, { translateY: 150, opacity: 0 });
		dynamics.animate(pageSubTitleEl, { translateY: 0, opacity: 1 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 800,
			delay: 500
		});

		// the remaining grid items
		gridItems.slice(6).forEach(function(item) {
			dynamics.css(item, { scale: 0, opacity: 0 });
			dynamics.animate(item, { scale: 1, opacity: 1 }, {
				type: dynamics.spring,
				duration: 2000,
				frequency: 400,
				friction: 400,
				delay: randomIntFromInterval(100,400)
			});
		});
	}

	/**
	 * dummy fn: simulate the load of the next grid items
	 */
	function loadNextItems() {
		// loadMoreCtrl button gets class button--loading. This will transform the button into a loading/animated button
		classie.add(loadMoreCtrl, 'button--loading');
		// the timeout serves to simulate the time that we would probably wait for the response
		setTimeout(function() {
			// hide button
			classie.add(loadMoreCtrl, 'button--hidden');
			// add some extra items to the grid
			var dummyContent = '<li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/1.jpg" alt="Some image" /><h3 class="grid__item-title">Natural saturation effects</h3></a></li><li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/2.jpg" alt="Some image" /><h3 class="grid__item-title">Auto-color and light</h3></a></li><li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/3.jpg" alt="Some image" /><h3 class="grid__item-title">That special blur</h3></a></li><li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/4.jpg" alt="Some image" /><h3 class="grid__item-title">Drama where you need it</h3></a></li><li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/5.jpg" alt="Some image" /><h3 class="grid__item-title">Realistic depth</h3></a></li><li class="grid__item grid__item--hidden"><a class="grid__link" href="#"><img class="grid__img" src="img/photos/6.jpg" alt="Some image" /><h3 class="grid__item-title">The common, but special</h3></a></li>';
			gridEl.innerHTML += dummyContent;
			[].slice.call(gridEl.querySelectorAll('.grid__item--hidden')).forEach(function(item) {
				gridItems.push(item);
				dynamics.css(item, { scale: 0, opacity: 0 });
				classie.remove(item, 'grid__item--hidden');
				dynamics.animate(item, { scale: 1, opacity: 1 }, {
					type: dynamics.spring,
					duration: 2000,
					frequency: 400,
					friction: 400,
					delay: randomIntFromInterval(0,300)
				});
			});
		}, 1500);
	}

	// force the scrolling to the top of the page (from http://stackoverflow.com/a/23312671)
	window.onbeforeunload = function(){ 	
		window.scrollTo(0,0); 
	}
	
	init();

})(window);