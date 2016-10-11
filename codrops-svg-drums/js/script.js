$(function() {
	// Crash varibles
	crashCymbolAll = $('#Crash');
	crashCymbol = $('#Crash-Cymbol');
	crashAudio = $('#Crash-Audio');

	// Crash timeline
	var crashtl = new TimelineMax({
		paused: true
	});
	crashtl.to(crashCymbol, 0.1, {rotation: 8, transformOrigin: "50% 50%"})
	       .to(crashCymbol,1.5, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(2.5, 0.3)});

	// Crash play
	window.crash = function() {
		crashtl.restart();
		crashtl.play();
		var crashAudioEl = crashAudio.get(0);
		crashAudioEl.currentTime = 0;
		crashAudioEl.play();
	}

	// Do the crash stuff when clicked/touched
	var clickTouchCrashDone = false;
	crashCymbolAll.on("touchstart click", function() {
		if(!clickTouchCrashDone) {
			clickTouchCrashDone = true;
			setTimeout(function() {
				clickTouchCrashDone = false;
			}, 100);
			crash();
			return false;
		}
	});

	// Right tom drum varibles
	rightTomDrumAll = $('#Tom-Right-All');
	rightTomDrum = $('#Tom-Right-Drum');
	smallTomAudio = $('#Small-Rack-Tom-Audio');

	// Right tom drum timeline
	var rightTomtl = new TimelineMax({
		paused: true
	});
	rightTomtl.to(rightTomDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
	          .to(rightTomDrum, 0.1, {scaleY: 0.95, transformOrigin: "50% 50%", ease: Expo.easeOut}, '0')
	          .to(rightTomDrumAll, 0.1, {rotation: 2.5, transformOrigin: "0 50%", ease: Elastic.easeOut}, '0')
	          .to(rightTomDrum, 0.4, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut})
	          .to(rightTomDrumAll, 0.6, {rotation: 0, transformOrigin: "0 50%", ease: Elastic.easeOut}, '-=0.4');

	// Right tom play
	window.rightTom = function() {
		rightTomtl.restart();
		rightTomtl.play();
		var smallTomAudioEl = smallTomAudio.get(0);
		smallTomAudioEl.currentTime = 0;
		smallTomAudioEl.play();
	}

	// Do the right tom stuff when clicked/touched
	var clickTouchRTDrumDone = false;
	rightTomDrumAll.on("touchstart click", function() {
		if(!clickTouchRTDrumDone) {
			clickTouchRTDrumDone = true;
			setTimeout(function() {
				clickTouchRTDrumDone = false;
			}, 100);
			rightTom();
			return false;
		}
	});

	// Left tom drum varibles
	leftTomDrumAll = $('#Tom-Left-All');
	leftTomDrum = $('#Tom-Left-Drum');
	bigTomAudio = $('#Big-Rack-Tom-Audio');

	// Left tom drum timeline
	var leftTomtl = new TimelineMax({
		paused: true
	});
	leftTomtl.to(leftTomDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
	        .to(leftTomDrum, 0.1, {scaleY: 0.95, transformOrigin: "50% 50%", ease: Expo.easeOut}, '0')
	        .to(leftTomDrumAll, 0.1, {rotation: -2.5, transformOrigin: "100% 50%", ease: Elastic.easeOut}, '0')
	        .to(leftTomDrum, 0.4, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut})
	        .to(leftTomDrumAll, 0.6, {rotation: 0, transformOrigin: "100% 50%", ease: Elastic.easeOut}, '-=0.4');

	// Left tom play
	window.leftTom = function(){
		leftTomtl.restart();
		leftTomtl.play();
		var bigTomAudioEl = bigTomAudio.get(0);
		bigTomAudioEl.currentTime = 0;
		bigTomAudioEl.play();
	}

	// Do the left tom stuff when clicked/touched
	var clickTouchLTDrumDone = false;
	leftTomDrumAll.on("touchstart click", function() {
		if(!clickTouchLTDrumDone) {
			clickTouchLTDrumDone = true;
			setTimeout(function() {
				clickTouchLTDrumDone = false;
			}, 100);
			leftTom();
			return false;
		}
	});

	// Floor tom drum varibles
	floorTomDrumAll = $('#Floor-Tom');
	floorTomAudio = $('#Floor-Tom-Audio');

	// Floor tom drum timeline
	var floorTomtl = new TimelineMax({
		paused: true
	});
	floorTomtl.to(floorTomDrumAll, 0.1, {scaleX: 1.02, transformOrigin: "50% 50%", ease: Expo.easeOut})
	          .to(floorTomDrumAll, 0.1, {scaleY: 0.95, transformOrigin: "50% 100%", ease: Expo.easeOut}, '0')
	          .to(floorTomDrumAll, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

	// Floor tom play
	window.floorTom = function(){
		floorTomtl.restart();
		floorTomtl.play();
		var floorTomAudioEl = floorTomAudio.get(0);
		floorTomAudioEl.currentTime = 0;
		floorTomAudioEl.play();
	}

	// Do the floor tom stuff when clicked/touched
	var clickTouchTDrumDone = false;
	floorTomDrumAll.on("touchstart click", function() {
		if(!clickTouchTDrumDone) {
			clickTouchTDrumDone = true;
			setTimeout(function() {
				clickTouchTDrumDone = false;
			}, 100);
			floorTom();
			return false;
		}
	});

	// Snare drum varibles
	snareDrumAll = $('#Snare');
	snareDrum = $('#Snare-Drum');
	snareAudio = $('#Snare-Audio');

	// Snare drum timeline
	var snaretl = new TimelineMax({
		paused: true
	});
	snaretl.to(snareDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
	       .to(snareDrum, 0.1, {scaleY: 0.9, transformOrigin: "50% 100%", ease: Expo.easeOut}, '0')
	       .to(snareDrum, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

	// Snare play
	window.snare = function(){
		snaretl.restart();
		snaretl.play();
		var snareAudioEl = snareAudio.get(0);
		snareAudioEl.currentTime = 0;
		snareAudioEl.play();
	}

	// Do the snare stuff when clicked/touched
	var clickTouchSnareDone = false;
	snareDrumAll.on("touchstart click", function() {
		if(!clickTouchSnareDone) {
			clickTouchSnareDone = true;
			setTimeout(function() {
				clickTouchSnareDone = false;
			}, 100);
			snare();
			return false;
		}
	});

	// Kick drum varibles
	kickDrumAll = $('#Kick');
	kickAudio = $('#Kick-Audio');

	// Kick drum timeline
	var kicktl = new TimelineMax({
		paused: true
	});
	kicktl.to(kickDrumAll, 0.1, {scale: 1.02, transformOrigin: "50% 100%", ease: Expo.easeOut})
	      .to(kickDrumAll, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

	// Kick play
	window.kick = function(){
		kicktl.restart();
		kicktl.play();
		var kickAudioEl = kickAudio.get(0);
		kickAudioEl.currentTime = 0;
		kickAudioEl.play();
	}

	// Do the kick stuff when clicked/touched
	var clickTouchKickDone = false;
	kickDrumAll.on("touchstart click", function() {
		if(!clickTouchKickDone) {
			clickTouchKickDone = true;
			setTimeout(function() {
				clickTouchKickDone = false;
			}, 100);
			kick();
			return false;
		}
	});

	// Hi-hat varibles
	hiHatAll = $('#Hi-Hat');
	hiHatTop = $('#Hi-Hat-Top');
	hiHatBottom = $('#Hi-Hat-Bottom');
	hiHatClosedAudio = $('#Hi-Hat-Closed-Audio');

	// Hi-hat timeline
	var hiHattl = new TimelineMax({
		paused: true
	});
	hiHattl.to([hiHatTop, hiHatBottom], 0.1, {rotation: -4, transformOrigin: "50% 50%"})
	       .to([hiHatTop, hiHatBottom], 0.6, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(1.5, 0.2)});

	// Hi-hat play
	window.hiHat = function() {
		hiHattl.restart();
		hiHattl.play();
		var hiHatClosedAudioEl = hiHatClosedAudio.get(0);
		hiHatClosedAudioEl.currentTime = 0;
		hiHatClosedAudioEl.play();
	}

	// Do the hi-hat stuff when clicked/touched
	var clickTouchHitHatDone = false;
	hiHatAll.on("touchstart click", function() {
		if(!clickTouchHitHatDone) {
			clickTouchHitHatDone = true;
			setTimeout(function() {
				clickTouchHitHatDone = false;
			}, 100);
			hiHat();
			return false;
		}
	});

	// Key guide
	allKeys = $('#All-Keys');

	// Key timeline
	function animateKey(key) {
		keytl = new TimelineMax({
			paused: true
		});
		keytl.to(key, 0.1, {scale: 1.1, transformOrigin: "50% 50%", ease: Expo.easeOut})
		.to(key, 0.4, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut});
					keytl.restart();
					keytl.play();
	}

	// Show/hide keys
	$('#keys-btn').click(function() {
		allKeys.fadeToggle();
	});

	// Key triggers
	document.onkeydown = function(e) {
		thisKeyID = 'Key-' + e.keyCode;
		thisKey = $('#' + thisKeyID);
		switch (e.keyCode) {
			case 74:
				hiHat();
				animateKey(thisKey);
				break;
			case 72:
				snare();
				animateKey(thisKey);
				break;
			case 66:
				kick();
				animateKey(thisKey);
				break;
			case 71:
				floorTom();
				animateKey(thisKey);
				break;
			case 70:
				crash();
				animateKey(thisKey);
				break;
			case 84:
				leftTom();
				animateKey(thisKey);
				break;
			case 89:
				rightTom();
				animateKey(thisKey);
				break;
		}
	};

	// Show/hide sequencer variables
	sequencerVisible = false;

	// Show/hide sequencer
	$('#sequencer-visible-btn').click(function () {
		// Changes the flex-grow value
		$("#container-sequencer").toggleClass("collapse");
		if (sequencerVisible === false) {
			sequencerVisible = true;
		}  else {
			sequencerVisible = false;
		}
		// This class hides the drums on smaller screens
		$("#container-drums").toggleClass("screen-sm-hidden");
	});

	// Sequencer varibles
	rows = $('.row');
	rowLength = rows.first().children().length;
	labels = $('label');
	// Beat starts at 1 because 0 is the img for each row
	beat = 1;

	// Sequencer
	function sequencer () {
	  labels.removeClass('active');
		// Do this function for each .row
	  $(rows).each(function() {
		// Select the child element at the "beat" index
	    current = $(this).children().eq(beat);
	    current.addClass('active');
		// If the current input is checked do some stuff!
	    if (current.find('input').is(":checked")) {
	      targetDrum = (current.parent().attr('data-target-drum'));
				// If there a function that shares the same name as the data attribue, do it!
				fn = window[targetDrum];
				if (typeof fn === "function") {
					fn();
				}
	    }
	  });
		// If we get to the last child, start over
	  if ( beat < (rowLength - 1) ) {
	    ++beat;
	  } else {
	    beat = 1;
	  }
	}

	// Start/Stop Sequencer varibles
	sequencerOn = false;

	// Start/Stop Sequencer
	$('#sequencer-active-btn').click(function () {
		$(this).find('i').toggleClass('fa-pause');
		if (sequencerOn === false) {
			intervalId = window.setInterval(sequencer, interval);
			sequencerOn = true;
		} else {
			window.clearInterval(intervalId);
			sequencerOn = false;
		}
	});

	// Tempo varibles
	bpm = 150;
	interval = 60000 / bpm;

	// Set tempo
	function setTempo() {
		window.clearInterval(intervalId);
		intervalId = window.setInterval(sequencer, interval);
	}

	// Increase tempo
	$('#bpm-increase-btn').click(function() {
		if ( bpm < 300 ) {
			bpm = parseInt($('#bpm-indicator').val());
			bpm += 10;
			interval = 60000 / bpm;
			$('#bpm-indicator').val(bpm);
			if(sequencerOn === true) {
				setTempo();
			}
		}
	});

	//Decrease tempo
	$('#bpm-decrease-btn').click(function() {
		if ( bpm > 100 ) {
			bpm = parseInt($('#bpm-indicator').val());
			bpm -= 10;
			interval = 60000 / bpm;
			$('#bpm-indicator').val(bpm);
			if(sequencerOn === true) {
				setTempo();
			}
		}
	});

	// Trigger drum on input check
	$('input').click(function() {
		if (sequencerOn === false) {
			if ($(this).is(":checked")) {
				targetDrum = $(this).parents(".row").attr('data-target-drum');
				fn = window[targetDrum];
				if (typeof fn === "function") {
					fn();
				}
			}
		}
	});

	// Load audio on iOS devices on the first user interaction, because...
	$('#sequencer-visible-btn').one('click', function() {
		$("audio").each(function(i) {
			this.play();
			this.pause();
		});
	});

});
