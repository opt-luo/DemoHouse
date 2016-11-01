/*
 * Cirulcar Calendar Display.js
 * Matthew Juggins
 * Change log:
 * 		25/09/16 - Quick fix to day of the week
 */

$(function() {

	var date, dayName, day, month, year;
	var range = 270,
		sectionsDayName = 7,
		sectionsDay = 31,
		sectionsMonth = 12,
		charactersDayName = 3,
		charactersDay = 2,
		charactersMonth = 3,
		dayColor = '#FF2D55',
		monthColor = '#007AFF',
		dayNameColor = '#4CD964';
	

	// Rotate the selected ring the correct amount and illuminate the correct characters of the ring text
	function rotateRing(input, sections, characters, ring, text, color) {
		var sectionWidth = range / sections;
		var initialRotation = 135 - (sectionWidth / 2);
		var rotateAmount = initialRotation - sectionWidth * (input - 1);
		var start = (characters * (input - 1)) + (input - 1) + 1;
		
		$(ring).css({
			'-webkit-transform': 'rotate(' + rotateAmount + 'deg)',
			'-moz-transform': 'rotate(' + rotateAmount + 'deg)',
			'-ms-transform': 'rotate(' + rotateAmount + 'deg)',
			'transform': 'rotate(' + rotateAmount + 'deg)'
		});

		for (var i = start; i < start + characters; i++) {
			$(text).children('.char' + i).css({
				'color': color
			});
		}		
	}

	// Get a new date object every second and update the rotation of the clock handles
	function clockRotation() {
		setInterval(function() {
			var date = new Date();
			var seconds = date.getSeconds();
			var minutes = date.getMinutes();
			var hours = date.getHours();
			var secondsRotation = seconds * 6;
			var minutesRotation = minutes * 6;
			var hoursRotation = hours * 30 + (minutes / 2);
			$("#seconds").css({
				'-webkit-transform': 'rotate(' + secondsRotation + 'deg)',
				'-moz-transform': 'rotate(' + secondsRotation + 'deg)',
				'-ms-transform': 'rotate(' + secondsRotation + 'deg)',
				'transform': 'rotate(' + secondsRotation + 'deg)'
			});
			$("#minutes").css({
				'-webkit-transform': 'rotate(' + minutesRotation  + 'deg)',
				'-moz-transform': 'rotate(' + minutesRotation + 'deg)',
				'-ms-transform': 'rotate(' + minutesRotation + 'deg)',
				'transform': 'rotate(' + minutesRotation + 'deg)'
			});
			$("#hours").css({
				'-webkit-transform': 'rotate(' + hoursRotation  + 'deg)',
				'-moz-transform': 'rotate(' + hoursRotation + 'deg)',
				'-ms-transform': 'rotate(' + hoursRotation + 'deg)',
				'transform': 'rotate(' + hoursRotation + 'deg)'
			});
		}, 1000);
	}
	
	// Give column representing passed days and the current day this week a height
	function loadBars() {
		for(var i = 1; i <= dayName; i++){
			var newHeight = (Math.floor(Math.random() * 85) + 5);
			var newTop = 110 -  newHeight;
			$("#x"+i).css({
				'height' : newHeight + 'px',
			});	
		}
	}

	function init() {		
		$(".center-preview").lettering();
		$(".day-name-preview").lettering(); 
		$(".day-name-text").lettering();
		$(".day-preview").lettering();
		$(".day-text").lettering();
		$(".month-preview").lettering();
		$(".month-text").lettering();
		$('.day-preview').fadeTo(10, 1);
		$('.month-preview').fadeTo(10, 1);
		$('.day-name-preview').fadeTo(10, 1);
		$('.center-preview').fadeTo(10, 1);

		// Get date variables
		date = new Date();
		dayName = date.getDay(); // Day of week (1-7)
		day = date.getDate(); // Get current date (1-31)
		month = date.getMonth() + 1; // Current month (1-12)
		if (dayName == 0) {
			dayName = 7;
		}
		// Fade in/out second dial and rotate. Also fade in and animate side elements.
		setTimeout(function() {
			$('.day-preview').fadeTo(500, 0);
			$('.day-text').fadeTo(500, 1, function() {
				rotateRing(day, sectionsDay, charactersDay, '#r3', '.day-text', dayColor);
			});
		}, 500);

		// Fade in/out second dial and rotate. Also fade in and animate side elements.
		setTimeout(function() {
			$('.month-preview').fadeTo(500, 0);
			$('.fa-cloud').fadeTo(500, 1);
			$('.temperature').fadeTo(500, 1);
			$('.bars').fadeTo(500, 1);
			$('.month-text').fadeTo(500, 1, function() {
				rotateRing(month, sectionsMonth, charactersMonth, '#r2', '.month-text', monthColor);
				loadBars();
			});
		}, 1000);

		// Fade in/out first dial and rotate
		setTimeout(function() {
			$('.day-name-preview').fadeTo(500, 0);
			$('.day-name-text').fadeTo(500, 1, function() {
				rotateRing(dayName, sectionsDayName, charactersDayName, '#r1', '.day-name-text', dayNameColor);
			});
		}, 1500);

		// Fade in/out center dial
		setTimeout(function() {
			$('.center-preview').fadeTo(500, 0);
			$('.head').fadeTo(500, 0);
			$('.torso').fadeTo(500, 0);
			$(".hand-container").fadeTo(500, 1, function() {
				//console.log("Clock faded in");
			});
		}, 2000);

		// Begin clock rotation now it is visible
		clockRotation();
	}

	init();
});