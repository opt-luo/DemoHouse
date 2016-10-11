var xmlns = "http://www.w3.org/2000/svg",
 xlinkns = "http://www.w3.org/1999/xlink",
 select = function(s) {
  return document.querySelector(s);
 },
 selectAll = function(s) {
  return document.querySelectorAll(s);
 },
 bellBtnHitCirc = select('.bellBtnHitCirc'),
 alarmSVG = select('.alarmSVG'),
 bellBtnLabel = select('.bellBtnLabel'),
 alarmBell = select('.alarmBell'),
 bellBtn = select('.bellBtn'),
 clockGroup = select('.clockGroup'),
 dottedLine = select('.dottedLine'),
 meridianLabel = select('.meridianLabel'),
 hourHand = select('.hourHand'),
 minuteHand = select('.minuteHand'),
 timeLabel = select('.timeLabel'),
 timeLabelGroup = select('.timeLabelGroup'),
 timeScaleGroup = select('.timeScaleGroup'),
 timeScaleMarkerGroup = select('.timeScaleMarkerGroup'),
 maxMinutes = 1440,
 maxHours = 24,
 timeScaleInterval = 60,
 minutesInHour = 60,
 centerX = 160,
 minuteHandMaxRotation = 360 * maxHours,
 timeStep = 5,
 hourRotationStep = 360 / 12,
 timeScaleMarkerColor = '#7e7e7e',
 multiplier = 2,
 timeScaleMarkers = 5,
 maxDrag = maxMinutes * multiplier,
 alarmBellOffsetX = 151,
 alarmSetPosX,
 alarmIsSet = false,
 initTime = 7.5,
 selectedColor = '#3498DB',
 pt

TweenMax.set('svg', {
 visibility: 'visible'
})
TweenMax.set([hourHand, minuteHand], {
 transformOrigin: '50% 100%'
})

TweenMax.set('.timeScaleHit', {
 width: maxDrag
})
TweenMax.set(clockGroup, {
 y: -20
})

/* TweenMax.set(bellBtn, {
 svgOrigin:'160 350',
 scale:3
}) */

TweenMax.set(alarmBell, {
 attr: {
  x: alarmBellOffsetX
 }
})

function makeTimeScale() {

 var marker, labelGroup

 for (var i = 0; i <= maxMinutes; i++) {
  //console.log(i % 5) 
  marker = document.createElementNS(xmlns, 'line');
  timeScaleMarkerGroup.appendChild(marker);

  var posX = centerX + (i * multiplier);

  if (i % timeScaleInterval == 0) {

   labelGroup = timeLabelGroup.cloneNode(true);
   timeScaleMarkerGroup.appendChild(labelGroup);
   labelGroup.querySelector('.timeLabelBtn').setAttribute('data-btnId', i / minutesInHour);
   TweenMax.set(marker, {
    attr: {
     x1: posX,
     x2: posX,
     y1: 460,
     y2: 440
    },
    stroke: timeScaleMarkerColor,
    strokeWidth: 1
   })

   TweenMax.set(labelGroup, {
    x: posX,
    y: 435
   })

   labelGroup.querySelector('.timeLabel').textContent = String(i / minutesInHour);

   //every 30 minutes
  } else if (i % (minutesInHour / 2) == 0) {

   TweenMax.set(marker, {
     attr: {
      x1: posX,
      x2: posX,
      y1: 460,
      y2: 445
     },
     stroke: timeScaleMarkerColor,
     strokeWidth: 1
    })
    //every timeScaleMarkers minutes (5)
  } else if (i % timeScaleMarkers == 0) {

   TweenMax.set(marker, {
    attr: {
     x1: posX,
     x2: posX,
     y1: 460,
     y2: 450
    },
    stroke: timeScaleMarkerColor,
    strokeWidth: 1
   })
  } else {

   timeScaleMarkerGroup.removeChild(marker);
  }

 }
}


