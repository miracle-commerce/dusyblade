/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsAccounts = {
  init() {
    $('.js-recover-password').on('click', () => {
      $('#login').hide();
      $('#recover-password').show();
    });

    $('.cancel-recover-password').on('click', () => {
      $('#recover-password').hide();
      $('#login, #customer_login').show();
    });
  },

  unload() {
    $('.js-recover-password').off();
    $('.cancel-recover-password').off();
  },
};

/******/ })()
;