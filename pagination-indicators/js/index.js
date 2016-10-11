console.clear();
(function() {
  "use strict";

  var bulletClasses = {
    elements: {
      container: ".pindicator",
      bullet: ".bullet",
    },
    helpers: {
      past: "past",
      current: "current",
      next: "next",
      future: "future",
    }
  };
  
  var bulletEls;
  document.addEventListener("DOMContentLoaded", initBullets);

  function initBullets() {
    bulletEls = Array.prototype.slice.call(
      document.body.querySelectorAll(bulletClasses.elements.bullet)
    );
    bulletEls.forEach(function(el) {
      el.addEventListener("mousedown", function(event) {
        gotoPage(bulletEls.indexOf(this) + 1);
      });
      el.addEventListener("touchstart", function(event) {
        event.preventDefault();
        gotoPage(bulletEls.indexOf(this) + 1);
      });
    });
  }

  function gotoPage(pageNum) {
    bulletEls.forEach(function(e) {
      e.classList.remove.apply(e.classList,
        Object.keys(bulletClasses.helpers).map(function(e){
          return bulletClasses.helpers[e];
        })
      )
    });
    bulletEls[pageNum - 1].classList.add(bulletClasses.helpers.current);
    if(pageNum > 1) {
      for(var i = 0; i < pageNum; i++) {
        bulletEls[i].classList.add(bulletClasses.helpers.past);
      }
    }
    if(pageNum < bulletEls.length) {
      bulletEls[pageNum].classList.add(bulletClasses.helpers.next);
      for(var i = bulletEls.length - 1; i >= pageNum; i--) {
        bulletEls[i].classList.add(bulletClasses.helpers.future);
      }
    }
  }
})();