/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsCustomContactForm = {
  init: function () {

  // Selectors
  const $contactForm = $('.contact-form__form');

  // Contact form checkbox validation
  if ($('[data-is-required]').length){
    var $checkboxGroup = $('.contact-form__list .checkbox');
    $checkboxGroup.prop('required', true);

    $('.contact-form__list .checkbox').on('change', function(){
      $checkboxGroup.prop('required', true);
      if ($checkboxGroup.is(":checked")) {
        $checkboxGroup.prop('required', false);
      }
    })
  }

  $contactForm.on('submit', function(e) {

    const $form = $(this);
    const $formBlocks = $('.contact-form__blocks [data-checkbox-required]', $form);
    const $errorMessage = window.PXUTheme.translation.contact_form_checkbox_error;
    const $errorMessageContainer = $('.form__error', $form);

    let completeForm = true;

    for (let i = 0; i < $formBlocks.length; i++ ) {
      const $checkbox = $('input[type=checkbox]:checked', $formBlocks[i]);
      if ($checkbox.length) {
        completeForm = true;
      } else {
        $errorMessageContainer.html($errorMessage);
        completeForm = false;
      }
    }

    if (completeForm) {
      return;
    } else {
      event.preventDefault();
    }
  });
  },
  unload: function () {
    const $contactForm = $('.contact-form__form');
    const $submitButton = $contactForm.find(':submit');

    $submitButton.off();

  }
}

/******/ })()
;