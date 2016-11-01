function background(c1, c2) {
  return {
    background: '-moz-linear-gradient(15deg, ' + c1 + ' 50%, ' + c2 + ' 50.1%)',
    background: '-o-linear-gradient(15deg, ' + c1 + ', ' + c2 + ' 50.1%)',
    background: '-webkit-linear-gradient(15deg, ' + c1 + ' 50%, ' + c2 + ')',
    background: '-ms-linear-gradient(15deg, ' + c1 + ' 50%, ' + c2 + ' 50.1%)',
    background: 'linear-gradient(15deg, ' + c1 + ' 50%,' + c2 + ' 50.1%)'
  }
}

function changeBg(c1, c2) {
  $('div.bg').css(background(c1, c2)).fadeIn(700, function() {
    $('body').css(background(c1, c2));
    $('.bg').hide();
  })
  $('span.bg').css({
    background: '-moz-linear-gradient(135deg, ' + c1 + ', ' + c2 + ')',
    background: '-o-linear-gradient(135deg, ' + c1 + ', ' + c2 + ')',
    background: '-webkit-linear-gradient(135deg, ' + c1 + ', ' + c2 + ')',
    background: '-ms-linear-gradient(135deg, ' + c1 + ', ' + c2 + ')',
    background: 'linear-gradient(135deg, ' + c1 + ',' + c2 + ')'
  });
}

$slider = $('.slider');

$slider.slick({
  arrows: false,
  dots: true,
  infinite: true,
  speed: 600,
  fade: true,
  focusOnSelect: true,
  customPaging: function(slider, i) {
    var color = $(slider.$slides[i]).data('color').split(',')[1];
    return '<a><svg width="100%" height="100%" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.215" stroke="' + color + '"></circle></svg><span style="background:' + color + '"></span></a>';
  }
}).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
  colors = $('figure', $slider).eq(nextSlide).data('color').split(',');
  color1 = colors[0];
  color2 = colors[1];
  $('.price, .btn').css({
    color: color1
  });
  changeBg(color1, color2);
  $('.btn').css({
    borderColor: color2
  });
});