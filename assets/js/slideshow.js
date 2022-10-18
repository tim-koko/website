import { /*isTouch,*/ getScrollPercent } from './utils';
import  Flickity from 'flickity';
import anime from 'animejs';
  

const slideshow = document.querySelector('.clients');

if(slideshow) {
  
    //const slider = 
  const flkty =  new Flickity( slideshow, {
        wrapAround: true,
        pageDots: false,
        //adaptiveHeight: false,
        draggable: false, //isTouch(),
        prevNextButtons: false,

        cellAlign: 'left',
        on: {
            ready: function() {
                console.log('Flickity ready');
                window.dispatchEvent(new Event('resize'));
            },
        }, 
    });

  // previous
  var previousButton = document.querySelector('.button-previous');
  previousButton.addEventListener( 'click', function() {
    flkty.previous();
  });
  // next
  var nextButton = document.querySelector('.button-next');
  nextButton.addEventListener( 'click', function() {
    flkty.next();
  });
}
/**/

// Play with this value to change the speed
//let tickerSpeed = 2;
/*
let flickity = null;
//let isPaused = false;
const slideshowEl = document.getElementById('slideshow');
*/

//
//   Functions
//
//////////////////////////////////////////////////////////////////////
/*
const update = () => {
  if (isPaused) return;
  if (flickity.slides) {
    flickity.x = (flickity.x - tickerSpeed) % flickity.slideableWidth;
    flickity.selectedIndex = flickity.dragEndRestingSelect();
    flickity.updateSelectedSlide();
    flickity.settle(flickity.x);
  }
  window.requestAnimationFrame(update);
};

const pause = () => {
  isPaused = true;
  tickerSpeed = 0.5;
};

const play = () => {
    tickerSpeed = 2;

  if (isPaused) {
    isPaused = false;
    window.requestAnimationFrame(update);
    }
};
*/

//
//   Create Flickity
//
//////////////////////////////////////////////////////////////////////
/*
flickity = new Flickity(slideshowEl, {
  autoPlay: false,
  prevNextButtons: false,
  pageDots: false,
  draggable: false,
  cellAlign: 'right',
  //wrapAround: true,
  freeScroll: true,
  //selectedAttraction: 0.015,
  //friction: 0.25,
});
flickity.x = 0;
*/

//
//   Add Event Listeners
//
//////////////////////////////////////////////////////////////////////
/*
slideshowEl.addEventListener('mouseenter', pause, false);
slideshowEl.addEventListener('focusin', pause, false);
slideshowEl.addEventListener('mouseleave', play, false);
slideshowEl.addEventListener('focusout', play, false);

flickity.on('dragStart', () => {
  isPaused = true;
});


//
//   Start Ticker
//
//////////////////////////////////////////////////////////////////////

update();
*/



const divAnimation = anime({
    targets: '.slider',
    translateX: ['130%', '-50%'],
    //translateX: ['800vw', '-405vw'],
    //elasticity: 200,
    easing: 'linear',
    autoplay: false,
    //duration: 200,
  });

  /**
 * Add a scroll listener on the window object to
 * control animations based on scroll percentage.
 */
//window.onscroll = () => {
  //  divAnimation.seek(( (getScrollPercent()) / 100) * divAnimation.duration );
    
    //var body = document.body,
    //html = document.documentElement;

    //var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );


    //const element = document.querySelector('.slideshow-container');
    // console.log(element.offsetTop)
    // console.log(height)
    // console.log((100/height) * element.offsetTop)

  
  //};
  window.addEventListener('scroll', () => {
    divAnimation.seek(( (getScrollPercent()) / 100) * divAnimation.duration * 2 );
  },{passive: true});