import { DotLottie } from '@lottiefiles/dotlottie-web';

const logoContainer = document.querySelector('.logo');
const logocanvas = document.querySelector('#logolottie');

const src = '/timkoko.lottie';

if(logocanvas) {
  logoContainer.classList.add('show');

  const logoAnimation = new DotLottie({
    canvas: logocanvas,
    src,
    loop: false,
    autoplay: true,
     layout: {
      fit : 'cover',
      align: [0.5,0.5],
    },
  });

  // show fallback svg:
  logoAnimation.addEventListener('loadError', () => {
    document.querySelector('.logo-alt').classList.remove('d-none');
    logocanvas.classList.add('d-none');
  });
  
  logoAnimation.addEventListener('error', () => {
    document.querySelector('.logo-alt').classList.remove('d-none');
    logocanvas.classList.add('d-none');
  });

  // play again on mouseover:
  logocanvas.addEventListener('mouseover', () => {
    logoAnimation.play();
  });
 

  console.log(logoAnimation)

 
}