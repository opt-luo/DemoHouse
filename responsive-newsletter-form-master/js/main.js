jQuery(document).ready(function($){
	var messages = $('div[data-type="message"]');
	//check if user updates the email field
	$('.cd-form .cd-email').keyup(function(event){	
		//check if user has pressed the enter button (event.which == 13)
		if(event.which!= 13) {
			//if not..
			//hide messages and loading bar 
			messages.removeClass('slide-in is-visible');
			$('.cd-form').removeClass('is-submitted').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
		}

		var emailInput = $(this),
			insertedEmail = emailInput.val(),
			atPosition = insertedEmail.indexOf("@");
	    	dotPosition = insertedEmail.lastIndexOf(".");
	    //check if user has inserted a "@" and a dot
	    if (atPosition< 1 || dotPosition<atPosition+2 ) {
	    	//if he hasn't..
	    	//hide the submit button
	    	$('.cd-form').removeClass('is-active').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
	    } else {
	    	//if he has..
	    	//show the submit button
	    	$('.cd-form').addClass('is-active');
	    }
	});

	//backspace doesn't fire the keyup event in android mobile
	//so we check if the email input is focused to hide messages and loading bar 
	$('.cd-form .cd-email').on('focus', function(){
		messages.removeClass('slide-in is-visible');
		$('.cd-form').removeClass('is-submitted').find('.cd-loading').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
	});	

	//you should replace this part with your ajax function
	$('.cd-submit').on('click', function(event){
		if($('.cd-form').hasClass('is-active')) {
			event.preventDefault();
			//show the loading bar and the corrisponding message
			$('.cd-form').addClass('is-submitted').find('.cd-loading').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				showMessage();
			});

			//if transitions are not supported - show messages
			if($('html').hasClass('no-csstransitions')) {
				showMessage();
			}
		}
	});

	function showMessage() {
		if( $('#cd-success').is(':checked') ) {
			$('.cd-response-success').addClass('slide-in');
		} else if ( $('#cd-error').is(':checked') ) {
			$('.cd-response-error').addClass('is-visible');
		} else {
			$('.cd-response-notification').addClass('is-visible');
		}
	}

	//placeholder fallback (i.e. IE9)
	//credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
	if(!Modernizr.input.placeholder){
		$('[placeholder]').focus(function() {
			var input = $(this);
			if (input.val() == input.attr('placeholder')) {
				input.val('');
		  	}
		}).blur(function() {
		 	var input = $(this);
		  	if (input.val() == '' || input.val() == input.attr('placeholder')) {
				input.val(input.attr('placeholder'));
		  	}
		}).blur();
		$('[placeholder]').parents('form').submit(function() {
		  	$(this).find('[placeholder]').each(function() {
				var input = $(this);
				if (input.val() == input.attr('placeholder')) {
			 		input.val('');
				}
		  	})
		});
	}
});