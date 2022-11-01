import ScrollOut from 'scroll-out';
import Headroom from 'headroom.js';

/*
ScrollOut({
    targets: '.banner',
    //offset: -100,
    threshold: 0.9,
  });
  */

  ScrollOut({
    /* options */
    //threshold: 0.5,
    //offset: -100,
    once: true,
  });



const headroom  = new Headroom(document.querySelector('.banner'));
// initialise
headroom.init({
  classes : {
    // when element is initialised
    initial : 'headroom',
    // when scrolling up
    pinned : 'headroom-pinned',
    // when scrolling down
    unpinned : 'headroom-unpinned',
    // when above offset
    top : 'headroom-top',
    // when below offset
    notTop : 'headroom-not-top',
    // when at bottom of scroll area
    bottom : 'headroom-bottom',
    // when not at bottom of scroll area
    notBottom : 'headroom-not-bottom',
    // when frozen method has been called
    frozen: 'headroom-frozen',
},
});