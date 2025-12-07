import { animate } from 'animejs';
import ScrollOut from 'scroll-out';

export default function() {

  if (document.querySelectorAll('.icon-draw').length === 0) {
    return;
  }

  //set all paths to 0
  animate({
    targets: '.icon-draw svg path',
    strokeDashoffset: [0,animate.setDashoffset],
    duration: 0,
  });

  /* eslint-disable */
  ScrollOut({
    targets: '.icon-draw',
    //threshold: 0.9,
    once: true,
    onShown: function(el) {
      animate({
        targets: el.querySelectorAll(`:scope ${'svg path'}`),
        strokeDashoffset: [animate.setDashoffset, 0],
        easing: 'easeOutSine',
        duration: 400,
        delay: function(el, i) { return i * 250 },
      });
    },
    onHidden: function(el) {
      // hide the element initially
    // el.style.opacity = 0;
    },
  });
  /* eslint-enable */


}