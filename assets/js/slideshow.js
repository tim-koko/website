import  Flickity from 'flickity';
import anime from 'animejs';
  


const articleSlideshows = document.querySelectorAll('.entry-content .slides');

if (articleSlideshows) {
		


  articleSlideshows.forEach((el) => {

 

    var flkty = new Flickity(el.querySelector('.carousel'), {  
      lazyLoad: 2,
      prevNextButtons: false,
      pageDots: false,
    //	autoPlay: $this.hasClass('auto-play') ? 3000 : false,
      wrapAround: true ,
      cellAlign: 'left',
      adaptiveHeight: true,
    });
    
    /*
    flkty.on( 'staticClick', function(  ) {
      flkty.selectedIndex == flkty.cells.length - 1  ? flkty.select( 0 ) : flkty.next();

    });
*/
    //var carouselStatus = $this.find('.carousel-status')[0];
    var carouselCaption = el.querySelector('.c-caption');
    
    flkty.on( 'select', function() {
      //var slideNumber = flkty.selectedIndex + 1;
      //carouselStatus.textContent = slideNumber + '/' + flkty.slides.length;
      carouselCaption.textContent = el.querySelector('.is-selected .caption').textContent ? el.querySelector('.is-selected .caption').textContent : el.querySelector('.carousel-cell:first-child .caption').textContent;
    });

    el.querySelector('.button-previous').addEventListener( 'click', function() {
      flkty.previous();
    });
    // next
    el.querySelector('.button-next').addEventListener( 'click', function() {
      flkty.next();
    });
    

  });
}



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

if(element) {

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

}