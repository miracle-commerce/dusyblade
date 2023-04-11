/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsTestimonials = {
	init: function($section) {
    const $testimonialSlider = $section.find('[data-testimonial-slider]');

    $testimonialSlider.flickity({
      wrapAround: true,
      initialIndex: 1,
      prevNextButtons: false,
      pageDots: false,
      watchCSS: true
    });

    // Resize flickity when the slider is settled
    $testimonialSlider.on('settle.flickity', function() {
      $testimonialSlider.flickity('resize');
    });

    $section.on('click', '.testimonial__nav--prev', function () {
      $testimonialSlider.flickity('previous');
    });

    $section.on('click', '.testimonial__nav--next', function () {
      $testimonialSlider.flickity('next');
    });
  },
  blockSelect: function($section, blockId) {
    const $testimonialSlider = $section.find('[data-testimonial-slider]');

    const slideIndex = $('#shopify-section-' + blockId).data('testimonial-index');

    $testimonialSlider.flickity('select', slideIndex);
  },
	unload: function($section) {
    const $slider = $section.find('.flickity-enabled');
    $slider.flickity('destroy');
    $('.testimonial__nav--prev').off();
    $('.testimonial__nav--next').off();
	}
}

/******/ })()
;