import  Flickity from 'flickity';
import anime from 'animejs';
  


const slideshow = document.querySelector('.clients');

if(slideshow) {
  
  const flkty =  new Flickity(slideshow, {
        wrapAround: true,
        pageDots: false,
        draggable: false, //isTouch(),
        prevNextButtons: false,
        cellAlign: 'left',
        on: {
            ready: function() {
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




const element = document.querySelector('.slideshow-container');
const slider = document.querySelector('.slideshow-container .slider');
const containerFluid = document.querySelector('.container-fluid');

if (!document.body.classList.contains('touch')) {
  
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
      //console.log(percentageSeen());
      if (percentageSeen() > 0 && percentageSeen() < 99 ) {
        divAnimation.seek((percentageSeen()/100) * divAnimation.duration  );
      }
    },{passive: true});

} else {

  if(slider) {
  
    new Flickity(slider, {
          //wrapAround: true,
          pageDots: false,
          //draggable: false, //isTouch(),
          prevNextButtons: false,
          cellAlign: 'left',
          on: {
              ready: function() {
                  window.dispatchEvent(new Event('resize'));
              },
          }, 
      });
  /*
    // previous
    var previousButton = document.querySelector('.button-previous');
    previousButton.addEventListener( 'click', function() {
      flkty.previous();
    });
    // next
    var nextButton = document.querySelector('.button-next');
    nextButton.addEventListener( 'click', function() {
      flkty.next();
    });*/
  }
}