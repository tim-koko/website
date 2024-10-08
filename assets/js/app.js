// app.js for concatenation of smaller libraryies
// to reduce http requests of small files
'use strict';

// Prefetch in-viewport links during idle time
//import { listen } from 'quicklink/dist/quicklink.mjs';
//listen();

// detect Windows and touch devices
import './assets/js/check-os-touch';

// lazy sizes for image loading
import 'lazysizes';

// global alert
import './assets/js/alert';

// home 3D animation
import './assets/js/home-animation';

// fade in elements
import './assets/js/scroll-out';

// icons animations
import './assets/js/icon-animations';

// slideshow
import './assets/js/slideshow';

// mobile-menu
import './assets/js/mobile-menu';

import './assets/js/scroll-top';

// logo animation
import './assets/js/logo-animation';

// form netlify submission 
import './assets/js/form-netlify';
