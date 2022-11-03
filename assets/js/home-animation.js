
import { map, lerp, getMousePos, calcWinsize, getRandomNumber, isTouch } from './utils';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the mouse position
let mousepos = {x: winsize.width/2, y: winsize.height/2};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));



  function move(obj) {
    // amount to move in each axis
    let translationVals = {tx: 0, ty: 0};
    // get random start and end movement boundaries
    const xstart = getRandomNumber(-10,20);
    const ystart = getRandomNumber(-10,20);
   
    // infinite loop
    const render = () => {
        // Calculate the amount to move.
        // Using linear interpolation to smooth things out.
        // Translation values will be in the range of [-start, start] for a cursor movement from 0 to the window's width/height
        translationVals.tx = lerp(translationVals.tx, map(mousepos.x, 0, winsize.width, -xstart, xstart), 0.07);
        translationVals.ty = lerp(translationVals.ty, map(mousepos.y, 0, winsize.height, -ystart, ystart), 0.07);
       
       // gsap.set(this.DOM.el, {x: translationVals.tx, y: translationVals.ty});  
       obj.style.transform = 'translate('+ ( translationVals.tx) + 'px,'+  (translationVals.ty) + 'px)';
       //console.log( getMousePos.x)
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


if (!isTouch()) {
  const els = document.querySelectorAll('.floater');
  els.forEach(item => move(item));
}
