
import ScrollOut from 'scroll-out';

import homeAnimation from 'js/views/home-animation';
import iconAnimations from 'js/views/icon-animations';
import Swiper from 'js/views/swiper';
import formsNetlify from 'js/utils/forms-netlify';

// lazy sizes for image loading
import 'lazysizes';


export default function() {

  ScrollOut({
    /* options */
    once: true,
  });


  homeAnimation();
  iconAnimations();
  Swiper();
  formsNetlify();

}



