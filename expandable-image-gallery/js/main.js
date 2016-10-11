jQuery(document).ready(function($){
	var itemInfoWrapper = $('.cd-single-item');
	
	itemInfoWrapper.each(function(){
		var container = $(this),
			// create slider pagination
			sliderPagination = createSliderPagination(container);
		
		container.find('.cd-slider').on('click', function(event){
			//enlarge slider images 
			if( !container.hasClass('cd-slider-active') && $(event.target).is('.cd-slider')) {
				itemInfoWrapper.removeClass('cd-slider-active');
				container.addClass('cd-slider-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
					$('body,html').animate({'scrollTop':container.offset().top}, 200);
				});
			}
		});

		container.find('.cd-close').on('click', function(){
			//shrink slider images 
			container.removeClass('cd-slider-active');
		});

		//update visible slide
		container.find('.cd-next').on('click', function(){
			nextSlide(container, sliderPagination);
		});

		container.find('.cd-prev').on('click', function(){
			prevSlide(container, sliderPagination);
		});

		container.find('.cd-slider').on('swipeleft', function(){
			var wrapper = $(this),
				bool = enableSwipe(container);
			if(!wrapper.find('.selected').is(':last-child') && bool) {nextSlide(container, sliderPagination);}
		});

		container.find('.cd-slider').on('swiperight', function(){
			var wrapper = $(this),
				bool = enableSwipe(container);
			if(!wrapper.find('.selected').is(':first-child') && bool) {prevSlide(container, sliderPagination);}
		});

		sliderPagination.on('click', function(){
			var selectedDot = $(this);
			if(!selectedDot.hasClass('selected')) {
				var selectedPosition = selectedDot.index(),
					activePosition = container.find('.cd-slider .selected').index();
				if( activePosition < selectedPosition) {
					nextSlide(container, sliderPagination, selectedPosition);
				} else {
					prevSlide(container, sliderPagination, selectedPosition);
				}
			}
		});
	});	
		
	//keyboard slider navigation
	$(document).keyup(function(event){
		if(event.which=='37' && $('.cd-slider-active').length > 0 && !$('.cd-slider-active .cd-slider .selected').is(':first-child')) {
			prevSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
		} else if( event.which=='39' && $('.cd-slider-active').length && !$('.cd-slider-active .cd-slider .selected').is(':last-child')) {
			nextSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
		} else if(event.which=='27') {
			itemInfoWrapper.removeClass('cd-slider-active');
		}
	});

	function createSliderPagination($container){
		var wrapper = $('<ul class="cd-slider-pagination"></ul>').insertAfter($container.find('.cd-slider-navigation'));
		$container.find('.cd-slider li').each(function(index){
			var dotWrapper = (index == 0) ? $('<li class="selected"></li>') : $('<li></li>'),
				dot = $('<a href="#0"></a>').appendTo(dotWrapper);
			dotWrapper.appendTo(wrapper);
			dot.text(index+1);
		});
		return wrapper.children('li');
	}

	function nextSlide($container, $pagination, $n){
		var visibleSlide = $container.find('.cd-slider .selected'),
			navigationDot = $container.find('.cd-slider-pagination .selected');
		if(typeof $n === 'undefined') $n = visibleSlide.index() + 1;
		visibleSlide.removeClass('selected');
		$container.find('.cd-slider li').eq($n).addClass('selected').prevAll().addClass('move-left');
		navigationDot.removeClass('selected')
		$pagination.eq($n).addClass('selected');
		updateNavigation($container, $container.find('.cd-slider li').eq($n));
	}

	function prevSlide($container, $pagination, $n){
		var visibleSlide = $container.find('.cd-slider .selected'),
			navigationDot = $container.find('.cd-slider-pagination .selected');
		if(typeof $n === 'undefined') $n = visibleSlide.index() - 1;
		visibleSlide.removeClass('selected')
		$container.find('.cd-slider li').eq($n).addClass('selected').removeClass('move-left').nextAll().removeClass('move-left');
		navigationDot.removeClass('selected');
		$pagination.eq($n).addClass('selected');
		updateNavigation($container, $container.find('.cd-slider li').eq($n));
	}

	function updateNavigation($container, $active) {
		$container.find('.cd-prev').toggleClass('inactive', $active.is(':first-child'));
		$container.find('.cd-next').toggleClass('inactive', $active.is(':last-child'));
	}

	function enableSwipe($container) {
		var mq = window.getComputedStyle(document.querySelector('.cd-slider'), '::before').getPropertyValue('content');
		return ( mq=='mobile' || $container.hasClass('cd-slider-active'));
	}
});