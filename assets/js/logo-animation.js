import '@dotlottie/player-component';
import { create } from '@lottiefiles/lottie-interactivity';
 


const logo = document.querySelector('#logoLottie');
if(logo) {
  //setTimeout( () => {

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
  //}, 100);
  });
}