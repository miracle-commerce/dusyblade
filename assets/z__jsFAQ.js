/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsFAQ = {
  init() {
    const $faqHeading = $('.faq-accordion > dt > button');

    $('.faq-accordion > dd').attr('aria-hidden', true);

    $faqHeading.attr('aria-expanded', false);

    $faqHeading.off('click activate').on('click activate', function () {
      const faqIcons = $(this).find('.icon');

      const state = $(this).attr('aria-expanded') === 'false';
      $(this).attr('aria-expanded', state);
      $(this).parent().next().slideToggle(() => {
        if (faqIcons.hasClass('icon--active')) {
          faqIcons.toggleClass('icon--active');
        }
      });
      $(this).parent().next().attr('aria-hidden', !state);
      return false;
    });

    $faqHeading.on('keydown', function (event) {
      const keyCode = event.keyCode || event.which;
      if (keyCode === 13) {
        $(this).trigger('activate');
      }
    });
  },
  unload() {
    $('.faq-accordion > dt > button').off('click activate');
    $('.faq-accordion > dt > button').off('keydown');
  },
};

/******/ })()
;