import  Flickity from 'flickity';

  
  console.log('slideshow', slideshow)

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

