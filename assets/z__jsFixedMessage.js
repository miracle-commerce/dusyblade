/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsFixedMessage = {
  init: function ($section) {

    this.$el = $('.fixed-message-section');
    let fixedMessageCookie = Cookies.get('fixed-message');

    if (fixedMessageCookie !== 'dismiss') {
      this.$el.removeClass('is-hidden');

      // Attach event to hide fixed message if button is clicked
      $('.js-close-fixed-message').on('click', () => {
        this.hide();
      });

    }

  },
  hide: function () {
    this.$el.addClass('is-hidden');
    // Remove fixed message and set cookie to hide it for 30 days
    Cookies.set('fixed-message', 'dismiss', { expires: 30 });
  },
  unload: function ($section) {

    // Clear event listeners in theme editor
    $('.js-close-fixed-message').off();
  }
}

/******/ })()
;