/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsFeaturedCollection = {
  init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsFeaturedCollection = $.extend(this, window.PXUTheme.getSectionData($section));

    if(this.enable_masonry_layout && !this.align_height && this.collection_style == 'grid') {
      window.PXUTheme.applyMasonry();
    }

    if(this.collection_style == 'slider') {
      this.createSlider();
    }


  },
  createSlider: function() {

    let featuredCollectionSlider = $('.featured-collection.layout--slider .slider-gallery');

    const slideData = {
      products_per_slide: this.products_per,
      products_available: this.products_available,
      products_limit: this.products_limit,
      cellAlign: "left",
      wrapAround: true
    }

    $(featuredCollectionSlider).flickity({
      lazyLoad: 2,
      freeScroll: true,
      imagesLoaded: true,
      draggable: true,
      cellAlign: 'center',
      wrapAround: slideData.wrapAround,
      pageDots: false,
      contain: true,
      prevNextButtons: slideData.products_limit > slideData.products_per_slide ? true : false,
      initialIndex: 0,
      arrowShape: arrowShape,
      on: {
        ready: function() {
          // Resize flickity when the slider is settled
          $(featuredCollectionSlider).on( 'settle.flickity', function() {
            $(featuredCollectionSlider).flickity('resize')
          });
        }
      }
    });

  },
  unload: function($section) {
    let $slider = $section.find('.flickity-enabled');
    $slider.flickity('destroy');
  }
}

/******/ })()
;