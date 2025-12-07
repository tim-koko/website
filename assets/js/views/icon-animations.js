import { animate, createDrawable, stagger } from 'animejs';
import ScrollOut from 'scroll-out';

export default function() {

  const iconPaths = document.querySelectorAll('.icon-draw svg path');

  if (iconPaths.length === 0) {
    return;
  }

  //set all paths to 0
  animate(createDrawable(iconPaths), {
    draw: 0,
    duration: 0,
  });

  /* eslint-disable */
  ScrollOut({
    targets: '.icon-draw',
    //threshold: 0.9,
    once: true,
    onShown: function(el) {

      const paths = el.querySelectorAll('svg path');

      animate(createDrawable(paths), {
        draw: '0 1',
        ease: 'outSine',
        duration: 400,
        delay: stagger(250),
      });
    },
    onHidden: function(el) {
      // hide the element initially
    // el.style.opacity = 0;
    },
  });
  /* eslint-enable */


}