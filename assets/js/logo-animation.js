import '@dotlottie/player-component';
//import '@lottiefiles/lottie-player'
import { create } from '@lottiefiles/lottie-interactivity';
 
const logo = document.querySelector('#logoLottie');

if(logo) {

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