(function() {
	//wrap our existing svg and store elements to be animated
	var animatingSvg = Snap('#cd-animated-svg'),
		loadingSvg = animatingSvg.select('#cd-loading'),
		playBtn = animatingSvg.select('#cd-play-btn'),
		pauseBtn = animatingSvg.select('#cd-pause-btn'),
		loadingCircle = animatingSvg.select('#cd-loading-circle-filled'),
		buildingBase1 = animatingSvg.select('#cd-home-1-base'),
		buildingDoor1 = animatingSvg.select('#cd-home-1-door'),
		buildingRoof1 = animatingSvg.select('#cd-home-1-roof'),
		buildingWindow1 = animatingSvg.select('#cd-home-1-window'),
		buildingChimney = animatingSvg.select('#cd-home-1-chimney'),
		buildingBase2 = animatingSvg.select('#cd-home-2-base'),
		buildingDoor2 = animatingSvg.select('#cd-home-2-door'),
		buildingRoof2 = animatingSvg.select('#cd-home-2-roof'),
		buildingWindow2 = animatingSvg.select('#cd-home-2-window'),
		buildingBase3 = animatingSvg.select('#cd-home-3-base'),
		buildingRoof3 = animatingSvg.select('#cd-home-3-roof'),
		buildingWindow3 = animatingSvg.select('#cd-home-3-window'),
		floor = animatingSvg.select('#cd-floor'),
		clouds1 = animatingSvg.select('#cd-cloud-1'),
		clouds2 = animatingSvg.select('#cd-cloud-2');

	//circumf will be used to animate the loadingCircle
	var circumf = Math.PI*(loadingCircle.attr('r')*2);
	//this variable will be used to store the loadingCircle animation object
	var globalAnimation;

	initLoading();	
	//detect the click on the play btn and start the animation
	playBtn.click(function(){
		loadingSvg.addClass('play-is-clicked');
		//scale down play btn
		playBtn.animate({'transform': 's0 0'}, 200, mina.easeinout);
		//scale up pause btn
		pauseBtn.animate({'transform': 's1 1'}, 200, mina.easeinout);
		
		var strokeOffset = loadingCircle.attr('stroke-dashoffset').replace('px', '');
		//animate strokeOffeset desn't work with circle element - we need to use Snap.animate() rather than loadingCircle.animate()
		globalAnimation = Snap.animate(strokeOffset, '0', function( value ){ 
			loadingCircle.attr({ 'stroke-dashoffset': value })
			}, (strokeOffset/circumf)*1500, mina.easein, function(){
				loadingSvg.addClass('fade-out');
				setTimeout(function(){
					animateFloor();
				}, 300);
			}
		);
	});

	//detect the click on the pause btn and stop the animation
	pauseBtn.click(function(){
		//pause the animation on the loadingCircle
		globalAnimation.stop();
		loadingSvg.removeClass('play-is-clicked');
		//scale up play btn
		playBtn.animate({'transform': 's1 1'}, 200, mina.easeinout);
		//scale down pause btn
		pauseBtn.animate({'transform': 's0 0'}, 200, mina.easeinout);
	});

	function initLoading() {
		loadingCircle.attr({
			'stroke-dasharray': circumf+' '+circumf,
			'stroke-dashoffset': circumf,
		});
	}

	function animateFloor() {
		floor.animate({'x2': floor.attr('data-x')}, 400, mina.easeinout, animateBuildings);
	}

	function animateBuildings() {
		buildingBase1.animate({'height': buildingBase1.attr('data-height')}, 800, mina.elastic);
		setTimeout(function(){
			buildingBase2.animate({'height': buildingBase2.attr('data-height')}, 800, mina.elastic);
		}, 100);
		setTimeout(function(){
			buildingBase3.animate({'height': buildingBase3.attr('data-height')}, 800, mina.elastic, function(){
				animateRoofs();
				animateDoors();
			});
		}, 200);
	}

	function animateRoofs() {
		buildingRoof1.animate({'width': buildingRoof1.attr('data-width')}, 300, mina.easeinout);
		setTimeout(function(){
			buildingRoof2.animate({'width': buildingRoof2.attr('data-width')}, 300, mina.easeinout);
		}, 100);
	}

	function animateDoors() {
		buildingDoor1.animate({'height': buildingDoor1.attr('data-height')}, 300, mina.easeinout);
		setTimeout(function(){
			buildingDoor2.animate({'height': buildingDoor2.attr('data-height')}, 300, mina.easeinout, function(){
				animateWindows();
			});
		}, 100);
	}

	function animateWindows() {
		buildingWindow1.animate({transform: 's1 1'}, 400, mina.easeinout);
		setTimeout(function(){
			buildingWindow2.animate({transform: 's1 1'}, 400, mina.easeinout);
		}, 100);
		setTimeout(function(){
			buildingWindow3.animate({transform: 's1 1'}, 400, mina.easeinout, function(){
				animateChimneies();
			});
		}, 200);
	}

	function animateChimneies() {
		buildingChimney.attr('visibility', 'visible').animate({'transform': 't0 0'}, 800, mina.elastic);
		setTimeout(function(){
			buildingRoof3.attr('visibility', 'visible').animate({'transform': 't0 0'}, 1000, mina.elastic, function(){
				showClouds();
			});
		}, 100);
	}

	function showClouds() {
		clouds1.animate({transform: 't210 0'}, 12000);
		clouds2.animate({transform: 't-210 0'}, 12000, function() {
			hideClouds();
		});
	}

	function hideClouds() {
		clouds1.animate({transform: 't-80 0'}, 12000);
		clouds2.animate({transform: 't70 0'}, 12000, function() {
			//this way the animation will be infinite
			showClouds();
		});
	}
})();