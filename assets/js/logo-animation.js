import '@dotlottie/player-component';
import { create } from '@lottiefiles/lottie-interactivity';
 


const logo = document.querySelector('#logoLottie');
if(logo) {
  /*
  logo.addEventListener('ready', () => {
    logo.setLooping(false);
    logo.getLottie().setLooping(false);

  });
*/

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