var timeDraggable = Draggable.create(timeScaleGroup, {
 type: 'x',
 bounds: {
  maxX: 0,
  minX: (-maxDrag)
 },
 onDrag: dragUpdate,
 onThrowUpdate: dragUpdate,
 snap: function(endValue) {
  return Math.round(endValue / timeStep) * timeStep;
 },
 throwProps: true,
 dragClickables: true,
 maxDuration: 0.8,
 overshootTolerance: 0
})

function dragUpdate() {

 /* if(alarmIsSet){
   return;
  }  */
 var dragPosX = Math.round(timeScaleGroup._gsTransform.x / multiplier),
  minuteHandPercent = Math.abs(dragPosX / maxMinutes),
  minuteHandRotation = minuteHandPercent * minuteHandMaxRotation,
  hourHandPercent = Math.abs((dragPosX / maxMinutes) * maxHours),
  hourHandRotation = hourHandPercent * hourRotationStep,
  digitalMinutes, digitalTime,
  digitalHours;

 //console.log(hourHandPercent)

 TweenMax.to(minuteHand, 0.5, {
   rotation: minuteHandRotation,
   ease: Elastic.easeOut.config(0.3, 0.8)
  })
  /*TweenMax.to(clockDragger,0.1, {
   rotation:-minuteHandRotation
  })*/
 TweenMax.to(hourHand, 0.5, {
  rotation: hourHandRotation,
  ease: Elastic.easeOut.config(0.3, 0.8)
 })

 //console.log((minuteHandRotation % 360)/6 )
 digitalMinutes = Math.round((minuteHandRotation % 360) / 6);
 //digitalMinutes = digitalMinutes % timeStep;
 //console.log(digitalMinutes);
 digitalMinutes = (digitalMinutes == 60) ? '00' : digitalMinutes;
 digitalMinutes = (digitalMinutes >= 0 && digitalMinutes < 10) ? '0' + digitalMinutes : digitalMinutes;

 digitalHours = digitalHours = Math.floor(hourHandPercent);
 digitalHours = (digitalHours >= 0 && digitalHours < 10) ? '0' + digitalHours : digitalHours;
 digitalHours = (digitalHours > 23) ? '00' : digitalHours;

 digitalTime = digitalHours + ':' + digitalMinutes;
 //console.log(digitalMinutes)
 // meridianLabel.textContent = (hourHandPercent >=(maxHours/2) && hourHandPercent < maxHours) ? digitalTime+ ' PM' :digitalTime+ ' AM';

 //dotted line raise
 var diff = Math.abs(hourHandPercent - Math.round(hourHandPercent));
 //
 TweenMax.to(dottedLine, 0.1, {
  attr: {
   y2: (diff > 0.2) ? 445 : 400
  }
 })


 meridianLabel.textContent = (hourHandPercent >= (maxHours / 2) && hourHandPercent < maxHours) ? digitalTime : digitalTime;


}



function getLiveSnap(step) {
 timeDraggable[0].vars.snap = null;
 timeStep = step * multiplier;
 //timeDraggable[0].vars.throwProps = false;
 timeDraggable[0].vars.liveSnap = function(endValue) {
  return Math.round(endValue / timeStep) * timeStep;
 }

 timeDraggable[0].update(true);
}

function getSnap(step) {
 timeDraggable[0].vars.liveSnap = null;
 timeStep = step * multiplier;

 timeDraggable[0].vars.snap = function(endValue) {
  return Math.round(endValue / timeStep) * timeStep;
 }

 timeDraggable[0].update(true);
}

/* function clickNextDay(e){
 TweenMax.to(timeScaleGroup, 0.1, {
  x:0,
  onComplete:dragUpdate
 })
} */

function init() {

 //send it to 06:30 to start with
 TweenMax.to(timeScaleGroup, 1, {
  x: -initTime * (timeScaleInterval * multiplier),
  onUpdate: dragUpdate,
  ease: Power3.easeOut
 })
 getSnap(timeStep);

}



