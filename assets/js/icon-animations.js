import anime from 'animejs';
import ScrollOut from 'scroll-out';

//set all paths to 0
anime({
  targets: '.floater svg path',
  //targets: el.querySelectorAll('.floater svg path'),
  strokeDashoffset: [0,anime.setDashoffset],
  duration: 0,
  //autoplay: false,
});

/* eslint-disable */
ScrollOut({
  targets: '.floater',
  threshold: 0.9,
  onShown: function(el) {
    // use the web animation API
    //el.animate([{ opacity: 0 }, { opacity: 1 }], 1000);
    anime({
      targets: el.querySelectorAll(`:scope ${'svg path'}`),
      //targets: el.querySelectorAll('.floater svg path'),
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