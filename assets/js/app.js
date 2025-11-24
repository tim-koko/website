/* eslint-disable no-undef */
// app.js for concatenation of smaller libraryies
// to reduce http requests of small files
'use strict';


import Swup from 'swup';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
//import SwupDebugPlugin from '@swup/debug-plugin';

import starterScripts from './assets/js/views/starter-scripts';
import onEveryPage from './assets/js/views/on-every-page';

// Include parts of Bootstrap

/* eslint-disable no-unused-vars */
import {
  //Alert,
  Button,
  //Carousel,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  //Popover,
  //ScrollSpy,
  //Tab,
  //Toast,
  //Tooltip
} from 'bootstrap';

const swup = new Swup({
  containers: ['#main', '#main-menu' , '.language-menu' ],
  ignoreVisit: (url, { el } = {}) => el.closest('.language-menu') ,
  plugins: [
    new SwupBodyClassPlugin(),
    new SwupHeadPlugin({ persistAssets: true }),
  ],
});

swup.hooks.on('page:view', (visit) => {
  //console.log('New page loaded:', visit.to.url);
  onEveryPage();
});


  starterScripts();
  onEveryPage();

