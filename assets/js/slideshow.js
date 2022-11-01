//import { /*isTouch,*/  getScrollPercent } from './utils';
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

//function(){return-(t.items.offsetWidth-window.innerWidth/2)



const element = document.querySelector('.slideshow-container');
const slider = document.querySelector('.slideshow-container .slider');
const containerFluid = document.querySelector('.container-fluid');

 
let sliderWidth = slider.parentElement.scrollWidth,
    containerWidth = containerFluid.scrollWidth;

element.style.setProperty('--height', (sliderWidth) + 'px');


window.addEventListener('resize', () => {
  sliderWidth = slider.parentElement.scrollWidth;
  containerWidth = containerFluid.scrollWidth;

  element.style.setProperty('--height', (sliderWidth) + 'px');
  
},{passive: true});


const divAnimation = anime({
    targets: '.slider',
    translateX: ['0', '-'+(sliderWidth -containerWidth)],
    //translateX: ['800vw', '-405vw'],
    elasticity: 200,
    easing: 'easeInOutQuad',
    autoplay: false,
    //duration: 200,
  });

  const percentageSeen = () => {
    // Get the relevant measurements and positions
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const elementHeight = element.offsetHeight;
    const elementOffsetTop = element.offsetTop;
  
    // Calculate percentage of the element that's been seen
    const distance = scrollTop /*+ viewportHeight*/ - elementOffsetTop;
    const percentage = Math.round(distance / ((/*viewportHeight +*/ elementHeight - viewportHeight/**/) / 100)
    );
  
    // Restrict the range to between 0 and 100
    return Math.min(100, Math.max(0, percentage));
  };

  window.addEventListener('scroll', () => {

    console.log(percentageSeen());

    
    if (percentageSeen() > 0 && percentageSeen() < 99 ) {
      
      divAnimation.seek((percentageSeen()/100) * divAnimation.duration  );
    }


  },{passive: true});