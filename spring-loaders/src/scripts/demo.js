'use strict';

// Custom SETTINGS for each demo in related index.html
let settings = SETTINGS || {
  rebound: {
    tension: 2,
    friction: 5
  },
  spinner: {
    radius: 80,
    sides: 3,
    depth: 4,
    colors: {
      background: '#000000',
      stroke: '#000000',
      base: '#222222',
      child: '#FFFFFF'
    },
    alwaysForward: true, // When false the spring will reverse normally.
    restAt: 0.5, // A number from 0.1 to 0.9 || null for full rotation
    renderBase: true // Optionally render basePolygon
  }
};

/**
 * Demo.
 */
const demo = {
  settings: settings,

  spring: null,
  spinner: null,

  /**
   * Initialize Rebound.js with settings.
   * Rebound is used to generate a spring which
   * is then used to animate the spinner.
   * See more: http://facebook.github.io/rebound-js/docs/rebound.html
   */
  initRebound() {

    let settings = demo.settings.rebound;

    // Create a SpringSystem.
    let springSystem = new rebound.SpringSystem();

    // Add a spring to the system.
    demo.spring = springSystem.createSpring(settings.tension, settings.friction);
  },

  /**
   * Initialize Spinner with settings.
   */
  initSpinner() {

    let settings = demo.settings.spinner;

    // Instantiate Spinner.
    demo.spinner = new Spinner(settings);
  },

  /**
   * Initialize demo.
   */
  init() {

    let spinnerTypeAutoSpin = true;

    // Instantiate animation engine and spinner system.
    demo.initRebound();
    demo.initSpinner();

    // Init animation with Rebound Spring System.
    demo.spinner.init(demo.spring, spinnerTypeAutoSpin);

    if (spinnerTypeAutoSpin) {
      // Fake loading time, in a real world just call demo.spinner.setComplete();
      // whenever the preload will be completed.
      setTimeout(() => {
        demo.spinner.setComplete();
      }, 6000);
    } else {
      // Perform real ajax request.
      demo.loadSomething();
    }
  },

  /**
   * Ajax Request.
   */
  loadSomething() {

    let oReq = new XMLHttpRequest();

    oReq.addEventListener('progress', (oEvent) => {
      if (oEvent.lengthComputable) {

        let percent = Math.ceil(oEvent.loaded / oEvent.total * 100);
        console.log('ajax loding percent', percent);

        // By setting the end value with the actual loading percentage
        // the spinner will progress based on the actual ajax loading time.
        demo.spring.setEndValue(percent * 0.01);
      }
    });

    oReq.addEventListener('load', (e) => {
      // Complete the loading animation.
      demo.spinner.setComplete();
    });

    oReq.open('GET', '/img/something.jpg');
    oReq.send();
  }
};
