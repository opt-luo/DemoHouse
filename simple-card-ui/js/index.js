//Create canvas and initialize context
var canvas = document.getElementById("circles");
var ctx = canvas.getContext("2d");

//Set the dimensions of canvas equal to the dimensions of the card
var W = canvas.width = 600;
var H = canvas.height = 300;

//Number of circles
var circleNbr = 10;

// Gradient - http://www.planwallpaper.com/static/images/6942095-abstract-background-wallpaper.jpg;
  var bgColor1 = 'rgba(153, 83, 85, 1)';
  var bgColor2 = 'rgba(52, 9, 80, 1)';

//Create an array of circles
var circles = []; 
for(var i = 0; i < circleNbr; i++ ){
  circles.push(new circle());
}

//Function to create a circle
function circle() {
  //Random Position
  this.x = Math.random()*W;
  this.y = Math.random()*H;

  //Random Velocities
  this.vx = 0.2 + Math.random()*0.5;
  this.vy = -this.vx;

  //Random Radius
  this.r = 3 + Math.random()*10;

      //Random opacity color
      this.color = "rgba(200, 116, 82,"+(Math.random()*(1 - .5) + .5).toFixed(1)+")";
}

//Function to draw the gradient background with the circles
function draw() {

  var grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, bgColor1);
  grd.addColorStop(1, bgColor2);

  //Fill the canvas with the gradient
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  //Fill the canvas with the circles
  for(var j = 0; j < circles.length; j++) {
    var c = circles[j];

    //Draw the circle
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, Math.PI*2, false);
    ctx.fillStyle = c.color;
    ctx.fill();

    //Velocity
    c.x -= c.vx;
    c.y += c.vy;

    //When the circles are out of the canvas
    if(c.x < -20) c.x = W+20;
    if(c.y < -20) c.y = H+20;
  }
}
setInterval(draw, 30);