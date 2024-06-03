//import '@dotlottie/player-component';
//import '@lottiefiles/lottie-player'
//import { DotLottie } from '@lottiefiles/dotlottie-web';
import { DotLottie } from '@lottiefiles/dotlottie-web';
//import { DotLottie } from 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm';

import { create } from '@lottiefiles/lottie-interactivity';
 
setTimeout(() => {

const logoContainer = document.querySelector('.logo');
const logocanvas = document.querySelector('#logolottie');

const src = '/timkoko.lottie';
//const src = "https://lottie.host/9ac9c440-c19e-4ac9-b60e-869b6d0ef8cb/7h97gYMCNE.lottie";


console.log(logocanvas);

if(logocanvas) {
  logoContainer.classList.add('show');

  const logoAnimation = new DotLottie({
    logocanvas,
    src,
    loop: false,
    autoplay: true,
  });



  logoAnimation.addEventListener('loadError', () => {
    document.querySelector('.logo-alt').classList.remove('d-none');
  });

  logoAnimation.addEventListener('error', () => {
    document.querySelector('.logo-alt').classList.remove('d-none');
  });

  logoAnimation.addEventListener('complete', () => {
    create({
      player: logoAnimation.getLottie(),
      mode: 'cursor',
      actions: [
        {
          type: 'hover',
          forceFlag: false,
        },
      ],
    });
  });

}
 

}, 500);
