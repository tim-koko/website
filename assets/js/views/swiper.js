import Swiper from 'swiper';
import {  Autoplay /*Navigation, Pagination, EffectFade*/ } from 'swiper/modules'; //Controller,


console.log('swiper loaded');

export default function(){


    const swiperMedia = document.querySelectorAll('.swiper-logos');


    if (swiperMedia) {
      console.log(swiperMedia);

      swiperMedia.forEach(media => {

        //const swiperM = 
        new Swiper(media, {
          modules: [Autoplay],
          speed: media.dataset.autoplay !== 'false' ? 8000 : 300,
          //freeMode: true,
          grabCursor: false,
        allowTouchMove: false,
        loop: true,
        //longSwipesRatio: 0.1,
        autoplay: media.dataset.autoplay !== 'false' ? {
          delay: 0,
          pauseOnMouseEnter: false,
          disableOnInteraction: false,
        } : false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        breakpoints: {
          768: {
            spaceBetween: 0,
          },
   
        },
        on: { init: function () {
          media.classList.add('loaded');
          console.log('swiper initialized');
        },

      },
      }); 

  
   
/*
      media.addEventListener('pointerenter', function() {
        media.classList.remove('autoplay');
         swiperM.autoplay.stop();
        swiperM.params.autoplay = false;
        swiperM.params.speed = 300;
        //stopAutoplay();
      });
*/

/*
      media.addEventListener('mouseleave', function() {
        const distance = swiperM.width * swiperM.activeIndex + swiperM.getTranslate();

        // Avoid distance that is exactly 0
        duration = distance !== 0 ? duration : 0;
        swiperM.slideTo(swiperM.activeIndex, duration);
        startAutoplay();
      }
    );
    */

    });
    }



    const swiperGallery = document.querySelector('.swiper-gallery');
    if (swiperGallery) {

    //const swiperM = 
    new Swiper(swiperGallery, {
      modules: [Autoplay ],
        speed: 6000,
        direction: 'horizontal',
        grabCursor: false,
        shortSwipes: false,
        longSwipes: true,
        loop: true,
        //pauseOnMouseEnter: true,
        //dragable: false,
        allowTouchMove: false,
        autoplay: 
        {
          delay: 0,
          pauseOnMouseEnter: false,
        },
        slidesPerView: 'auto',
        //freeMode: true,
        spaceBetween: 20,

        breakpoints: {
          768: {
            spaceBetween: 40,
          },
   
        },
      }); 
/*
      swiperMedia.addEventListener('mouseenter', function() {
        swiperM.autoplay.stop();
       // swiperM.autoplay.pause();
        swiperM.speed = 0;
        //swiperM.autoplay.delay = 0;
      });
      swiperMedia.addEventListener('mouseleave', function() {
        swiperM.autoplay.start();
       // swiperM.autoplay.resume();
        swiperM.speed = 8000;
        //swiperM.autoplay.delay = 0.1;
      });
    */

    }
/*
  const headerSwiper = document.querySelector('.header-swiper');
  const noTouch = document.getElementById('app').classList.contains('no-touch');

  if (headerSwiper) {

    //Shuffle Images
    let list = headerSwiper.querySelector('.swiper-wrapper');
    for (let i = 0; i <= list.children.length; i++) {      
      list.appendChild(list.children[Math.random() * i | 0]);
    } 

    
 
     // init Swiper:
     const mainSwiper = new Swiper(headerSwiper, {
      // configure Swiper to use modules
      modules: [Autoplay, EffectFade],
			effect: 'fade',
			fadeEffect: {
				crossFade: true
			}, 
			autoplay: {
				delay: 3500,
				disableOnInteraction: false,
			},
      slidesPerView: 1,
      autoHeight: true,
      loop: true,
			speed: 1000,

    });

  }

  const swipers = document.querySelectorAll('.swiper:not(.header-swiper)');

  if (swipers) {
    swipers.forEach( (swiper) => {

    
      // init Swiper:
      const aSwiper = new Swiper(swiper, {
        // configure Swiper to use modules
        modules: [Navigation, Pagination, Autoplay, Controller],
        //slidesPerView: swiper.dataset.slidesperview ? swiper.dataset.slidesperview : 1,
        //spaceBetween: 5,
        autoHeight: true,
        loop: true,
        speed: noTouch ? 666 : 333,
        autoplay: swiper.dataset.autoplay ? { delay: 2000 }  : false,
        //shortSwipes: (swiper.dataset.clickable !== 'false' && !touch) ? false : true,
        //longSwipes: false,
        longSwipesRatio : 0.2,

        controller: {
          control: swiper.dataset.control ? swiper.dataset.control : false,

        },
        breakpoints: {
          // when window width is >= 768px
          768: {
            slidesPerView: swiper.dataset.slidesperview ? swiper.dataset.slidesperview : 1,
            //spaceBetween: 20
          },
        },

        navigation: swiper.querySelector('.swiper-button-next')  ? {
          nextEl: swiper.querySelector('.swiper-button-next'),
          prevEl: swiper.querySelector('.swiper-button-prev'),
        } : false,
        pagination: swiper.dataset.pagination !== 'false' ? {
          el: swiper.querySelector('.swiper-pagination'),
          type: 'bullets',
          clickable: true,
        } : false,
 
      });

      if (swiper.dataset.clickable !== 'false' && noTouch) {
        swiper.classList.add('clickable');
        aSwiper.on('click', function() {
          aSwiper.slideNext();
        });
      }
      
      if (swiper.dataset.control  ) {
       // console.log(swiper.swiper);
        swiper.swiper.controller.control =  document.querySelector(swiper.dataset.control).swiper;

      }



    });


  }

 */




}

 