function docClick(e) {

 var klass = e.target.getAttribute('class');
 //console.log(e.target.getAttribute('class'))
 if (klass) {
  if (klass == "timeLabelBtn") {
   var btnId = Number(e.target.getAttribute('data-btnId'));
   //console.log(btnId);

   TweenMax.to(timeScaleGroup, 0.41, {
    x: -btnId * (timeScaleInterval * multiplier),
    onUpdate: dragUpdate,
    ease: Power3.easeOut
   })
   
   
/*     pt = alarmSVG.createSVGPoint();
     var loc = cursorPoint(e);
     //console.log(loc.x) 
     var circ = document.createElementNS(xmlns, 'circle');
     circ.setAttribute('cx', loc.x);
     circ.setAttribute('cy', loc.y);
     circ.setAttribute('r', 6);
     circ.setAttribute('fill', '#7e7e7e');
     alarmSVG.appendChild(circ);
     TweenMax.to(circ, 0.6, {
      attr: {
       r: 40
      },
      alpha: 0,
      onComplete: function() {
       alarmSVG.removeChild(this.target)
      }
     })   */ 
  }
 }
}
document.onclick = docClick;

function clickBellBtn(e) {
 pt = alarmSVG.createSVGPoint();
 var loc = cursorPoint(e);
 //console.log(loc.x) 
 var circ = document.createElementNS(xmlns, 'circle');
 circ.setAttribute('cx', loc.x);
 circ.setAttribute('cy', loc.y);
 circ.setAttribute('r', 6);
 circ.setAttribute('fill', '#7e7e7e');
 bellBtnHitCirc.appendChild(circ);
 TweenMax.to(circ, 0.6, {
  attr: {
   r: 40
  },
  alpha: 0,
  onComplete: function() {
   bellBtnHitCirc.removeChild(this.target)
  }
 })

 alarmIsSet = !alarmIsSet;

 //unset it all
 if (!alarmIsSet) {
  TweenMax.set(['.meridianLabel'], {
   fill: '#D6DADD'
  })
  TweenMax.to('.bellBtnRect', 1, {
   width: 105,
   attr: {
    x: 108
   },
   ease: Elastic.easeOut.config(0.6, 0.255),
   onStart: function() {
    bellBtnLabel.textContent = 'SET ALARM';
   }
  })
  TweenMax.set(alarmBell, {
   x: -2000
  })
  timeDraggable[0].enable();
  document.onclick = docClick;
  dragUpdate();
  TweenMax.to([clockGroup,'.timeScaleMarkerGroup'],0.6, {
   alpha: 1
  })
  TweenMax.set('.timeLabelGroup', {
   cursor: 'pointer'
  })

 } else {
  timeDraggable[0].disable();
  document.onclick = null;
  TweenMax.set(['.meridianLabel'], {
   fill: selectedColor
  })
  TweenMax.set('.timeScaleMarkerGroup', {
   alpha: 0.2
  })

  TweenMax.set('.timeLabelGroup', {
   cursor: 'auto'
  })
  alarmSetPosX = timeScaleGroup._gsTransform.x;
  var tl = new TimelineMax();
  tl.set(alarmBell, {
    x: -alarmSetPosX,
    alpha: 1
   })
   .from(alarmBell, 0.9, {
    scale: 0,
    transformOrigin: '50% 0%',
    ease: Elastic.easeOut.config(0.86, 0.55),
    onComplete: dragUpdate
   })
   .to('.bellBtnRect', 1, {
    width: 130,
    attr: {
     x: 95.5
    },
    ease: Elastic.easeOut.config(0.6, 0.255),
    onStart: function() {
     bellBtnLabel.textContent = 'UNSET ALARM';
    }
   })

 }

}

function cursorPoint(evt) {
 pt.x = evt.clientX;
 pt.y = evt.clientY;
 return pt.matrixTransform(alarmSVG.getScreenCTM().inverse());
}

bellBtn.onclick = clickBellBtn;
makeTimeScale();
init();