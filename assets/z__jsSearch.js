/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsSearch = {
  init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsSearch = $.extend(this, window.PXUTheme.getSectionData($section));

    // If breadcrumbs enabled and basic pagination is set, call breadcrumbs object
    if (this.enable_breadcrumb && this.pagination_type == 'basic_pagination') {
      window.PXUTheme.breadcrumbs.init(this.number_of_pages);
    }
  },
  unload: function($target) {
    window.PXUTheme.breadcrumbs.unload();
  }
}


/******/ })()
;