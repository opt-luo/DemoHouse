/**
 * jquery.imgslider.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, Codrops
 * http://www.codrops.com
 */

;( function( $, window, undefined ) {
	
	'use strict';

	// blank image data-uri bypasses webkit log warning (thx doug jones)
	var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	/*!
	* jQuery imagesLoaded plugin v2.0.1
	* http://github.com/desandro/imagesloaded
	*
	* MIT License. by Paul Irish et al.
	*/

	/*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */
	/*global jQuery: false */
	$.fn.imagesLoaded = function( callback ) {
		var $this = this,
			deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
			hasNotify = $.isFunction(deferred.notify),
			$images = $this.find('img').add( $this.filter('img') ),
			loaded = [],
			proper = [],
			broken = [];

		function doneLoading() {
			var $proper = $(proper),
				$broken = $(broken);

			if ( deferred ) {
				if ( broken.length ) {
					deferred.reject( $images, $proper, $broken );
				} else {
					deferred.resolve( $images );
				}
			}

			if ( $.isFunction( callback ) ) {
				callback.call( $this, $images, $proper, $broken );
			}
		}

		function imgLoaded( img, isBroken ) {
			// don't proceed if BLANK image, or image is already loaded
			if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
				return;
			}

			// store element in loaded images array
			loaded.push( img );

			// keep track of broken and properly loaded images
			if ( isBroken ) {
				broken.push( img );
			} else {
				proper.push( img );
			}

			// cache image and its state for future calls
			$.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

			// trigger deferred progress method if present
			if ( hasNotify ) {
				deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
			}

			// call doneLoading and clean listeners if all images are loaded
			if ( $images.length === loaded.length ){
				setTimeout( doneLoading );
				$images.unbind( '.imagesLoaded' );
			}
		}

		// if no images, trigger immediately
		if ( !$images.length ) {
			doneLoading();
		} else {
			$images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
				// trigger imgLoaded
				imgLoaded( event.target, event.type === 'error' );
			}).each( function( i, el ) {
				var src = el.src;

				// find out if this image has been already checked for status
				// if it was, and src has not changed, call imgLoaded on it
				var cached = $.data( el, 'imagesLoaded' );
				if ( cached && cached.src === src ) {
					imgLoaded( el, cached.isBroken );
					return;
				}

				// if complete is true and browser supports natural sizes, try
				// to check for image status manually
				if ( el.complete && el.naturalWidth !== undefined ) {
					imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
					return;
				}

				// cached images don't fire load sometimes, so we reset src, but only when
				// dealing with IE, or image is complete (loaded) and failed manual check
				// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
				if ( el.readyState || el.complete ) {
					el.src = BLANK;
					el.src = src;
				}
			});
		}

		return deferred ? deferred.promise( $this ) : $this;
	};

	/*
	* debouncedresize: special jQuery event that happens once after a window resize
	*
	* latest version and complete README available on Github:
	* https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
	*
	* Copyright 2011 @louis_remi
	* Licensed under the MIT license.
	*/
	var $event = $.event,
	$special,
	resizeTimeout;

	$special = $event.special.debouncedresize = {
		setup: function() {
			$( this ).on( "resize", $special.handler );
		},
		teardown: function() {
			$( this ).off( "resize", $special.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
				args = arguments,
				dispatch = function() {
					// set correct event type
					event.type = "debouncedresize";
					$event.dispatch.apply( context, args );
				};

			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
			}

			execAsap ?
				dispatch() :
				resizeTimeout = setTimeout( dispatch, $special.threshold );
		},
		threshold: 50
	};

	// global
	var $window				= $( window ),
		Modernizr			= window.Modernizr;

	$.ImgSlider				= function( options, element ) {
		
		var _self = this;

		this.$el = $( element ).hide();
		
		// preload images
		this.$el.imagesLoaded( function() {

			_self.$el.show();
			_self._init( options );

		} );
		
	};

	$.ImgSlider.defaults	= {
		autoplay	: false,
		interval	: 4000
	};

	$.ImgSlider.prototype	= {

		_init				: function( options ) {
			
			// options
			this.options		= $.extend( true, {}, $.ImgSlider.defaults, options );

			this.current			= 0;
			
			// https://github.com/twitter/bootstrap/issues/2870
			var transEndEventNames	= {
				'WebkitTransition'	: 'webkitTransitionEnd',
				'MozTransition'		: 'transitionend',
				'OTransition'		: 'oTransitionEnd',
				'msTransition'		: 'MSTransitionEnd',
				'transition'		: 'transitionend'
			};
			this.transEndEventName	= transEndEventNames[ Modernizr.prefixed('transition') ];

			// the initial elements
			this.$initElems		= this.$el.children( 'figure' );
			// total number of elements
			this.initElemsCount	= this.$initElems.length;
			
			if( this.initElemsCount < 3 ) {

				return false;

			}

			// build layout
			this._layout();
			// init events
			this._initEvents();

			// autoplay on
			if( this.options.autoplay ) {
			
				this._startSlideshow();
			
			}

		},
		_layout				: function() {

			this.$initElems.wrapAll( '<div class="fs-temp"></div>' ).hide();

			this.$initElems
				.filter( ':lt(3)' )
				.clone()
				.show()
				.prependTo( this.$el )
				.wrap( '<div class="fs-block"></div>' );

			this.$el
				.wrap( '<section class="fs-container"></section>' )
				.wrap( '<div class="fs-wrapper"></div>' );

			this.$blocks	= this.$el.children( 'div.fs-block' );
			
			// cache the 3 main blocks
			this.$blockL	= this.$blocks.eq( 0 );
			this.$blockC	= this.$blocks.eq( 1 );
			this.$blockR	= this.$blocks.eq( 2 );

			this.$blockC.find( 'figcaption' ).addClass( 'fs-transition' );

			// all items
			this.$temp		= this.$el.find( 'div.fs-temp' );

			// resize images
			this._resizeBlocks();

			// add navigation if needed
			if( this.initElemsCount > 3 ) {

				var $nav = $( '<nav class="fs-navigation"><span>Previous</span><span>Next</span></nav>' ).appendTo( this.$el.parent() );

				// next and previous
				this.$navPrev	= $nav.find( 'span:first' );
				this.$navNext	= $nav.find( 'span:last' );

				this._initNavigationEvents();

			}

		},
		// gets the image size and position in order to make it fullscreen and centered.
        _getImageDim			: function( src, limits ) {

        	var img		= new Image();

			img.src		= src;

			var l_w		= limits.width,
				l_h		= limits.height,
				r_w		= l_h / l_w,
				i_w		= img.width,
				i_h		= img.height,
				r_i		= i_h / i_w,
				new_w, new_h, new_left, new_top;

			if( r_w > r_i ) {

				new_h	= l_h;
				new_w	= l_h / r_i;

			}
			else {

				new_h	= l_w * r_i;
				new_w	= l_w;

			}

			return {
				width	: new_w,
				height	: new_h,
				left	: ( l_w - new_w ) / 2,
				top		: ( l_h - new_h ) / 2
			};

		},
		_initNavigationEvents	: function() {

			var _self = this;

			this.$navPrev.on( 'click.imgslider', function() {

				if( _self.options.autoplay ) {
				
					clearTimeout( _self.slideshow );
					_self.options.autoplay	= false;
				
				}

				_self._navigate( 'left' );

			} );
			this.$navNext.on( 'click.imgslider', function() {

				if( _self.options.autoplay ) {
				
					clearTimeout( _self.slideshow );
					_self.options.autoplay	= false;
				
				}
				
				_self._navigate( 'right' );

			} );

		},
		_initEvents				: function() {

			var _self = this;

			$window.on( 'debouncedresize.imgslider', function() {

				_self._resizeBlocks();

			} );

		},
		// resize the images
		_resizeBlocks			: function() {

			var _self = this;

			this.$blocks.each( function( i ) {

				var $el 	= $( this ).children( 'figure' ),
					$img	= $el.children( 'img' ),
					dim		= _self._getImageDim( $img.attr( 'src' ), { width : $el.width(), height : $el.height() } );

				// save the image dimentions
				switch( i ) {
					case 0 : _self.$blockL.data( 'imgstyle', dim ); break;
					case 1 : _self.$blockC.data( 'imgstyle', dim ); break;
					case 2 : _self.$blockR.data( 'imgstyle', dim ); break;
				};

				// apply style
				$img.css( dim );

			} );

		},
		_navigate				: function( dir ) {

			if( this.isAnimating === true ) {

				return false;

			}

			this.isAnimating = true;

			var _self	= this,
				$items	= this.$temp.children(),
				LIndex, CIndex, RIndex;
			
			this.$blocks.find( 'figcaption' ).hide().css( 'transition', 'none' ).removeClass( 'fs-transition' );

			if( dir === 'right' ) {

				LIndex = this.current + 1;
				CIndex = this.current + 2;
				RIndex = this.current + 3;
				
				if( LIndex >= this.initElemsCount ) {

					LIndex -= this.initElemsCount

				}

				if( CIndex >= this.initElemsCount ) {

					CIndex -= this.initElemsCount

				}

			}
			else if( dir === 'left' ) {

				LIndex = this.current - 1;
				CIndex = this.current;
				RIndex = this.current + 1;
				
				if( LIndex < 0 ) {

					LIndex = this.initElemsCount - 1

				}

			}
				
				if( RIndex >= this.initElemsCount ) {

				RIndex -= this.initElemsCount

			}

			var $elL	= $items.eq( LIndex ).clone().show(),
				$elC	= $items.eq( CIndex ).clone().show(),
				$elR	= $items.eq( RIndex ).clone().show();

			// resize images
			$elL.children( 'img' ).css( this.$blockL.data( 'imgstyle' ) );
			$elC.children( 'img' ).css( this.$blockC.data( 'imgstyle' ) );
			$elR.children( 'img' ).css( this.$blockR.data( 'imgstyle' ) );
			
			this.$blockL.append( $elL );
			this.$blockC.append( $elC );
			this.$blockR.append( $elR );

			// now show new images

			var $slides = this.$blocks.find( 'figure:first' ).css( 'width', '0%');
			
			if( Modernizr.csstransitions ) {

				$slides.on( this.transEndEventName, function( event ) {

					var $this 		= $( this ),
						blockIdx	= $this.parent().index('');
					
					_self._slideEnd( dir, blockIdx, $elC );

					$this.off( _self.transEndEventName ).remove();

				} );

			}
			else {

				$slides.each( function() {

				var $this 		= $( this ),
					blockIdx	= $this.parent().index('');

					_self._slideEnd( dir, blockIdx, $elC );

				} );

				this._slideEnd();

			}

		},
		_slideEnd				: function( dir, blockIdx, $main ) {

				if( blockIdx === 0 ) {

				if( this.current === this.initElemsCount - 1 && dir === 'right' ) {

					this.current = 0;

					}
				else if( this.current === 0 && dir === 'left' ) {

					this.current = this.initElemsCount - 1;

					}
					else {
						
					( dir === 'right' ) ? ++this.current : --this.current;
					
					}

				this.isAnimating = false;

				}
				else if( blockIdx === 1 ) {

				$main.find( 'figcaption' ).addClass( 'fs-transition' );

				}

		},
		// auto slideshow
		_startSlideshow			: function() {
		
			var _self	= this;
			
			this.slideshow	= setTimeout( function() {
				
				_self._navigate( 'right' );
				
				if( _self.options.autoplay ) {
				
					_self._startSlideshow();
				
		}
			
			}, this.options.interval );
		
		},

	};
	
	var logError		= function( message ) {

		if ( window.console ) {

			window.console.error( message );
		
		}

	};
	
	$.fn.imgslider		= function( options ) {
		
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'imgslider' );
				
				if ( !instance ) {

					logError( "cannot call methods on imgslider prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {

					logError( "no such method '" + options + "' for imgslider instance" );
					return;
				
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
				
				var instance = $.data( this, 'imgslider' );
				
				if ( instance ) {

					instance._init();
				
				}
				else {

					$.data( this, 'imgslider', new $.ImgSlider( options, this ) );
				
				}

			});
		
		}
		
		return this;
		
	};
	
} )( jQuery, window );