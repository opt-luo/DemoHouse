/**
 * cbpShop.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	function cbpShop( el ) {
		this.el = el;
		this._init();
	}

	cbpShop.prototype = {
		_init : function() {
			var self = this;
			
			this.touch = Modernizr.touch;

			this.products = this.el.querySelectorAll( 'ul.cbp-pggrid > li' );
			Array.prototype.slice.call( this.products ).forEach( function( el, i ) {
				var content = el.querySelector( 'div.cbp-pgcontent' ),
					item = content.querySelector( 'div.cbp-pgitem' ),
					rotate = content.querySelector( 'span.cbp-pgrotate' );

				if( self.touch ) {

					rotate.addEventListener( 'touchstart', function() { self._rotateItem( this, item ); } );

					var options = content.querySelector( 'ul.cbp-pgoptions' ),
						size = options.querySelector( 'li.cbp-pgoptsize > span' ),
						color = options.querySelector( 'li.cbp-pgoptcolor > span' );
					
					size.addEventListener( 'touchstart', function() { self._showItemOptions( this ); } );
					color.addEventListener( 'touchstart', function() { self._showItemOptions( this ); } );
				}
				else {
					rotate.addEventListener( 'click', function() { self._rotateItem( this, item ); } );
				}
			} );
		},
		_rotateItem : function( trigger, item ) {
			if( item.getAttribute( 'data-open' ) === 'open' ) {
				item.setAttribute( 'data-open', '' );
				trigger.className = trigger.className.replace(/\b cbp-pgrotate-active\b/,'');
				item.className = item.className.replace(/\b cbp-pgitem-showback\b/,'');
			}
			else {
				item.setAttribute( 'data-open', 'open' );
				trigger.className += ' cbp-pgrotate-active';
				item.className += ' cbp-pgitem-showback';
			}
		},
		_showItemOptions : function( trigger ) {
			if( trigger.getAttribute( 'data-open' ) === 'open' ) {
				trigger.setAttribute( 'data-open', '' );
				trigger.parentNode.className = trigger.parentNode.className.replace(/\b cbp-pgoption-active\b/,'');
			}
			else {
				trigger.setAttribute( 'data-open', 'open' );
				trigger.parentNode.className += ' cbp-pgoption-active';
			}
		},
		/*
		other functions..
		*/
	}

	window.cbpShop = cbpShop;

} )( window );