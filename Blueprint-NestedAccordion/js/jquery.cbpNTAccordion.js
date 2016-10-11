/**
 * jquery.cbpNTAccordion.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var $body = $( 'html, body' );

	$.CBPNTAccordion = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.CBPNTAccordion.defaults = {};

	$.CBPNTAccordion.prototype = {
		_init : function( options ) {
			// options
			this.options = $.extend( true, {}, $.CBPNTAccordion.defaults, options );
			// cache some elements and initialize some variables
			this._config();
			// initialize/bind the events
			this._initEvents();
		},
		_config : function() {

			// the clickable items
			this.$items = this.$el.find( '.cbp-nttrigger' );

		},
		_initEvents : function() {
			
			this.$items.on( 'click.cbpNTAccordion', function() {
				var $listItem = $( this ).parent();
				if( $listItem.hasClass( 'cbp-ntopen' ) ) {
					$listItem.removeClass( 'cbp-ntopen' );
				}
				else {
					$listItem.addClass( 'cbp-ntopen' );
					$body.scrollTop( $listItem.offset().top );
				}
			} );

		},
		destroy : function() {
			this.$items.off( '.cbpNTAccordion' ).parent().removeClass( 'cbp-ntopen' );
		}
	};

	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.cbpNTAccordion = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'cbpNTAccordion' );
				if ( !instance ) {
					logError( "cannot call methods on cbpNTAccordion prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for cbpNTAccordion instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		} 
		else {
			this.each(function() {	
				var instance = $.data( this, 'cbpNTAccordion' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'cbpNTAccordion', new $.CBPNTAccordion( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );