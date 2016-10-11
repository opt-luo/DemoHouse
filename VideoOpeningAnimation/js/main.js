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

	var bodyEl = document.body,
		videoWrap = document.querySelector('.video-wrap'),
		videoEl = videoWrap.querySelector('video'),
		playCtrl = document.querySelector('.action--play'),
		closeCtrl = document.querySelector('.action--close');

	function init() {
		initEvents();
	}

	function initEvents() {
		playCtrl.addEventListener('click', play);
		closeCtrl.addEventListener('click', hide);
		videoEl.addEventListener('canplaythrough', allowPlay);
		videoEl.addEventListener('ended', hide);
	}

	function allowPlay() {
		classie.add(bodyEl, 'video-loaded');
	}

	function play() {
		videoEl.currentTime = 0;
		classie.remove(videoWrap, 'video-wrap--hide');
		classie.add(videoWrap, 'video-wrap--show');
		setTimeout(function() {videoEl.play();}, 600);
	}

	function hide() {
		classie.remove(videoWrap, 'video-wrap--show');
		classie.add(videoWrap, 'video-wrap--hide');
		videoEl.pause();
	}

	init();

})();