
import ScrollOut from 'scroll-out';

import homeAnimation from 'js/views/home-animation';
import iconAnimations from 'js/views/icon-animations';
import slideshows from 'js/views/slideshow';
import Swiper from 'js/views/swiper';
//import about from 'js/views/about';
//import faq from 'js/views/faq';
//import Scrollmove from 'js/utils/scrollmove';
//import ScrollText from 'js/utils/scrolltext';
//import imageclouds from 'js/utils/imageclouds';
import formsNetlify from 'js/utils/forms-netlify';

// lazy sizes for image loading
import 'lazysizes';

//import { Popover } from 'bootstrap';


export default function() {

  ScrollOut({
    /* options */
    once: true,
  });


  homeAnimation();



  //imageclouds();
  //Scrollmove();
  //ScrollText();
  slideshows();
  iconAnimations();
  //about();
  //faq();
  formsNetlify();

  Swiper();







  // still needed?
/*
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');

  if (popoverTriggerList) {
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl));
  }
*/



}



