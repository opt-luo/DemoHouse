'use strict';

/**
 * Demo.
 */
const demo = {
  settings: SETTINGS,

  context: null,

  /**
   * Initialize Rebound.js with settings.
   * Rebound is used to generate a spring which
   * is then used to animate the spinner.
   * See more: http://facebook.github.io/rebound-js/docs/rebound.html
   */
  initRebound(settings) {
    // Create a SpringSystem.
    let springSystem = new rebound.SpringSystem();

    // Add a spring to the system.
    return springSystem.createSpring(settings.tension, settings.friction);
  },

  /**
   * Initialize Spinner with settings.
   */
  initSpinner(settings) {
    return new Spinner(settings);
  },

  /**
   * Initialize demo.
   */
  init() {

    demo.settings.forEach((setting) => {
      // Instantiate animation engine and spinner system.
      setting.instances.spring = demo.initRebound(setting.rebound);
      setting.instances.spinner = demo.initSpinner(setting.spinner);
      // Init animation with Rebound Spring System.
      setting.instances.spinner.init(setting.instances.spring, playAll);
    });

    let canvas = document.createElement('canvas');

    demo.context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.width = gridEl.offsetWidth;
    canvas.height = gridH * Math.ceil( demo.settings.length / cols );

    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;

    gridEl.appendChild(canvas);

    demo.render();

    if (!playAll) {
      let gridElTop = gridEl.getBoundingClientRect().top;
      // Activate spinners on click only.
      document.addEventListener('click', function(e) {

        let cellX = Math.floor(e.clientX / gridW);
        let cellY = Math.floor((e.clientY + window.scrollY - gridElTop) / gridH);

        let cell = cellX + (cellY * cols);

        // Play clicked spinner.
        if (demo.settings[cell]) {
          let spinner = demo.settings[cell].instances.spinner;

          spinner.isAutoSpin = true;
          spinner.spin();

          setTimeout(() => {
            spinner.isAutoSpin = false;
          }, 5000);
        }
      });
    }
  },

  render() {

    demo.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let x = 0;
    let y = 0;

    demo.settings.forEach((item) => {

      let spinner = item.instances.spinner;

      demo.context.drawImage(spinner.context.canvas, x, y);

      x += gridW;

      if (x >= window.innerWidth) {
        x = 0;
        y += gridH;
      }
    });

    requestAnimationFrame(demo.render);
  }
};

document.addEventListener('DOMContentLoaded', demo.init);
