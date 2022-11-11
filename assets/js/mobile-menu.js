const myOffCanvas = document.getElementById('offcanvasMenu');
const body = document.querySelector('body');

myOffCanvas.addEventListener('show.bs.offcanvas', () => body.classList.add('menu-open') );
myOffCanvas.addEventListener('hide.bs.offcanvas', () => body.classList.remove('menu-open') );