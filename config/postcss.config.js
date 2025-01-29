const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const whitelister = require('purgecss-whitelister');

module.exports = {
  plugins: [
    autoprefixer(),
    purgecss({
      content: [
        './layouts/**/*.html',
        './content/**/*.md',
      ],
      safelist: [
        'body',
        'lazyloaded',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'h3',
        'alert-link',
        'flickity-slider',
        'active',
        'flickity-enabled',
        'flickity-lazyloaded',
        'is-draggable',
        'flickity-viewport',
        'menu-open',
        'top',
        'bottom',
        'headroom-not-top',
        'headroom-top',
        'windows',
        'touch',
        'btn',
        'btn-primary',
        'jobs',
        'page-item',
        'page-link',
        ...whitelister([
          './assets/scss/components/_alerts.scss',
          // './assets/scss/components/_buttons.scss',
          './assets/scss/components/_code.scss',
          // './assets/scss/components/_syntax.scss',
        ]),
      ],
    }),
  ],
}
