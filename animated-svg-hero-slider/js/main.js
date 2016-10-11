jQuery(document).ready(function(){
	/*
		convert a cubic bezier value to a custom mina easing
		http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
	*/
	var duration = 300,
		delay = 300,
		epsilon = (1000 / 60 / duration) / 4,
		firstCustomMinaAnimation = bezier(.42,.03,.77,.63, epsilon),
		secondCustomMinaAnimation = bezier(.27,.5,.6,.99, epsilon);

	//initialize the slider
	$('.cd-slider-wrapper').each(function(){
		initSlider($(this));
	});

	function initSlider(sliderWrapper) {
		//cache jQuery objects
		var slider = sliderWrapper.find('.cd-slider'),
			sliderNavigation = sliderWrapper.find('.cd-slider-navigation').find('li'),
			svgCoverLayer = sliderWrapper.find('div.cd-svg-cover'),
			pathId = svgCoverLayer.find('path').attr('id'),
			svgPath = Snap('#'+pathId);
		
		//store path 'd' attribute values	
		var pathArray = [];
		pathArray[0] = svgCoverLayer.data('step1');
		pathArray[1] = svgCoverLayer.data('step6');
		pathArray[2] = svgCoverLayer.data('step2');
		pathArray[3] = svgCoverLayer.data('step7');
		pathArray[4] = svgCoverLayer.data('step3');
		pathArray[5] = svgCoverLayer.data('step8');
		pathArray[6] = svgCoverLayer.data('step4');
		pathArray[7] = svgCoverLayer.data('step9');
		pathArray[8] = svgCoverLayer.data('step5');
		pathArray[9] = svgCoverLayer.data('step10');	

		//update visible slide when user clicks .cd-slider-navigation buttons
		sliderNavigation.on('click', function(event){
			event.preventDefault();
			var selectedItem = $(this);
			if(!selectedItem.hasClass('selected')) {
				// if it's not already selected
				var selectedSlidePosition = selectedItem.index(),
					selectedSlide = slider.children('li').eq(selectedSlidePosition),
					visibleSlide = slider.find('.visible'),
					visibleSlidePosition = visibleSlide.index(),
					direction = '';
				direction = ( visibleSlidePosition < selectedSlidePosition) ? 'next': 'prev';
				updateSlide(visibleSlide, selectedSlide, direction, svgCoverLayer, sliderNavigation, pathArray, svgPath);
			}
		});
	}

	function updateSlide(oldSlide, newSlide, direction, svgCoverLayer, sliderNavigation, paths, svgPath) {
		if( direction == 'next' ) {
			var path1 = paths[0],
				path2 = paths[2],
				path3 = paths[4];
				path4 = paths[6];
				path5 = paths[8];
		} else {
			var path1 = paths[1],
				path2 = paths[3],
				path3 = paths[5];
				path4 = paths[7];
				path5 = paths[9];
		}

		svgCoverLayer.addClass('is-animating');
		svgPath.attr('d', path1);
		svgPath.animate({'d': path2}, duration, firstCustomMinaAnimation, function(){
			svgPath.animate({'d': path3}, duration, secondCustomMinaAnimation, function(){
				oldSlide.removeClass('visible');
				newSlide.addClass('visible');
				updateNavSlide(newSlide, sliderNavigation);
				setTimeout(function(){
					svgPath.animate({'d': path4}, duration, firstCustomMinaAnimation, function(){
						svgPath.animate({'d': path5}, duration, secondCustomMinaAnimation, function(){
							svgCoverLayer.removeClass('is-animating');
						});
					});
				}, delay);
			});
		});
	}

	function updateNavSlide(actualSlide, sliderNavigation) {
		var position = actualSlide.index();
		sliderNavigation.removeClass('selected').eq(position).addClass('selected');
	}

	function bezier(x1, y1, x2, y2, epsilon){
		//https://github.com/arian/cubic-bezier
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
	};
});