/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsSlideshowWithText = {
	init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsSlideshowWithText = $.extend(this, window.PXUTheme.getSectionData($section));

    const textTransition = this.text_transition;

    // Selectors
    const $imageSlideshowEl = $section.find('[data-image-slideshow]').removeClass('is-hidden');
    const $textSlideshowEl = $section.find('[data-text-slideshow]').removeClass('is-hidden');

    const $imageSlideshow = $imageSlideshowEl.flickity({
      contain: true,
      wrapAround: true,
      adaptiveHeight: true,
      prevNextButtons: this.number_of_slides > 1 ? this.show_arrows : false,
      pageDots: false,
      draggable: true,
      imagesLoaded: true,
      fade: this.image_transition == 'fade' ? true : false,
      autoPlay: this.image_slideshow_speed * 1000,
      arrowShape: arrowShape
    });

    const $textSlideshow = $textSlideshowEl.flickity({
      autoplay: false,
      contain: true,
      imagesLoaded: true,
      lazyload: 4,
      prevNextButtons: false,
      pageDots: this.number_of_slides > 1 ? this.show_nav_buttons : false,
      draggable: false,
      on: {
        ready: function () {
          const $currentTextSlide = $textSlideshowEl.find('.is-selected .text-slideshow__content');
          window.PXUTheme.animation.slideTransition($currentTextSlide, textTransition);
        }
      }
    });

    $imageSlideshow.on('change.flickity', function (event, index) {
      $textSlideshow.flickity('select', index, true, true);

      const $currentTextSlide = $textSlideshowEl.find('.is-selected .text-slideshow__content');
      window.PXUTheme.animation.slideTransition($currentTextSlide, textTransition);

    });

    $textSlideshow.on('change.flickity', function (event, index) {
      $imageSlideshow.flickity('select', index, true, false);
    });

    $section.find('.flickity-button').wrapAll('<div class="flickity-buttons-container"></div>');


  },
  blockSelect: function($section, blockId) {
    const $slider = $section.find('[data-image-slideshow]');
    const $sliderIndex = $('#shopify-section-' + blockId).data('slide-index');

    $slider.flickity('select', $sliderIndex, true, true);

    // Resize flickity when the slider is settled
    $slider.on( 'settle.flickity', function() {
      $slider.flickity('resize');
    }, 500);

  },
	unload: function($section) {
    $section.find('.flickity-button').unwrap();
	}
}

/******/ })()
;