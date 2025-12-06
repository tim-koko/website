
import { map, lerp, getMousePos, calcWinsize, getRandomNumber, isTouch } from 'js/utils/utils';


export default function() {

const els = document.querySelectorAll('.floater');
const imgs = document.querySelectorAll('.cloud-img');

if (els.length === 0 && imgs.length === 0) {
  return;
}

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


function moveParallax(el) {
  
  const speedX = el.getAttribute('data-speed-x');
  const speedY = el.getAttribute('data-speed-y');

    // infinite loop
    const render = () => {

      const x = (window.innerWidth - mousepos.x*speedX)/100;
      const y = (window.innerHeight - mousepos.y*speedY)/100;
      el.style.transform = `translateX(${-x}px) translateY(${-y}px)`;

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}




if (!isTouch())  {

  if (els.length > 0) {
    els.forEach(item => move(item));
  }
 
  if (imgs.length > 0) {
    imgs.item(0).setAttribute('data-speed-x', 10);
    imgs.item(0).setAttribute('data-speed-y', 7);
    imgs.item(1).setAttribute('data-speed-x', 14);
    imgs.item(1).setAttribute('data-speed-y', 8);
    imgs.item(2).setAttribute('data-speed-x', 3);
    imgs.item(2).setAttribute('data-speed-y', 5);
    imgs.item(3).setAttribute('data-speed-x', 12);
    imgs.item(3).setAttribute('data-speed-y', 12);
    imgs.item(4).setAttribute('data-speed-x', 7);
    imgs.item(4).setAttribute('data-speed-y', 6);
    imgs.item(5).setAttribute('data-speed-x', 10);
    imgs.item(5).setAttribute('data-speed-y', 10);
    
    imgs.forEach(item => moveParallax(item));
  }
}
}