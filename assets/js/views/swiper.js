import Swiper from 'swiper';
import {  Autoplay, Navigation} from 'swiper/modules';  

//console.log('swiper loaded');

export default function(){

    const swiperMedia = document.querySelectorAll('.swiper-logos');

    if (swiperMedia) {
      console.log(swiperMedia);

      swiperMedia.forEach(media => {

        new Swiper(media, {
          modules: [Autoplay],
          speed: media.dataset.autoplay !== 'false' ? 8000 : 300,
          grabCursor: false,
        allowTouchMove: false,
        loop: true,
        autoplay: media.dataset.autoplay !== 'false' ? {
          delay: 0,
          pauseOnMouseEnter: false,
          disableOnInteraction: false,
        } : false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        /*
        on: { init: function () {
          media.classList.add('loaded');
          console.log('swiper initialized');
        },
      },
      */
      }); 

    });
    }

   const slides = document.querySelectorAll('.slides');
    if (slides) {
      slides.forEach(slide => {
        new Swiper(slide.querySelector('.swiper'), {
          modules: [Navigation ],
          navigation: {
            nextEl: slide.querySelector('.swiper-button-next'),
            prevEl: slide.querySelector('.swiper-button-prev'),
          },
          slidesPerView: 1,
          spaceBetween: 0,
          loop: true,
 
        }); 
        
        const carouselCaption = slide.querySelector('.c-caption');

        slide.querySelector('.swiper').swiper.on( 'slideChange', function() {
          setTimeout( () => {
            carouselCaption.textContent = slide.querySelector('.swiper-slide-active .caption').textContent ? slide.querySelector('.swiper-slide-active .caption').textContent : /*slide.querySelector('.swiper-slide:first-child .caption').textContent*/ '';
          }, 100);
        });
        
      });
    } 


}

 