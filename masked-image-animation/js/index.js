// Tried to remake the animation as seen in the menu ludmillamaury.com (dev by the one and only twitter.com/manuelodelain)

var $hoverMe = $('.🍗');
var $colorOverlay = $('.color-overlay');
var $whiteOverlay = $('.white-overlay');
var isAnimated = false;

$hoverMe.on('mouseenter', showImage);
$hoverMe.on('mouseleave', hideImage);

function showImage() {
    if (isAnimated) {
        TweenMax.killAll();
        isAnimated = false;
    } else {
        isAnimated = true;
    }
    
    TweenMax.to($whiteOverlay, 1, {
        scaleX: 0, 
        ease:Quart.easeInOut
    });
    TweenMax.fromTo($colorOverlay, 1, 
        {scaleX: 1},
        {scaleX: 0, ease:Quart.easeInOut, delay: 0.2, onComplete: function() {
            $whiteOverlay[0].style.transformOrigin = "left 50% 0px";
            isAnimated = false;
        }}
    );
}

function hideImage() {
    if (isAnimated) {
        TweenMax.killAll();
        isAnimated = false;
    } else {
       isAnimated = true;
    }

    TweenMax.to($whiteOverlay, 0.8, {
        scaleX: 1, 
        ease:Quart.easeInOut,
        onComplete: function() {
            $whiteOverlay[0].style.transformOrigin = "right";
            isAnimated = false;
        }
    });
}