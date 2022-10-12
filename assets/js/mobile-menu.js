import { Offcanvas } from 'bootstrap'

const offCanvasId = 'offcanvasMenu';
const myOffCanvas = document.getElementById(offCanvasId);
const menulinks = document.querySelector('.offcanvas-body');
const body = document.querySelector('body');

function offCanvasListener() {
  const hideCanvas = () => {
    console.log('click')
    let openedCanvas = Offcanvas.getInstance(myOffCanvas);
    openedCanvas.hide();
    menulinks.removeEventListener('click', hideCanvas);
    body.classList.remove('menu-open');
  }
  const listenToClick = () => {
    body.classList.add('menu-open');
    menulinks.addEventListener('click', hideCanvas);
  }
  
  myOffCanvas.addEventListener('show.bs.offcanvas', listenToClick);
}

//function call
offCanvasListener('offcanvasExample');
