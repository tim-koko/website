
// check if touch device
const isTouch = () => {
  return ( 'ontouchstart' in window ) ||
        ( navigator.maxTouchPoints > 0 ) ||
        ( navigator.msMaxTouchPoints > 0 );
};

const getScrollPercent = () => {
  var h = document.documentElement, 
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';
  return (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
}

// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const calcWinsize = () => {
    return {width: window.innerWidth, height: window.innerHeight};
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Gets the mouse position
const getMousePos = (e) => {
  let posx = 0;
  let posy = 0;
  if (!e) e = window.event;

  if (e.clientX || e.clientY)    {
    posx = e.clientX;
    posy = e.clientY;
  }
  /* relative to whole page : 
  if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
      console.log(posy)
  }
  else if (e.clientX || e.clientY)    {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  */
  
  return { x : posx, y : posy }
};

export { map, lerp, calcWinsize, getRandomNumber, getMousePos, isTouch, getScrollPercent };
