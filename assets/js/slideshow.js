import  Flickity from 'flickity';

  
  //console.log('slideshow', slideshow)
/*
  const slideshow = document.getElementById('slideshow');

    if(slideshow) {
     
       //const slider = 
       new Flickity( slideshow, {
            wrapAround: true,
            freeScroll: true,
            //adaptiveHeight: false,
            autoPlay: 2500,
            pauseAutoPlayOnHover: false,
            prevNextButtons: false,
            pageDots: false,
            cellAlign: 'left',
            on: {
                ready: function() {
                    console.log('Flickity ready');
                    window.dispatchEvent(new Event('resize'));
                },
            }, 
        });
    }
*/

// Play with this value to change the speed
let tickerSpeed = 2;

let flickity = null;
let isPaused = false;
const slideshowEl = document.getElementById('slideshow');


//
//   Functions
//
//////////////////////////////////////////////////////////////////////

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


//
//   Create Flickity
//
//////////////////////////////////////////////////////////////////////

flickity = new Flickity(slideshowEl, {
  autoPlay: false,
  prevNextButtons: false,
  pageDots: false,
  draggable: true,
  wrapAround: true,
  selectedAttraction: 0.015,
  friction: 0.25,
});
flickity.x = 0;


//
//   Add Event Listeners
//
//////////////////////////////////////////////////////////////////////

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