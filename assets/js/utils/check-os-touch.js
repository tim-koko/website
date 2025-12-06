
export default function() {

function is_touch_enabled() {
  return ( 'ontouchstart' in window ) ||
         ( navigator.maxTouchPoints > 0 ) ||
         ( navigator.msMaxTouchPoints > 0 );
}

const body = document.querySelector('body');

if (navigator.appVersion.indexOf('Win') != -1) body.classList.add('windows');

if (is_touch_enabled()) body.classList.add('touch');

}