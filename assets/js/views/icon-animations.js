import { animate, createDrawable, stagger } from 'animejs';
import ScrollOut from 'scroll-out';

export default function() {

  const icons = document.querySelectorAll('.icon-draw');

  if (icons.length === 0) {
    return;
  }

  // Create the drawables only once per icon. createDrawable() remembers the
  // path's original stroke-linecap when it is created and temporarily sets it
  // to "butt" while a path is hidden. Calling it a second time would pick up
  // that "butt" as the original and the round line ends would never return.
  const drawables = new Map();

  icons.forEach((icon) => {
    const paths = icon.querySelectorAll('svg path');

    if (paths.length === 0) {
      return;
    }

    const drawable = createDrawable(paths);

    // hide all paths until the icon scrolls into view
    animate(drawable, {
      draw: 0,
      duration: 0,
    });

    drawables.set(icon, drawable);
  });

  ScrollOut({
    targets: '.icon-draw',
    once: true,
    onShown: function(el) {
      const drawable = drawables.get(el);

      if (!drawable) {
        return;
      }

      animate(drawable, {
        draw: '0 1',
        ease: 'outSine',
        duration: 400,
        delay: stagger(250),
      });
    },
  });

}
