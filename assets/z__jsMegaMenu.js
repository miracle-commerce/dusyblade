/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsMegaMenu = {
  init: function($section) {
    // Add settings from schema to current object
    window.PXUTheme.jsMegaMenu = $.extend(this, window.PXUTheme.getSectionData($section));

    // Selectors
    const parentLink = this.parent_link;
    const sectionId = this.section_id;
    const $megaMenu = $section.find('.mega-menu__' + sectionId);
    const $parentElement = $('.header__menu [data-navlink-handle="' + parentLink + '"], .sticky-header__menu [data-navlink-handle="' + parentLink + '"]');
    const $parentElementLink = $parentElement.find('.header__link');
    // Remove old mega menus
    $parentElement.find('.mega-menu__section').remove();

    // Mobile Selectors
    const $parentMobileElement = $(`[data-mobile-menu-navlink-handle="${parentLink}"]`);

    /* No submenu is present - add mega menu elements and caret */
    if ($parentMobileElement.find('.has-no-submenu').length) {

      // Assign class to display dropdown arrow
      $parentMobileElement.find('a.mobile-menu__item').addClass('mobile-menu-link');

      // Insert close icon after menu item
      $parentMobileElement.find('a').after('<span class="close-dropdown" aria-expanded="false"></span>');

      // Insert placeholder ul for megamenu
      $parentMobileElement.find('.submenu__label').after('<ul class="mobile-submenu__list mobile-menu__submenu has-mega-menu" data-mobile-submenu-first-level-list></ul>')

      // Find data attribute for toggle and assign it true
      let $mobileMenuToggle = $parentMobileElement.find('[data-mobile-menu-has-toggle]');
      $($mobileMenuToggle).attr('data-mobile-menu-has-toggle', true);


      // Insert mega menu
      let $parentList = $parentMobileElement.find('.has-mega-menu');
      $megaMenu.clone().appendTo($parentList);

    } else {
      /* Submenu is present - add mega menu elements and remove current sub-menu */
      let $parentList = $parentMobileElement.find('[data-mobile-submenu-first-level-list]');

      $parentList
        .empty()
        .addClass('has-mega-menu')
        .removeClass('has-dropdown');

      // Insert mega menu
      $megaMenu.clone().appendTo($parentList);
    }


    // Desktop
    if ($parentElement.hasClass('header__item') || $parentElement.hasClass('vertical-header__first-level')) {
      // Hide default dropdown
      $parentElement.find('.navbar-dropdown').addClass('is-invisible is-hidden');

      // Add arrow to parent link to indicate dropdown
      $parentElementLink.removeClass('is-arrowless');

      $megaMenu.clone().appendTo('.vertical-header__first-level[data-navlink-handle="' + parentLink + '"], .header__item[data-navlink-handle="' + parentLink + '"]');

      // Add/remove classes for proper styling and append mega menu instance
      $parentElement.addClass('has-mega-menu')
    }

    // Determine if header is set to hover to open or click to open
    if ($('.dropdown-click--false').length > 0) {
      $('.navbar-item, .header__brand, .header__search').on('mouseover', function(){

        //Close any mega menus on hover
        $('.mega-menu__section').removeClass('is-active');

        if($(this).hasClass('has-mega-menu')) {

          //Toggle corresponding mega menu
          $(this).find('.mega-menu__section').addClass('is-active');
        }
      })

      $('.mega-menu__section, .navbar').on('mouseleave', function(){

        //Hide mega menu upon leaving mega menu, logo or navbar
        $('.mega-menu__section').removeClass('is-active');
      })
    } else {
      $('.navbar-item, .header__brand, .header__search').on('click touchstart', function(){

        //Close any mega menus on click
        $('.mega-menu__section').removeClass('is-active');

        if($(this).hasClass('has-mega-menu')) {

          //Toggle corresponding mega menu
          $(this).find('.mega-menu__section').addClass('is-active');
        }
      })
    }
  },
  showThemeEditorState: function(id, $section) {
    $('.mega-menu__' + id + ' .mega-menu').addClass('mega-menu--force-show');
    $('.mega-menu__' + id + ' .mega-menu').prev('.header__link').addClass('is-active');
  },
  hideThemeEditorState: function(id, $section) {
    $('.mega-menu__' + id + ' .mega-menu').removeClass('mega-menu--force-show');
    $('.mega-menu__' + id + ' .mega-menu').prev('.header__link').removeClass('is-active');
  },
  displayMenu: function(id) {
    $('.mega-menu').removeClass('mega-menu--show');
    $('.mega-menu__' + id + ' .mega-menu').addClass('mega-menu--show');
  },
  hideMenu: function(id) {
    $('.mega-menu__' + id + ' .mega-menu').removeClass('mega-menu--show');
  },
  unload: function($section) {
    let parentLink = $section.find('.mega-menu').data('parent-link');
    let navLink = $('[data-navlink-handle="' + parentLink + '"]')
    navLink.off();
    navLink.find('.mega-menu__section').remove();
    $('.mega-menu__section, .navbar, .navbar-item, .header__brand, .header__search').off();
  }
}

/******/ })()
;