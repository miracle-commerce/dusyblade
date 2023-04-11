/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsPopup = {
  init: function ($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsPopup = $.extend(this, window.PXUTheme.getSectionData($section));

    const cookieValue = Cookies.get('popup');
    const cookieEnabled = this.popup_days_to_hide != 0 ? true : false;

    if (cookieEnabled && cookieValue == 'opened') {
      return false;
    } else {
      setTimeout(() => {
        this.open();
      }, this.popup_delay * 1000);
    }

    if (cookieEnabled) {
      Cookies.set('popup', 'opened', { expires: parseInt(this.popup_days_to_hide) });
    }

  },
  open: function() {
    $.fancybox.open({
      src: '[data-popup]',
      type: 'inline',
      opts: {
        baseClass: 'popup-modal',
        hash: false,
        infobar: false,
        toolbar: false,
        smallBtn: false,
        touch: {
          vertical: false,
          momentum: false
        },
        beforeShow: () => {
          // Remove previous slides (fix for theme editor)
          $('.popup-modal .fancybox-slide').empty();
        },
        afterShow: () => {
          // After content is loaded, attach event listener for custom close icon
          $(document).on('touchstart click', '.popup__close', () => {
            this.close();
          });
        },
        beforeClose: () => {
          // Prevent duplicate triggers for close icon click
          $('.popup__close').off();
        }
      }
    });
  },
  close: function() {
    $.fancybox.close($('[data-popup]'));
  },
  showThemeEditorState() {
    $('.popup-section').addClass('is-fixed-top'); // Prevent scroll to bottom
    this.open();
  },
  hideThemeEditorState() {
    $('.popup-section').removeClass('is-fixed-top');
    this.close();
  },
  unload: function ($section) {
    $.fancybox.destroy();
    $('.popup-modal .fancybox-slide').empty();
    $('.popup__close').off();
  }
}

/******/ })()
;