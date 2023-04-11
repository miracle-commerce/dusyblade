/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsSlideshowClassic = {
	init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsSlideshowClassic = $.extend(this, window.PXUTheme.getSectionData($section));

    // Selectors
    const $slideshowClassicEl = $section.find('[data-slideshow-classic]').removeClass('is-hidden');

    const $slideshowClassic = $slideshowClassicEl.flickity({
      wrapAround: true,
      adaptiveHeight: true,
      prevNextButtons: this.number_of_slides > 1 ? this.show_arrows : false,
      pageDots: this.number_of_slides > 1 ? this.show_nav_buttons : false,
      draggable: true,
      imagesLoaded: true,
      fade: this.image_transition == 'fade' ? true : false,
      autoPlay: this.image_slideshow_speed * 1000,
      arrowShape: arrowShape
    });

    // Resize flickity when the slider is settled
    $slideshowClassicEl.on( 'settle.flickity', function() {
      $slideshowClassicEl.flickity('resize');
    })

  },
  blockSelect: function($section, blockId) {
    const $slider = $section.find('[data-image-slideshow]');
    const $sliderIndex = $('#shopify-section-' + blockId).data('slide-index');

    $slider.flickity('select', $sliderIndex, true, true);

  },
	unload: function($section) {

	}
}

/******/ })()
;