import '@dotlottie/player-component';
//import '@lottiefiles/lottie-player'
import { create } from '@lottiefiles/lottie-interactivity';
 
const logoContainer = document.querySelector('.logo');
const logo = document.querySelector('#logoLottie');

if(logo) {
    logoContainer.classList.add('show');
    logo.setAttribute('loop', 'false');


    logo.addEventListener('complete', () => {
      create({
        player: logo.getLottie(),
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