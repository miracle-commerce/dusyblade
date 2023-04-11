/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsGallery = {
  init: function($section) {
    // Add settings from schema to current object
    window.PXUTheme.jsGallery = $.extend(this, window.PXUTheme.getSectionData($section));

    let gutterSize = 0;
    if(this.show_gutter == true) {
      gutterSize = 20
    }

    if(this.gallery_type == 'masonry') {
      window.PXUTheme.applyMasonry('.gallery__item', gutterSize);
    } else if(this.gallery_type == 'horizontal-masonry') {
      window.PXUTheme.applyHorizontalMasonry();
    }
  },
  unload: function($section) {

  }
}

/******/ })()
;