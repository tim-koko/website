
import anime from 'animejs';
import {  getScrollPercent } from './utils';

const btnTop = document.querySelector('.btn-up');

btnTop.addEventListener('click', () => {
  
  const scrollElement = window.document.scrollingElement || window.document.body || window.document.documentElement;
  //var destination = $(location.hash).offset().top - $('.main').offset().top;
  anime({
    targets: scrollElement,
    scrollTop: 0,
    duration: 666,
    easing: 'easeInOutExpo',
  });

});

window.addEventListener('scroll', () => {
  getScrollPercent() >= 70 ? btnTop.classList.add('show') : btnTop.classList.remove('show');
  getScrollPercent() >= 98 ? btnTop.classList.add('bottom') : btnTop.classList.remove('bottom');
});