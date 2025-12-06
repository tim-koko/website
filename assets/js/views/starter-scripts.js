import Headroom from 'headroom.js'; 
import scrollTop from 'js/utils/scroll-top';
import logoAnimation from 'js/views/logo-animation';
import checkOSTouch from 'js/utils/check-os-touch';

export default function() {

  checkOSTouch();
  scrollTop();
  logoAnimation();

    /* Headroom */
   var myElement = document.querySelector('.banner');
    var headroom  = new Headroom(myElement, {tolerance : 5, offset : 10});
    headroom.init();
   

    /* Mobile Menu */
   const myOffCanvas = document.getElementById('offcanvasMenu');
    const body = document.querySelector('body');

    myOffCanvas.addEventListener('show.bs.offcanvas', () => body.classList.add('menu-open') );
    myOffCanvas.addEventListener('hide.bs.offcanvas', () => body.classList.remove('menu-open') );


}