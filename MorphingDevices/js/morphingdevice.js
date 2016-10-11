/**
 * morphingdevice.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var MorphingDevice = function( el, settings ) {

    var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition' : 'transitionend',
            'OTransition' : 'oTransitionEnd',
            'msTransition' : 'MSTransitionEnd',
            'transition' : 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        slideshow, isSlideshowRunning = false,
        device = el.querySelector( 'div.md-device' ), current = 0, rotated = false,
        rotateDevice = document.createElement( 'button' ),
        img = device.querySelector( 'a > img' );

    function init() {
        rotateDevice.style.display = 'none' ;
        rotateDevice.onclick = function() {
            stopSlideshow();
            device.className = rotated ? device.className.replace(/\b md-rotated\b/,'') : device.className + ' md-rotated';
            // change images
            var newsrc = rotated ? settings.devices[current].imgsrc : settings.devices[current].rotatedsrc;
            changeImages( newsrc );
            rotated = !rotated;
            return false;
        }
        device.appendChild( rotateDevice );

        // HTML5 PageVisibility API
        // http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
        // by Joe Marini (@joemarini)
        
        // use the property name to generate the prefixed event name
        var visProp = getHiddenProp();
        if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener( evtname, function() {
                if( isSlideshowRunning ) {
                    isHidden() ? (stopSlideshow(), isSlideshowRunning = true) : startSlideshow();
                }
            } );
        }
    }

    function changeDevice() {
        device.className = 'md-device ' + settings.devices[current].cName;
        rotated = false;
        rotateDevice.style.display = settings.devices[current].canRotate ? '' : 'none';
        // change images
        changeImages( settings.devices[current].imgsrc );
    }

    function changeImages( newsrc ) {
        var imgwrapper = img.parentNode,
            newimg = document.createElement( 'img' );
        
        newimg.setAttribute( 'src', newsrc );
        
        if( imgwrapper.childNodes.length > 1 ) {
            imgwrapper.removeChild( imgwrapper.firstChild );
        }
        imgwrapper.insertBefore( newimg, img );
        img.className = 'md-fadeout';

        img.addEventListener( transEndEventName, function( event ) {
            img = newimg;
            if( this.parentNode != null ) {
                this.parentNode.removeChild( this );
            }
        }, false );
    }

    function startSlideshow() {
        isSlideshowRunning = true;
        runSlideshow();
    }

    function runSlideshow() {
        slideshow = setTimeout( function() {
            var pos = current < devicesTotal - 1 ? current + 1 : 0;
            updateCurrentTrigger( nav.children[pos] );
            current = pos;
            changeDevice();
            if ( settings.autoplay ) {
                runSlideshow();
            }
        }, settings.interval );
    }

    function stopSlideshow() {
        isSlideshowRunning = false;
        clearTimeout( slideshow );
    }

    function setCurrent(c) {
        current = c;
    }

    function getCurrent() {
        return current;
    }

    function updateCurrentTrigger( trigger ) {
        var triggers = nav.children;
        triggers[current].className = triggers[current].className.replace(/\bmd-current\b/,'');
        trigger.className = 'md-current';
    }

    init();

    return {
        init : init,
        setCurrent : setCurrent,
        getCurrent : getCurrent,
        changeDevice : changeDevice,
        startSlideshow : startSlideshow,
        stopSlideshow : stopSlideshow,
        updateCurrentTrigger : updateCurrentTrigger
    }
 
};

// HTML5 PageVisibility API
// http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
// by Joe Marini (@joemarini)
function getHiddenProp(){
    var prefixes = ['webkit','moz','ms','o'];
    
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';
    
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
        if ((prefixes[i] + 'Hidden') in document) 
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
}
function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;
    
    return document[prop];
}