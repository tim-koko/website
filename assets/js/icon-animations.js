import anime from 'animejs';
import ScrollOut from 'scroll-out';

//set all paths to 0
anime({
  targets: '.icon-draw svg path',
  strokeDashoffset: [0,anime.setDashoffset],
  duration: 0,
});

/* eslint-disable */
ScrollOut({
  targets: '.icon-draw',
  threshold: 0.9,
  onShown: function(el) {
    anime({
      targets: el.querySelectorAll(`:scope ${'svg path'}`),
      strokeDashoffset: [anime.setDashoffset, 0],
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