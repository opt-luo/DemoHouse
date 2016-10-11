var $boxOne = $('.box:nth-child(1)'),
  $boxTwo = $('.box:nth-child(2)'),
  $boxThree = $('.box:nth-child(3)');

var boxOne = new TimelineMax(),
  boxTwo = new TimelineMax(),
  boxThree = new TimelineMax();

boxOne.to($boxOne, 0.6, {
  opacity: 0.25,
  scale: 1,
  ease: Back.easeOut
}).to($boxOne, 0.6, {
  rotation: 4,
  ease: Back.easeOut
}, 2);

boxTwo.to($boxTwo, 0.6, {
  opacity: 0.5,
  scale: 1,
  ease: Back.easeOut
}, 0.6).to($boxTwo, 0.6, {
  rotation: -4,
  ease: Back.easeOut
}, 1.8);

boxThree.to($boxThree, 0.6, {
  opacity: 1,
  scale: 1,
  ease: Back.easeOut
}, 1.2);

/**
 * Point Animation
 */
$('.point').on('click', function(e) {
  var getTotalPoints = $('.point').length,
    getIndex = $(this).index(),
    getCompleteIndex = $('.point--active').index();

  TweenMax.to($('.bar__fill'), 0.6, {
    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
  });

  if (getIndex => getCompleteIndex) {
    $('.point--active').addClass('point--complete').removeClass('point--active');

    $(this).addClass('point--active');
    $(this).prevAll().addClass('point--complete');
    $(this).nextAll().removeClass('point--complete');
  }
});

/*
  Demo Purposes
*/
var progressAnimation = function() {
  var getTotalPoints = $('.point').length,
    getIndex = Math.floor(Math.random() * 4) + 1,
    getCompleteIndex = $('.point--active').index();

  TweenMax.to($('.bar__fill'), 0.6, {
    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
  });

  if (getIndex => getCompleteIndex) {
    $('.point--active').addClass('point--complete').removeClass('point--active');

    $('.point:nth-child(' + (getIndex + 1) + ')').addClass('point--active');
    $('.point:nth-child(' + (getIndex + 1) + ')').prevAll().addClass('point--complete');
    $('.point:nth-child(' + (getIndex + 1) + ')').nextAll().removeClass('point--complete');
  }
};

var animateProgress = setInterval(progressAnimation, 1200);

$(document).hover(function() {
  clearInterval(animateProgress)
});

$('.radius-toggle').on('click', function() {
  $('body').toggleClass('show-radius')
});