"use strict";

window.PXUTheme.contentCreator.accordion = {
  init: function () {
    const $accordionHeading = $('.accordion > dt > a, [data-cc-accordion] > dt > a');
    $('.accordion > dd, [data-cc-accordion] > dd').attr('aria-hidden', true);
    $accordionHeading.attr('aria-expanded', false);
    $accordionHeading.on('click', function () {
      let state = $(this).attr('aria-expanded') === 'false' ? true : false;
      $(this).attr('aria-expanded', state);
      $(this).parent().next().attr('aria-hidden', !state);
      return false;
    });
    $accordionHeading.on('keydown', function (event) {
      let keyCode = event.keyCode || e.which;
      if (keyCode === 13) {
        $(this).trigger('activate');
      }
    });
  },
  unload: function () {
    $('.accordion > dt > a, [data-cc-accordion] > dt > a').off('click activate');
    $('.accordion > dt > a, [data-cc-accordion] > dt > a').off('keydown');
  }
};
window.PXUTheme.contentCreator.slideshow = {
  init: function () {
    //backwards compatibility with flexslider
    $('.slider, .flexslider').find('li').unwrap();
    $('.slider, .flexslider').flickity({
      pageDots: true,
      lazyLoad: 2
    });
  }
};
window.PXUTheme.animation = {
  init: function () {
    $('[data-scroll-class]').waypoint(function () {
      const animationClass = $(this.element).data('scroll-class');
      $(this.element).addClass('animated').addClass(animationClass);
    }, {
      offset: '70%'
    });
  },
  slideTransition: function ($el, animationName, callback) {
    $el.parents('.flickity-enabled').find('.animated').removeClass('animated ' + animationName);
    $el.addClass('animated').addClass(animationName);
  },
  unload: function ($target) {
    $target.data('scroll-class', '');
  }
};
const deferred = {};
window.PXUTheme.asyncView = {
  /**
   * Load the template given by the provided URL into the provided
   * view
   *
   * @param {string} url - The url to load.
   * @param {string} view - The view to load into.
   * @param {object} options - Config options.
   * @param {string} options.hash - A hash of the current page content.
   */
  load: function (url, view) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let data;
    if (url in deferred) {
      return deferred[url];
    }
    const $deferred = $.Deferred();
    deferred[url] = $deferred;
    if (options.hash) {
      data = sessionStorage.getItem(url);
      if (data) {
        const deserialized = JSON.parse(data);
        if (options.hash === deserialized.options.hash) {
          delete deferred[url];
          return $deferred.resolve(deserialized).promise();
        }
      }
    }

    // NOTE The $.ajax request has the cache option set to false.
    // This is to prevent certain browsers from returning cached
    // versions of the url we are requesting.
    // See this PR for more info: https://github.com/pixelunion/shopify-asyncview/pull/4
    $.ajax({
      url,
      cache: false,
      data: `view=${view}`,
      dataType: 'html',
      headers: {
        'cache-control': 'no-cache'
      },
      success: response => {
        const el = document.createElement('div');
        el.innerHTML = response;
        const responseOptions = JSON.parse(el.querySelector('[data-options]').innerHTML);
        const htmls = el.querySelectorAll('[data-html]');
        let html = {};
        if (htmls.length === 1 && htmls[0].getAttribute('data-html') === '') {
          html = htmls[0].innerHTML;
        } else {
          for (let i = 0; i < htmls.length; i++) {
            html[htmls[i].getAttribute('data-html')] = htmls[i].innerHTML;
          }
        }
        if (options.hash) {
          try {
            sessionStorage.setItem(url, JSON.stringify({
              options: responseOptions,
              html
            }));
          } catch (error) {
            console.error(error);
          }
        }
        delete deferred[url];
        return $deferred.resolve({
          options: responseOptions,
          html
        });
      },
      error: () => {
        delete deferred[url];
        return $deferred.reject();
      }
    });
    return $deferred.promise();
  }
};
window.PXUTheme.addImageDimension = function (imageUrl, size) {
  var insertPosition = imageUrl.lastIndexOf(".");
  return imageUrl.substring(0, insertPosition) + size + imageUrl.substring(insertPosition);
};
window.PXUTheme.breadcrumbs = {
  init: function (pages) {
    // Show pagination if number of pages is greater than 1
    if (pages > 1) {
      const breadcrumbSpan = document.querySelector('[data-breadcrumb-text]');
      const currentPage = document.querySelector('.paginate').dataset.currentPage ? document.querySelector('.paginate').dataset.currentPage : 1;
      const totalPages = document.querySelector('.paginate').dataset.paginatePages;
      document.querySelector('.js-breadcrumb-text').classList.remove('is-hidden');
      breadcrumbSpan.innerHTML = `${window.PXUTheme.translation.page_text} ${currentPage} ${window.PXUTheme.translation.of_text} ${totalPages}`;
    }
  },
  unload: function ($target) {
    document.querySelector('.js-breadcrumb-text').classList.add('is-hidden');
  }
};
window.PXUTheme.disclosure = {
  enable: function () {
    const $disclosure = $('[data-disclosure]');
    const $toggle = $('[data-disclosure-toggle]');
    const $disclosureWrap = $('.disclosure__list-wrap');
    const $mobileMenuDisclosureList = $('[data-disclosure-list]');

    // Check if current opened menu is offscreen
    function checkOffScreen($openedToggle) {
      if ($openedToggle.siblings('.disclosure__list-wrap').is(':off-right')) {
        $openedToggle.siblings('.disclosure__list-wrap').addClass('disclosure--left');
      }
    }
    function closeDisclosures(ignoreTarget, currentTarget) {
      if (ignoreTarget === true) {
        $toggle.not(currentTarget).removeClass('is-clicked');
        $toggle.not(currentTarget).attr('aria-expanded', 'false');
      } else {
        $toggle.removeClass('is-clicked');
        $toggle.attr('aria-expanded', 'false');
      }
      $disclosureWrap.removeClass('disclosure--left');
    }

    // Close menus on ESC
    $('body').on('keyup', function (e) {
      if (e.which == '27') {
        closeDisclosures();
      }
    });

    // Close menus on hoverout
    $disclosure.on('mouseleave', function (e) {
      closeDisclosures();
    });

    // Close menus on hoverout
    $disclosure.find('.disclosure-list__item:last-child').on('focusout', function (e) {
      closeDisclosures();
    });

    // On click/focus event for toggling options
    $toggle.on('mouseenter focus', function (e) {
      // Close all other menus
      closeDisclosures(true, this);
      const $target = $(e.currentTarget);
      $target.attr('aria-expanded', 'true').addClass('is-clicked');
      checkOffScreen($target);
    });

    // Mobile toggle logic
    $mobileMenuDisclosureList.on('touchstart', function (e) {
      const $target = $(e.currentTarget);
      $target.parents('.disclosure').addClass('is-clicked');
      closeDisclosures(true, this);
      if ($target.hasClass('is-clicked') == false) {
        $target.attr('aria-expanded', 'true').addClass('is-clicked');
        checkOffScreen($target);
      } else {
        $target.attr('aria-expanded', 'false').removeClass('is-clicked');
        $disclosureWrap.removeClass('disclosure--left');
      }
    });
    $mobileMenuDisclosureList.on('focusout', function (e) {
      closeDisclosures(true, this);
    });

    // Mobile form submitting
    $mobileMenuDisclosureList.on('change', function (e) {
      if (window.PXUTheme.media_queries.medium.matches || !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const $target = $(e.currentTarget);
        const selectedValue = e.currentTarget.value;
        const disclosureInput = $target.parents('.selectors-form__item').find('[data-disclosure-input]');
        const selectorForm = $target.parents('.selectors-form');
        if (!$target.hasClass('custom-currency')) {
          disclosureInput.val(selectedValue);
          selectorForm.submit();
        } else {
          $target.trigger('click');
        }
      }
    });
  },
  unload: function () {
    $('[data-disclosure]').off();
    $('[data-disclosure-toggle]').off();
    $('.disclosure__list-wrap').off();
  }
};
window.PXUTheme.dropdownMenu = function () {
  // Grab menu items
  const menuItems = $('.navbar-link');

  // Grab dropdowns
  const dropdowns = $('.navbar-dropdown');

  // Grab megamenus

  const megamenus = $('.has-mega-menu');

  // Listen for enter key
  menuItems.each(function (index, item) {
    let itemVisited = false;
    $(item).on('keydown', function (e) {
      // Check if enter key
      if (e.which === 13) {
        // Prevent it from going to the link
        if (itemVisited === false) {
          e.preventDefault();
        }

        // Show dropdown
        $(this).closest('.navbar-item').addClass('show-dropdown');

        // Reset itemVisited so that they can visit the link
        itemVisited = true;
      }
    });
    $(item).closest('.navbar-item').on('focusout', function (e) {
      if ($(this).find(e.relatedTarget).length === 0) {
        $(item).closest('.navbar-item').removeClass('show-dropdown');
      }
    });
  });

  // Listen for enter key
  dropdowns.each(function (index, item) {
    let itemVisited = false;
    $(item).on('keydown', function (e) {
      // Check if enter key
      if (e.which === 13) {
        // Prevent it from going to the link
        if (itemVisited === false) {
          e.preventDefault();
        }
        if ($(this).find('.has-submenu').length > 0) {
          $(this).addClass('show-nested-dropdown');
        }

        // Reset itemVisited so that they can visit the link
        itemVisited = true;
      }
    });
  });

  // Listen for enter key
  megamenus.each(function (index, item) {
    let itemVisited = false;
    $(item).on('keydown', function (e) {
      // Check if enter key
      if (e.which === 13) {
        // Prevent it from going to the link
        if (itemVisited === false) {
          e.preventDefault();
        }

        // Show megamenu
        $(this).find('.mega-menu').addClass('mega-menu--show');

        // Reset itemVisited so that they can visit the link
        itemVisited = true;
      }
    });

    // Hide mega menu on focusout
    $(item).on('focusout', function (e) {
      if ($(item).find(e.relatedTarget).length === 0) {
        $(item).find('.mega-menu').removeClass('mega-menu--show');
      }
    });
  });
};
window.PXUTheme.newsletterAjaxForm = {
  init: function () {
    // Selectors
    const $ajaxForm = $('.newsletter-form__wrapper .contact-form');
    $ajaxForm.each(function () {
      const $form = $(this);
      $form.on('submit', function (e) {
        if ($('input[name="challenge"]', $form).val() !== "true") {
          $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            success: function (data) {
              $form.fadeOut("slow", () => {
                $form.prev('.form__success-message').html(window.PXUTheme.translation.newsletter_form_success);
              });
            },
            error: function (data) {
              $('input[name="challenge"]', $form).val('true');
              $form.submit();
            }
          });
          e.preventDefault();
        }
      });
    });
  },
  unload: function () {
    const $ajaxForm = $('.newsletter-form__wrapper .contact-form');
    const $submitButton = $ajaxForm.find(':submit');
    $submitButton.off();
  }
};
window.PXUTheme.getSectionData = function ($section) {
  const sectionId = $section.attr('id').replace('shopify-section-', '');
  const $dataEl = $section.find(`[data-section-data][data-section-id=${sectionId}]`).first();
  if (!$dataEl) return {};

  // Load data from attribute, or innerHTML
  const data = $dataEl.data('section-data') || $dataEl.html();
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Sections: invalid section data found. ${error.message}`);
    return {};
  }
};
window.PXUTheme.infiniteScroll = {
  init() {
    this.defaults = {
      grid: '[data-load-more--grid]',
      gridItems: '[data-load-more--grid-item]'
    };
    $('body').off('click', '[data-load-more]');
    $('body').on('click', '[data-load-more]', function (e) {
      e.preventDefault();
      const $button = $(this);
      const url = $button.attr('href');
      window.PXUTheme.infiniteScroll.loadNextPage(url, $button);
    });
    $('body').off('click', '[data-load-more-infinite]');
    $('body').on('click', '[data-load-more-infinite]', function (e) {
      window.PXUTheme.infiniteScroll.enableInfinite();
      $(this).remove();

      // Prevent link from going to next page
      e.stopPropagation();
      return false;
    });
    if ($('[data-load-infinite-scroll]').length) {
      window.PXUTheme.infiniteScroll.enableInfinite();
    }
  },
  loadNextPage(url, $button) {
    $.ajax({
      type: 'GET',
      dataType: 'html',
      url,
      beforeSend() {
        $button.addClass('is-loading');
      },
      success: data => {
        $button.removeClass('is-loading');
        const thumbnails = $(data).find(this.defaults.gridItems);
        const loadMoreButtonUrl = $(data).find('[data-load-more]').attr('href');
        $('[data-load-more]').attr('href', loadMoreButtonUrl);
        $(this.defaults.grid).first().append(thumbnails);

        // Initialize product reviews
        window.PXUTheme.productReviews.init();

        // When there are no additional pages, hide load more button
        if (typeof loadMoreButtonUrl === 'undefined') {
          $('[data-load-more]').addClass('is-hidden');
        }
      },
      error(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
        location.replace(`${location.protocol}//${location.host}`);
      }
    });
  },
  enableInfinite() {
    var infiniteScroll = new Waypoint.Infinite({
      element: $(this.defaults.grid)[0],
      items: '[data-load-more--grid-item]',
      more: '[data-load-infinite]',
      loadingClass: 'loading-in-progress',
      onBeforePageLoad() {
        $('[data-load-infinite]').removeClass('is-hidden');
      },
      onAfterPageLoad() {
        // Initialize product reviews
        window.PXUTheme.productReviews.init();
      }
    });
  },
  unload() {
    $('[data-load-more]').off();
    $('[data-load-infinite]').off();
    $('[data-load-more-infinite]').off();
  }
};
window.PXUTheme.flickityIosFix = function () {
  var touchingCarousel = false,
    touchStartCoords;
  document.body.addEventListener('touchstart', function (e) {
    if (e.target.closest('.flickity-slider')) {
      touchingCarousel = true;
    } else {
      touchingCarousel = false;
      return;
    }
    touchStartCoords = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
  });
  document.body.addEventListener('touchmove', function (e) {
    if (!(touchingCarousel && e.cancelable)) {
      return;
    }
    var moveVector = {
      x: e.touches[0].pageX - touchStartCoords.x,
      y: e.touches[0].pageY - touchStartCoords.y
    };
    if (Math.abs(moveVector.x) > 7) e.preventDefault();
  }, {
    passive: false
  });
};
window.PXUTheme.loadScript = function (name, url, callback) {
  if (window.PXUTheme[name]) {
    callback;
  } else {
    $.ajax({
      url,
      dataType: 'script',
      success: callback,
      async: false
    });
  }
};
window.PXUTheme.applyMasonry = function (selector, gutterSize) {
  let $galleryWrapper = $('.gallery-type--masonry');
  if ($galleryWrapper.length > 0) {
    $galleryWrapper.imagesLoaded().progress(function () {
      $galleryWrapper.isotope({
        layoutMode: 'masonry',
        itemSelector: selector,
        percentPosition: true,
        masonry: {
          columnWidth: selector,
          gutter: gutterSize
        }
      });
    });
  }
};
window.PXUTheme.applyHorizontalMasonry = function () {
  let $galleryWrapper = $('.gallery-type--horizontal-masonry');
  $galleryWrapper.find('.gallery__item').each(function (e) {
    var wrapper = $(this);
    var imgWidth, imgHeight;
    setTimeout(function () {
      imgWidth = wrapper.find('img').width();
      imgHeight = wrapper.find('img').height();
      wrapper.css("flex-basis", imgWidth * 200 / imgHeight);
      wrapper.css("flex-grow", imgWidth * 200 / imgHeight);
      wrapper.find("i").css("padding-bottom", imgHeight / imgWidth * 100 + '%');
    }, 100);
  });
};
window.PXUTheme.mobileMenu = {
  init: function () {
    this.$mobileMenuToggle = $('[data-show-mobile-menu]');
    this.$mobileMenuIcon = $('.mobile-menu__toggle-icon');
    this.$mobileDropDownToggle = $('.mobile-menu .close-dropdown');
    $('body').on('click', '[data-show-mobile-menu="false"]', function () {
      window.PXUTheme.mobileMenu.open();
    });
    $('body').on('click', '[data-show-mobile-menu="true"]', function () {
      window.PXUTheme.mobileMenu.close();
    });
    if (window.PXUTheme.jsHeader.enable_sticky === true) {
      this.enableSticky();
    }
  },
  open: function () {
    //Get current position on page
    let currentScrollPosition = window.scrollY;
    $('body').attr('data-current-position', currentScrollPosition);

    // Calculate height of mobile content area
    let announcementHeight = 0;
    let mobileHeaderHeight = parseInt($('.mobile-header').height());
    if (typeof window.PXUTheme.jsAnnouncementBar !== 'undefined' && window.PXUTheme.jsAnnouncementBar.enable_sticky) {
      announcementHeight = window.PXUTheme.jsAnnouncementBar.getAnnouncementHeight();
    }
    $('.mobile-menu').css({
      height: `calc(100vh - ${mobileHeaderHeight + announcementHeight}px)`
    });
    $('.mobile-menu__content').css({
      marginBottom: `${mobileHeaderHeight + announcementHeight}px`
    });
    this.$mobileMenuIcon.addClass('is-active');
    $('[data-show-mobile-menu]').attr('data-show-mobile-menu', true);
    if (typeof window.PXUTheme.jsAjaxCart !== 'undefined') {
      window.PXUTheme.jsAjaxCart.hideMiniCart();
      window.PXUTheme.jsAjaxCart.hideDrawer();
    }

    //Set delay on menu open to get proper page position
    setTimeout(function () {
      $('body').addClass('mobile-menu--opened');
    }, 10);
  },
  close: function () {
    $('body').removeClass('mobile-menu--opened');

    // Once mobile menu is closed, return back to previous position on page
    let lastScrollPosition = $('body').data('current-position');
    window.scrollTo(0, lastScrollPosition);
    this.$mobileMenuIcon.removeClass('is-active');
    $('[data-show-mobile-menu]').attr('data-show-mobile-menu', false);
  },
  enableSticky: function () {
    window.PXUTheme.jsHeader.disableSticky();
    let $stickyEl = $('#mobile-header');
    let offset = 0;
    if (typeof window.PXUTheme.jsAnnouncementBar !== 'undefined' && window.PXUTheme.jsAnnouncementBar.enable_sticky) {
      offset = window.PXUTheme.jsAnnouncementBar.getAnnouncementHeight();
    }
    $stickyEl.addClass('sticky--enabled');
    $stickyEl.sticky({
      wrapperClassName: 'header-sticky-wrapper',
      zIndex: 40,
      topSpacing: offset
    }).on('sticky-start', () => {
      var headerheight = $('#mobile-header').height();
      var annoucementHeight = $('.announcement-sticky-wrapper').height();
      var totalHeight = headerheight + annoucementHeight;
      $stickyEl.parent().parent().find('.search-overlay').addClass('sticky-search').css('top', totalHeight + 'px');
    }).on('sticky-end', () => {
      $stickyEl.parent().parent().find('.search-overlay').removeClass('sticky-search').css('top', '100%');
      // Safety timeout for logo width transition which can throw calculated height off
      setTimeout(() => {
        $stickyEl.sticky('update');
      }, 250);
      $stickyEl.find('.sticky-menu-wrapper').removeClass('is-visible');
    });
  },
  disableSticky: function () {
    let $stickyEl = $('#mobile-header');
    $stickyEl.unstick();
    $stickyEl.removeClass('sticky--enabled');
    setTimeout(function () {
      $('.header-sticky-wrapper').css('height', 'auto');
    }, 250);
  },
  unload: function ($section) {
    $('[data-mobilemenu-toggle]').off();
    $('.mobile-menu__toggle-icon').off();
    $('.mobile-menu .close-dropdown').off();
    this.disableSticky();
  }
};
window.PXUTheme.objectFitImages = {
  init: function () {
    objectFitImages();
    if (window.PXUTheme.theme_settings.image_loading_style == 'color') {
      this.calculateAspectRatio();
    }
  },
  calculateAspectRatio: function () {
    // Get list of image-element__wrap's to calculate
    const imageWrap = document.querySelectorAll('[data-calculate-aspect-ratio]');

    // Iterate through list
    for (let i = 0; i < imageWrap.length; i++) {
      const image = imageWrap[i].firstElementChild;

      // Calculate aspect ratio based off of original width & height
      const aspectRatio = image.getAttribute('width') / image.getAttribute('height');
      // Calculate proper width based off of aspect ratio
      const aspectWidth = image.height * aspectRatio;

      // Apply width to image wrap
      imageWrap[i].style.maxWidth = `${Math.floor(aspectWidth)}px`;
    }

    // Remove background color once loaded
    document.addEventListener('lazyloaded', function (e) {
      e.srcElement.parentNode.style.background = 'none';
    });
  },
  unload: function () {}
};

/* option_selection.js */
function floatToString(t, e) {
  var o = t.toFixed(e).toString();
  return o.match(/^\.\d+/) ? "0" + o : o;
}
if ("undefined" == typeof Shopify) var Shopify = {};
Shopify.each = function (t, e) {
  for (var o = 0; o < t.length; o++) e(t[o], o);
}, Shopify.map = function (t, e) {
  for (var o = [], i = 0; i < t.length; i++) o.push(e(t[i], i));
  return o;
}, Shopify.arrayIncludes = function (t, e) {
  for (var o = 0; o < t.length; o++) if (t[o] == e) return !0;
  return !1;
}, Shopify.uniq = function (t) {
  for (var e = [], o = 0; o < t.length; o++) Shopify.arrayIncludes(e, t[o]) || e.push(t[o]);
  return e;
}, Shopify.isDefined = function (t) {
  return "undefined" == typeof t ? !1 : !0;
}, Shopify.getClass = function (t) {
  return Object.prototype.toString.call(t).slice(8, -1);
}, Shopify.extend = function (t, e) {
  function o() {}
  o.prototype = e.prototype, t.prototype = new o(), t.prototype.constructor = t, t.baseConstructor = e, t.superClass = e.prototype;
}, Shopify.locationSearch = function () {
  return window.location.search;
}, Shopify.locationHash = function () {
  return window.location.hash;
}, Shopify.replaceState = function (t) {
  window.history.replaceState({}, document.title, t);
}, Shopify.urlParam = function (t) {
  var e = RegExp("[?&]" + t + "=([^&#]*)").exec(Shopify.locationSearch());
  return e && decodeURIComponent(e[1].replace(/\+/g, " "));
}, Shopify.newState = function (t, e) {
  var o;
  return o = Shopify.urlParam(t) ? Shopify.locationSearch().replace(RegExp("(" + t + "=)[^&#]+"), "$1" + e) : "" === Shopify.locationSearch() ? "?" + t + "=" + e : Shopify.locationSearch() + "&" + t + "=" + e, o + Shopify.locationHash();
}, Shopify.setParam = function (t, e) {
  Shopify.replaceState(Shopify.newState(t, e));
}, Shopify.Product = function (t) {
  Shopify.isDefined(t) && this.update(t);
}, Shopify.Product.prototype.update = function (t) {
  for (let property in t) this[property] = t[property];
}, Shopify.Product.prototype.optionNames = function () {
  return "Array" == Shopify.getClass(this.options) ? this.options : [];
}, Shopify.Product.prototype.optionValues = function (t) {
  if (!Shopify.isDefined(this.variants)) return null;
  var e = Shopify.map(this.variants, function (e) {
    var o = "option" + (t + 1);
    return void 0 == e[o] ? null : e[o];
  });
  return null == e[0] ? null : Shopify.uniq(e);
}, Shopify.Product.prototype.getVariant = function (t) {
  var e = null;
  return t.length != this.options.length ? e : (Shopify.each(this.variants, function (o) {
    for (var i = !0, r = 0; r < t.length; r++) {
      var n = "option" + (r + 1);
      o[n] != t[r] && (i = !1);
    }
    return 1 == i ? void (e = o) : void 0;
  }), e);
}, Shopify.Product.prototype.getVariantById = function (t) {
  for (var e = 0; e < this.variants.length; e++) {
    var o = this.variants[e];
    if (t == o.id) return o;
  }
  return null;
}, Shopify.money_format = "${{amount}}", Shopify.formatMoney = function (t, e) {
  function o(t, e) {
    return "undefined" == typeof t ? e : t;
  }
  function i(t, e, i, r) {
    if (e = o(e, 2), i = o(i, ","), r = o(r, "."), isNaN(t) || null == t) return 0;
    t = (t / 100).toFixed(e);
    var n = t.split("."),
      a = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + i),
      s = n[1] ? r + n[1] : "";
    return a + s;
  }
  "string" == typeof t && (t = t.replace(".", ""));
  var r = "",
    n = /\{\{\s*(\w+)\s*\}\}/,
    a = e || this.money_format;
  switch (a.match(n)[1]) {
    case "amount":
      r = i(t, 2);
      break;
    case "amount_no_decimals":
      r = i(t, 0);
      break;
    case "amount_with_comma_separator":
      r = i(t, 2, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      r = i(t, 2);
      break;
    case "amount_no_decimals_with_comma_separator":
      r = i(t, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      r = i(t, 0, ".", " ");
  }
  return a.replace(n, r);
}, Shopify.OptionSelectors = function (t, e) {
  return this.selectorDivClass = "selector-wrapper", this.selectorClass = "single-option-selector", this.variantIdFieldIdSuffix = "-variant-id", this.variantIdField = null, this.historyState = null, this.selectors = [], this.domIdPrefix = t, this.product = new Shopify.Product(e.product), this.onVariantSelected = Shopify.isDefined(e.onVariantSelected) ? e.onVariantSelected : function () {}, this.replaceSelector(t), this.initDropdown(), e.enableHistoryState && (this.historyState = new Shopify.OptionSelectors.HistoryState(this)), !0;
}, Shopify.OptionSelectors.prototype.initDropdown = function () {
  var t = {
      initialLoad: !0
    },
    e = this.selectVariantFromDropdown(t);
  if (!e) {
    var o = this;
    setTimeout(function () {
      o.selectVariantFromParams(t) || o.fireOnChangeForFirstDropdown.call(o, t);
    });
  }
}, Shopify.OptionSelectors.prototype.fireOnChangeForFirstDropdown = function (t) {
  this.selectors[0].element.onchange(t);
}, Shopify.OptionSelectors.prototype.selectVariantFromParamsOrDropdown = function (t) {
  var e = this.selectVariantFromParams(t);
  e || this.selectVariantFromDropdown(t);
}, Shopify.OptionSelectors.prototype.replaceSelector = function (t) {
  var e = document.getElementById(t),
    o = e.parentNode;
  Shopify.each(this.buildSelectors(), function (t) {
    o.insertBefore(t, e);
  }), e.style.display = "none", this.variantIdField = e;
}, Shopify.OptionSelectors.prototype.selectVariantFromDropdown = function (t) {
  var e = document.getElementById(this.domIdPrefix).querySelector("[selected]");
  if (e || (e = document.getElementById(this.domIdPrefix).querySelector('[selected="selected"]')), !e) return !1;
  var o = e.value;
  return this.selectVariant(o, t);
}, Shopify.OptionSelectors.prototype.selectVariantFromParams = function (t) {
  var e = Shopify.urlParam("variant");
  return this.selectVariant(e, t);
}, Shopify.OptionSelectors.prototype.selectVariant = function (t, e) {
  var o = this.product.getVariantById(t);
  if (null == o) return !1;
  for (var i = 0; i < this.selectors.length; i++) {
    var r = this.selectors[i].element,
      n = r.getAttribute("data-option"),
      a = o[n];
    null != a && this.optionExistInSelect(r, a) && (r.value = a);
  }
  return "undefined" != typeof jQuery ? jQuery(this.selectors[0].element).trigger("change", e) : this.selectors[0].element.onchange(e), !0;
}, Shopify.OptionSelectors.prototype.optionExistInSelect = function (t, e) {
  for (var o = 0; o < t.options.length; o++) if (t.options[o].value == e) return !0;
}, Shopify.OptionSelectors.prototype.insertSelectors = function (t, e) {
  Shopify.isDefined(e) && this.setMessageElement(e), this.domIdPrefix = "product-" + this.product.id + "-variant-selector";
  var o = document.getElementById(t);
  Shopify.each(this.buildSelectors(), function (t) {
    o.appendChild(t);
  });
}, Shopify.OptionSelectors.prototype.buildSelectors = function () {
  for (var t = 0; t < this.product.optionNames().length; t++) {
    var e = new Shopify.SingleOptionSelector(this, t, this.product.optionNames()[t], this.product.optionValues(t));
    e.element.disabled = !1, this.selectors.push(e);
  }
  var o = this.selectorDivClass,
    i = this.product.optionNames(),
    r = Shopify.map(this.selectors, function (t) {
      var e = document.createElement("div");
      if (e.setAttribute("class", o), i.length > 1) {
        var r = document.createElement("label");
        r.htmlFor = t.element.id, r.innerHTML = t.name, e.appendChild(r);
      }
      return e.appendChild(t.element), e;
    });
  return r;
}, Shopify.OptionSelectors.prototype.selectedValues = function () {
  for (var t = [], e = 0; e < this.selectors.length; e++) {
    var o = this.selectors[e].element.value;
    t.push(o);
  }
  return t;
}, Shopify.OptionSelectors.prototype.updateSelectors = function (t, e) {
  var o = this.selectedValues(),
    i = this.product.getVariant(o);
  i ? (this.variantIdField.disabled = !1, this.variantIdField.value = i.id) : this.variantIdField.disabled = !0, this.onVariantSelected(i, this, e), null != this.historyState && this.historyState.onVariantChange(i, this, e);
}, Shopify.OptionSelectorsFromDOM = function (t, e) {
  var o = e.optionNames || [],
    i = e.priceFieldExists || !0,
    r = e.delimiter || "/",
    n = this.createProductFromSelector(t, o, i, r);
  e.product = n, Shopify.OptionSelectorsFromDOM.baseConstructor.call(this, t, e);
}, Shopify.extend(Shopify.OptionSelectorsFromDOM, Shopify.OptionSelectors), Shopify.OptionSelectorsFromDOM.prototype.createProductFromSelector = function (t, e, o, i) {
  if (!Shopify.isDefined(o)) var o = !0;
  if (!Shopify.isDefined(i)) var i = "/";
  var r = document.getElementById(t),
    n = r.childNodes,
    a = (r.parentNode, e.length),
    s = [];
  Shopify.each(n, function (t, r) {
    if (1 == t.nodeType && "option" == t.tagName.toLowerCase()) {
      var n = t.innerHTML.split(new RegExp("\\s*\\" + i + "\\s*"));
      0 == e.length && (a = n.length - (o ? 1 : 0));
      var p = n.slice(0, a),
        l = o ? n[a] : "",
        c = (t.getAttribute("value"), {
          available: t.disabled ? !1 : !0,
          id: parseFloat(t.value),
          price: l,
          option1: p[0],
          option2: p[1],
          option3: p[2]
        });
      s.push(c);
    }
  });
  var p = {
    variants: s
  };
  if (0 == e.length) {
    p.options = [];
    for (var l = 0; a > l; l++) p.options[l] = "option " + (l + 1);
  } else p.options = e;
  return p;
}, Shopify.SingleOptionSelector = function (t, e, o, i) {
  this.multiSelector = t, this.values = i, this.index = e, this.name = o, this.element = document.createElement("select");
  for (var r = 0; r < i.length; r++) {
    var n = document.createElement("option");
    n.value = i[r], n.innerHTML = i[r], this.element.appendChild(n);
  }
  return this.element.setAttribute("class", this.multiSelector.selectorClass), this.element.setAttribute("data-option", "option" + (e + 1)), this.element.id = t.domIdPrefix + "-option-" + e, this.element.onchange = function (o, i) {
    i = i || {}, t.updateSelectors(e, i);
  }, !0;
}, Shopify.Image = {
  preload: function (t, e) {
    for (var o = 0; o < t.length; o++) {
      var i = t[o];
      this.loadImage(this.getSizedImageUrl(i, e));
    }
  },
  loadImage: function (t) {
    new Image().src = t;
  },
  switchImage: function (t, e, o) {
    if (t && e) {
      var i = this.imageSize(e.src),
        r = this.getSizedImageUrl(t.src, i);
      o ? o(r, t, e) : e.src = r;
    }
  },
  imageSize: function (t) {
    var e = t.match(/_(1024x1024|2048x2048|pico|icon|thumb|small|compact|medium|large|grande)\./);
    return null != e ? e[1] : null;
  },
  getSizedImageUrl: function (t, e) {
    if (null == e) return t;
    if ("master" == e) return this.removeProtocol(t);
    var o = t.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
    if (null != o) {
      var i = t.split(o[0]),
        r = o[0];
      return this.removeProtocol(i[0] + "_" + e + r);
    }
    return null;
  },
  removeProtocol: function (t) {
    return t.replace(/http(s)?:/, "");
  }
}, Shopify.OptionSelectors.HistoryState = function (t) {
  this.browserSupports() && this.register(t);
}, Shopify.OptionSelectors.HistoryState.prototype.register = function (t) {
  window.addEventListener("popstate", function (e) {
    t.selectVariantFromParamsOrDropdown({
      popStateCall: !0
    });
  });
}, Shopify.OptionSelectors.HistoryState.prototype.onVariantChange = function (t, e, o) {
  this.browserSupports() && (!t || o.initialLoad || o.popStateCall || Shopify.setParam("variant", t.id));
}, Shopify.OptionSelectors.HistoryState.prototype.browserSupports = function () {
  return window.history && window.history.replaceState;
};

/*============================================================================
Product media controls
==============================================================================*/

window.PXUTheme.productMedia = {
  models: [],
  setupMedia: function () {
    const config = {
      // Default control list
      controls: ['zoom-in', 'zoom-out', 'fullscreen'],
      focusOnPlay: false
    };
    $('model-viewer').each(function (index, model) {
      model = new Shopify.ModelViewerUI(model, config);
      window.PXUTheme.productMedia.models.push(model);
    });
    $('.product-gallery__model model-viewer').on('mousedown', function () {
      window.PXUTheme.productMedia.hideModelIcon(this);
    });
  },
  showModelIcon: function (slide) {
    $(slide).find('.button--poster, .model-icon-button-control').show();
  },
  hideModelIcon: function (slide) {
    $(slide).find('.button--poster, .model-icon-button-control').hide();
  }
};
window.PXUTheme.productReviews = {
  init: function () {
    if ($('#shopify-product-reviews').length || $('.shopify-product-reviews-badge').length) {
      SPR.$(document).ready(function () {
        return SPR.registerCallbacks(), SPR.initRatingHandler(), SPR.initDomEls(), SPR.loadProducts(), SPR.loadBadges();
      });
    }
  },
  productReviewScroll: function () {
    if ($('#shopify-product-reviews').length && $('.shopify-product-reviews-badge').length) {
      $('.spr-badge-container').on('click', function () {
        window.PXUTheme.scrollToTop('#shopify-product-reviews');
      });
    }
  },
  unload: function () {
    $('.spr-badge-container').off();
  }
};
window.PXUTheme.quantityBox = {
  init: function () {
    $('body').on('click', '[data-update-quantity]:not([disabled])', function () {
      window.PXUTheme.quantityBox.updateQuantity($(this));
    });
    $('body').on('keyup keydown change', '.quantity-input', function () {
      window.PXUTheme.quantityBox.updateQuantity($(this));
    });
  },
  updateQuantityControls: function ($el) {
    const $quantityBox = $el.parents('.product-quantity-box');
    const $input = $('.quantity-input', $quantityBox);
    let val = parseInt($input.val());
    let valMax = 100000000000000000;
    if ($input.attr('max') != null) {
      valMax = $input.attr('max');
    }
    if (val === 1 || val === 0) {
      $('.quantity-minus', $quantityBox).attr('disabled', true);
      $('.quantity-plus', $quantityBox).attr('disabled', false);
    } else if (val >= valMax) {
      $('.quantity-plus', $quantityBox).attr('disabled', true);
      $('.quantity-minus', $quantityBox).attr('disabled', false);
      $input.val(valMax);
    } else {
      $('.quantity-minus', $quantityBox).attr('disabled', false);
      $('.quantity-plus', $quantityBox).attr('disabled', false);
    }
  },
  updateQuantity: function ($el) {
    const $quantityBox = $el.parents('.product-quantity-box');
    const $input = $('.quantity-input', $quantityBox);
    const lineID = $quantityBox.parents('[data-line-item]').data('line-item');
    let val = parseInt($input.val());
    let valMax = 100000000000000000;
    let valMin = $input.attr('min') || 0;
    if ($input.attr('max') != null) {
      valMax = $input.attr('max');
    }
    if (val < valMin) {
      $input.val(valMin);
      return false;
    } else if (val > valMax) {
      $input.val(valMax);
      return false;
    }
    if ($el.data('update-quantity') === 'plus') {
      // Increase quantity input by one
      if (val < valMax) {
        val++;
        $input.val(val);
      }
    } else if ($el.data('update-quantity') === 'minus') {
      // Decrease quantity by one
      if (val > valMin) {
        val--;
        $input.val(val);
      }
    }

    // Update quantity if within cart (vs on the product page)
    if ($el.parents('[data-line-item]').length) {
      const lineID = $quantityBox.data('line-item-key');
      window.PXUTheme.quantityBox.updateCart(lineID, val);
    }

    // Call to update quantity controls
    window.PXUTheme.quantityBox.updateQuantityControls($el);
  },
  updateCart: function (lineID, quantity) {
    $('.quantity-warning').removeClass('animated bounceIn');
    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: `quantity=${quantity}&line=${lineID}`,
      dataType: 'json',
      success: function (cart) {
        let newQuantity = 0;
        let itemsLeftText = '';
        let quantityWarning = $(`[data-line-item="${lineID}"]`).find('.quantity-warning');
        let $quantityBox = $(`[data-line-item="${lineID}"]`).find('.product-quantity-box');
        let $currentDiscount = $('.cart__form').data('currentDiscount');

        //check to see if there are correct amount of products in array
        const cartItemsLineID = lineID - 1;
        if (typeof cart.items[cartItemsLineID] !== "undefined") {
          newQuantity = cart.items[cartItemsLineID].quantity;
        }
        for (let i = 0; i < cart.items.length; i++) {
          if (i != cartItemsLineID) {
            if (cart.items[i].id == cart.items[cartItemsLineID].id) {
              newQuantity += cart.items[i].quantity;
            }
          }
        }
        if (quantity > 0 && quantity != newQuantity) {
          //Check if total discount has changed
          if (cart.total_discount <= $currentDiscount) {
            if (newQuantity == 1) {
              itemsLeftText = window.PXUTheme.translation.product_count_one;
              quantityWarning.text(`${newQuantity} ${itemsLeftText}`);
              $('.quantity-minus', $quantityBox).attr('disabled', true);
            } else {
              itemsLeftText = window.PXUTheme.translation.product_count_other;
              quantityWarning.text(`${newQuantity} ${itemsLeftText}`);
            }
          }
        }

        //Update total discount value
        $('.cart__form').data('currentDiscount', cart.total_discount);

        // Apply quantity warning
        quantityWarning.addClass('animated bounceIn');
        if (typeof window.PXUTheme.jsAjaxCart !== 'undefined') {
          window.PXUTheme.jsAjaxCart.updateView();
        }
        if (window.PXUTheme.jsCart) {
          window.PXUTheme.jsCart.updateView(cart, lineID);
        }
      },
      error: function (XMLHttpRequest, textStatus) {
        var response = eval('(' + XMLHttpRequest.responseText + ')');
        response = response.description;
      }
    });
  },
  unload: function ($target) {
    $('.quantity-input').off();
    $('[data-update-quantity]').off();
  }
};
window.PXUTheme.queryParameters = {};
if (location.search.length) {
  for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
    aKeyValue = aCouples[i].split('=');
    if (aKeyValue.length > 1) {
      window.PXUTheme.queryParameters[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
    }
  }
}
window.PXUTheme.responsiveVideo = {
  init: function () {
    // Find youtube iframes
    var $videoIframes = $('iframe[src*="youtube.com"], iframe[src*="vimeo.com"]');

    // For each iframe, if parent is a responsive video wrapper do nothing
    // If no parent responsive video wrapper, then wrap iframe in responsive video wrapper

    $videoIframes.each(function (index, iframe) {
      // Update selector
      var $iframe = $(iframe);
      if (!$iframe.parents('.plyr__video-wrapper').length && !$iframe.parents('.lazyframe').length) {
        $iframe.wrap('<div class="lazyframe" data-ratio="16:9"></div>');
      }
    });
  }
};
function selectCallback(productEl, product, variant, state) {
  const $product = $(productEl);
  const $notifyForm = $('.product__notify-form', $product);
  const $productForm = $('.product_form, .shopify-product-form', $product);
  const variantInventory = $productForm.data('variant-inventory');
  const $productFormInput = $productForm.find('.quantity-input');
  const $notifyFormInputs = $('.notify_form__inputs');
  const notifyEmail = window.PXUTheme.translation.notify_form_email;
  const notifyEmailValue = window.PXUTheme.translation.contact_email;
  const notifySend = window.PXUTheme.translation.notify_form_send;
  const notifyUrl = $notifyFormInputs.data('url');
  let notifyMessage = '';
  let notifyEmailInput = '';
  if (variant) {
    if (variant.title != null) {
      // Escape variant titles
      const variantTitle = variant.title.toLowerCase() === 'default title' ? variant.name.replace(/"/g, '&quot;') : variant.title.replace(/"/g, '&quot;');
      notifyMessage = `${window.PXUTheme.translation.email_content}${variantTitle} | ${notifyUrl}?variant=${variant.id}`;
    }
  } else {
    notifyMessage = `${window.PXUTheme.translation.email_content} | ${notifyUrl}`;
  }
  if ($notifyFormInputs.hasClass('customer--true')) {
    notifyEmailInput = `<input required type="email" class="notify_email input" name="contact[email]" id="contact[email]" placeholder="${notifyEmail}" value="${window.PXUTheme.translation.customer_email}" />`;
  } else {
    notifyEmailInput = `<input required type="email" class="notify_email input" name="contact[email]" id="contact[email]" placeholder="${notifyEmail}" value="${notifyEmailValue}" />`;
  }
  const notifyFormHTML = `
    <input type="hidden" name="challenge" value="false" />
    <input type="hidden" name="contact[body]" class="notify_form_message" data-body="${notifyMessage}" value="${notifyMessage}" />
    <div class="field has-addons">
      <div class="control">
        ${notifyEmailInput}
      </div>
      <div class="control">
        <input class="action_button button" type="submit" value="${notifySend}" />
      </div>
    </div>`;

  // Image Variant feature
  if (variant && variant.featured_image && $product.is(':visible')) {
    const $sliders = $('.product-gallery__main, .js-gallery-modal', $product);
    $sliders.each((_index, value) => {
      const $slider = $(value);
      const $sliderInstance = window.Flickity.data(value);
      const index = $(`img[data-image-id=${variant.featured_media.id}]`).data('index');
      if ($slider.is(':visible') && $sliderInstance !== undefined) {
        $sliderInstance.select(index, false, true);
      }
    });
  }

  // Emits custom event
  const $selectDropdown = $productForm.find('[data-variant-selector]');
  $selectDropdown.trigger('selectedVariantChanged');
  $('.cart-warning', $product).text('');
  if (variant) {
    $('.sku', $product).text(variant.sku);
    $('.notify_form_message', $product).attr('value', `${$('.notify_form_message', $product).data('body')} - ${variant.title}`);
  }
  if (variant && variant.available) {
    const variantWithInventory = {
      ...variant,
      ...(variantInventory ? variantInventory.find(v => v.id === variant.id) || {} : {})
    };
    if (variantWithInventory.inventory_management && variantWithInventory.inventory_quantity > 0) {
      if (window.PXUTheme.theme_settings.display_inventory_left) {
        let itemsLeftText = window.PXUTheme.translation.product_count_other;
        if (variantWithInventory.inventory_quantity === 1) {
          itemsLeftText = window.PXUTheme.translation.product_count_one;
        }
        const inventoryThreshold = window.PXUTheme.theme_settings.inventory_threshold;
        if (variantWithInventory.inventory_quantity <= inventoryThreshold) {
          $('.items_left', $product).html(`${variantWithInventory.inventory_quantity} ${itemsLeftText}`);
        } else {
          $('.items_left', $product).html('');
        }
      }
      if (variantWithInventory.inventory_policy === 'deny') {
        $('[data-max-inventory-management]', $product).attr('max', variantWithInventory.inventory_quantity);

        // Check to see if quantity selector should be disabled based on inventory remaining
        window.PXUTheme.quantityBox.updateQuantityControls($productFormInput);
      }
    } else {
      $('.items_left', $product).text('');
      $('[data-max-inventory-management]', $product).removeAttr('max');
    }
    $('.sold_out', $product).text('');
    $('[data-add-to-cart-trigger]', $product).removeClass('disabled').removeAttr('disabled').attr('data-options-unselected', null).find('span:not(.icon)').text($('[data-add-to-cart-trigger]', $product).data('label'));

    // Initialize shopify payment buttons
    if (Shopify.PaymentButton) {
      Shopify.PaymentButton.init();
    }
    $('.shopify-payment-button', $product).show();
    $('.purchase-details__quantity', $product).show();
    $notifyForm.hide();
    $notifyFormInputs.empty();
    $notifyFormInputs.append(notifyFormHTML);
    if (window.PXUTheme.currencyConverter) {
      window.PXUTheme.currencyConverter.convertCurrencies();
    }
  } else {
    const message = variant ? window.PXUTheme.translation.soldOut : window.PXUTheme.translation.unavailable;
    $('.items_left', $product).text('');
    $('[data-max-inventory-management]', $product).removeAttr('max');
    $('.sold_out', $product).text(message);
    $('[data-add-to-cart-trigger]', $product).addClass('disabled').attr('disabled', 'disabled').attr('data-options-unselected', null).find('span:not(.icon)').text(message);
    $('.shopify-payment-button', $product).hide();
    $('.purchase-details__quantity', $product).hide();
    $notifyForm.hide();
    $notifyFormInputs.empty();
    if (variant && !variant.available) {
      $notifyForm.fadeIn();
      $notifyFormInputs.empty();
      $notifyFormInputs.append(notifyFormHTML);
    }
  }
}
window.selectCallback = selectCallback;
window.PXUTheme.predictiveSearch = {
  vars: {
    term: '',
    searchPath: window.PXUTheme.routes.search_url,
    displayTimer: ''
  },
  init: function () {
    this.unload();
    $('[data-show-search-trigger], [data-autocomplete-true] input').on('click touchstart', function (e) {
      if (!isScreenSizeLarge()) {
        e.stopPropagation();
        const formType = $(this).closest('form').find('[name="type"]').val();
        const position = $(document).scrollTop();
        window.PXUTheme.predictiveSearch.showMobileSearch(formType, position);
      }
    });

    // Focus state to display search results
    $('[data-autocomplete-true]').on('focus', function () {
      $(this).parents('[data-autocomplete-true]').find('.search__results-wrapper').show();
    });

    // Clicking outside makes the results disappear.
    $(document).on('click focusout', function (e) {
      if (window.PXUTheme.media_queries.large.matches) {
        var searchForm = $(e.target).parents('.search-form');
        if (searchForm.length === 0) {
          $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
        }
      }
    });

    // Submit wildcard searches
    $("[data-autocomplete-true] form").on("submit", function (e) {
      e.preventDefault();
      const formValue = $(this).find('input[name="q"]').val();
      const cleanFormValue = encodeURI(formValue);
      let searchType = window.PXUTheme.theme_settings.search_option;
      if ($(this).find('[name="type"]').length > 0) {
        searchType = $(this).find('[name="type"]').val();
      }
      if (cleanFormValue == null) {
        window.location.href = window.PXUTheme.routes.search_url + '?type=' + searchType;
      } else {
        window.location.href = window.PXUTheme.predictiveSearch.vars.searchPath + '?type=' + searchType + '&q=' + cleanFormValue + '*';
      }
    });
    $('[data-autocomplete-true] form').each(function () {
      const $this = $(this);
      const input = $this.find('input[name="q"]');

      // Adding a list for showing search results.
      const resultWrapper = `
        <div class="search__results-wrapper">
          <h2 class="vertical-search__title">
            ${window.PXUTheme.translation.top_suggestions}
          </h2>
          <ul class="search__results"></ul>
        </div>
      `;
      $(resultWrapper).appendTo($this);
      input.attr('autocomplete', 'off').on('input', function () {
        clearTimeout(window.PXUTheme.predictiveSearch.vars.displayTimer);
        if ($(this).val().length > 3) {
          window.PXUTheme.predictiveSearch.vars.term = $(this).val();
          window.PXUTheme.predictiveSearch.getResults(window.PXUTheme.predictiveSearch.vars.term, $this);
        } else {
          $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
        }
      });
    });
  },
  getResults: function (term, $this) {
    let searchType = window.PXUTheme.theme_settings.search_option;
    if ($this.find('[name="type"]').length > 0) {
      searchType = $this.find('[name="type"]').val();
    }
    jQuery.getJSON("/search/suggest.json", {
      "q": term,
      "resources": {
        "type": searchType,
        "limit": window.PXUTheme.theme_settings.search_to_display,
        "options": {
          "unavailable_products": "last",
          "fields": "title,body,variants.title,variants.sku,vendor,product_type,tag"
        }
      }
    }).done(function (response) {
      const suggestions = [response.resources.results.products, response.resources.results.pages, response.resources.results.articles];
      let filteredResults = [];

      // Store results in array
      $.each(suggestions, function (index, suggestion) {
        if (suggestion !== undefined && suggestion.length > 0) {
          // Ensure suggestion exists
          filteredResults.push(suggestion);
        }
      });

      // Display results
      window.PXUTheme.predictiveSearch.vars.displayTimer = setTimeout(function () {
        window.PXUTheme.predictiveSearch.displayResults(filteredResults[0], $this);
      }, 500);
    });
  },
  displayResults: function (results, $this) {
    const $resultsWrapper = $this.find('.search__results-wrapper');
    const $resultsList = $this.find('.search__results');
    let searchType = window.PXUTheme.theme_settings.search_option;
    $resultsWrapper.show();
    $resultsList.empty();
    if ($this.find('[name="type"]').length > 0) {
      searchType = $this.find('[name="type"]').val();
    }
    if (results && results.length > 0) {
      $.each(results, function (index, result) {
        let link = $('<a tabindex="0"></a>').attr('href', result.url);
        if (window.PXUTheme.routes.root_url !== '/') {
          link = $('<a tabindex="0"></a>').attr('href', window.PXUTheme.routes.root_url + result.url);
        }

        // if result is a product
        if (result['price']) {
          function formatPrice(price) {
            if (window.PXUTheme.currency.display_format === 'money_with_currency_format') {
              return `<span class="money"> ${window.PXUTheme.currency.symbol}${price} ${window.PXUTheme.currency.iso_code} </span>`;
            } else {
              return `<span class="money"> ${window.PXUTheme.currency.symbol}${price} </span>`;
            }
          }
          let itemPrice;
          if (result.available) {
            if (result.compare_at_price_max > result.price_max || result.compare_at_price_min > result.price_min) {
              itemPrice = `${formatPrice(result.price)} <span class="was-price">${formatPrice(result.compare_at_price_min)}</span>`;
            } else {
              if (result.price > 0) {
                if (result.price_min != result.price_max) {
                  itemPrice = `${window.PXUTheme.translation.from} ${formatPrice(result.price)}`;
                } else {
                  itemPrice = `${formatPrice(result.price)}`;
                }
              } else {
                itemPrice = window.PXUTheme.theme_settings.free;
              }
            }
          } else {
            itemPrice = window.PXUTheme.translation.soldOut;
          }

          // If result has image
          if (result['image']) {
            link.append(`<div class="thumbnail"><img class="lazyload transition--${window.PXUTheme.theme_settings.image_loading_style}" src="${window.PXUTheme.addImageDimension(result['image'], '_300x')}" /></div>`);
          }
          link.append(`<div class="description"><strong>${result.title}</strong><br><span class="item-pricing price">${itemPrice}</span></div>`);

          // if result is an article
        } else if (result['summary_html']) {
          if (result.image != 'NULL') {
            link.append(`<div class="thumbnail"><img class="lazyload transition--${window.PXUTheme.theme_settings.image_loading_style}" src="${window.PXUTheme.addImageDimension(result['image'], '_300x')}" /></div>`);
          }
          link.append(`<div class="description"><strong>${result.title}</strong><br><span class="item-description">'${result.summary_html.replace(/(<([^>]+)>)/ig, "").slice(0, 25)}</span></div>`);

          // if result is a page
        } else if (result['published_at']) {
          link.append(`<div class="description"><strong>${result.title}</strong><br><span class="item-description">${result.body.replace(/(<([^>]+)>)/ig, "").slice(0, 25)}</span></div>`);
        }

        // Wrap link and append to list
        link.wrap('<li class="item-result"></li>');
        $resultsList.append(link.parent());
        if (window.PXUTheme.currencyConverter) {
          window.PXUTheme.currencyConverter.init();
        }
      });
      $resultsList.prepend(`<li class="all-results"><span class="see-all"><a href="${this.vars.searchPath}?type=${searchType}&q=${this.vars.term}*"> ${window.PXUTheme.translation.all_results} ${window.PXUTheme.icons.right_caret}</a></span></li>`);
      $resultsList.parents('.search__results-wrapper').addClass('results-found');
    } else {
      // if no results
      const noResults = `<li class="item-result"><span class="no-results">${window.PXUTheme.translation.no_results}</span></li>`;
      $resultsList.append(noResults);
      $resultsList.parents('.search__results-wrapper').removeClass('results-found');
    }
    if ($this.parents('.vertical-header__content').length && window.PXUTheme.jsHeader.header_layout === 'vertical') {
      window.PXUTheme.predictiveSearch.alignVerticalSearch();
    }
    $resultsList.show();
  },
  showMobileSearch: function (formType, position) {
    $('body').css('max-height', window.innerHeight);
    $('.mobile-search').fadeIn(200);
    if (/iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      $('.mobile-search input[data-q]').focus();
    } else {
      //Set delay to ensure focus triggers on android
      setTimeout(function () {
        $('.mobile-search input[data-q]').focus();
      }, 205);
    }
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + position + 'px';
    $('.mobile-search').css('top', position);
    const searchHeight = window.innerHeight - 46; //Full screen height - form height
    $('.mobile-search .search__results-wrapper').css('max-height', searchHeight);
    if (formType) {
      $('.mobile-search [name="type"]').val(formType);
    } else {
      $('.mobile-search [name="type"]').val(window.PXUTheme.theme_settings.search_option);
    }
    $('.search-form .close-search').on('click touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.PXUTheme.predictiveSearch.hideMobileSearch(position);
      $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
    });
    $('.search-form .submit-search').on('click touchstart', function (e) {
      $(this).parents('form').submit();
    });
  },
  hideMobileSearch: function (position) {
    $('body').css('max-height', 'none');
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, position);
    $('.mobile-search').fadeOut(200);
    $('.mobile-search [name="q"]').val('');
    $('body').off('focus', '.search-form .close-search');
    $('body').off('focus', '.search-form .submit-search');
  },
  alignVerticalSearch: function () {
    const $resultsList = $('.header--vertical .search__results');
    const headerWidth = $('.header--vertical').innerWidth();
    $resultsList.parents('.search__results-wrapper').css({
      'position': 'fixed',
      'left': headerWidth,
      'top': '0'
    });
  },
  unload: function () {
    $('body').off('focus', '[data-autocomplete-true] input');
    $('input[name="q"]').off();
    $('[data-dropdown-rel="search"], [data-autocomplete-true] input').off();
    $('.search__results-wrapper').remove();
  }
};
function isScreenSizeLarge() {
  if (window.PXUTheme.media_queries.large.matches) {
    return true;
  }
}
window.PXUTheme.scrollToTop = function (element, height) {
  // Check if height argument is present
  if (height != undefined) {
    $('html, body').animate({
      scrollTop: $(element).offset().top - height
    }, 1000);
  } else {
    $('html, body').animate({
      scrollTop: $(element).offset().top
    }, 1000);
  }
};
window.PXUTheme.tabs = {
  enableTabs: function () {
    let $tabs = $('.tabs li, .tabs li a');
    $tabs.on('click', function (el) {
      el.preventDefault();

      // toggle active tab
      $tabs.removeClass('is-active active');
      $(this).addClass('is-active');
      let $tabIndex = $(this).index();
      let $tabContent = $(this).parents('.tabs').next('.tabs-content');

      // toggle corresponding tab content
      $tabContent.children('li, li a').removeClass('is-active active');
      $tabContent.children('li, li a').eq($tabIndex).addClass('is-active').show().css({
        'display': 'block'
      }).siblings().hide().removeClass('is-active');
    });
  },
  unload: function () {
    $('.tabs li, .tabs li a').off();
  }
};
class ProductCard {
  enableSwatches() {
    if (window.isScreenSizeLarge()) {
      $('body').on('mouseenter', '.swatch span', _ref => {
        let {
          currentTarget
        } = _ref;
        if ($(currentTarget).data('image') && $(currentTarget).data('image').indexOf('no-image') === -1) {
          $(currentTarget).parents('.thumbnail').find('.product__imageContainer img:not(.secondary)').attr('src', $(currentTarget).data('image'));
          $(currentTarget).parents('.thumbnail').find('.product__imageContainer img:not(.secondary)').attr('srcset', $(currentTarget).data('image'));
        }
      });
    }
  }
  showVariantImage() {
    if (window.isScreenSizeLarge()) {
      $('body').on('mouseenter', '.has-secondary-image-swap', _ref2 => {
        let {
          currentTarget
        } = _ref2;
        const $thumbnailImage = $(currentTarget).find('.product-image__wrapper img');
        const $thumbnailVideo = $(currentTarget).find('.product-image__wrapper .video-on-hover');
        if ($thumbnailImage) {
          $thumbnailImage.toggleClass('swap--visible');
        }
        if ($thumbnailVideo) {
          $thumbnailVideo.toggleClass('swap--visible');
          window.PXUTheme.video.enableVideoOnHover($(currentTarget));
        }
      });
      $('body').on('mouseleave', '.has-secondary-image-swap', _ref3 => {
        let {
          currentTarget
        } = _ref3;
        const $thumbnailImage = $(currentTarget).find('.product-image__wrapper img');
        const $thumbnailVideo = $(currentTarget).find('.product-image__wrapper .video-on-hover');
        if ($thumbnailImage) {
          $thumbnailImage.toggleClass('swap--visible');
        }
        if ($thumbnailVideo) {
          $thumbnailVideo.toggleClass('swap--visible');
          window.PXUTheme.video.disableVideoOnHover($(currentTarget));
        }
      });
    }
  }
  showQuickShop() {
    // EVENT - click on quick-shop
    $('body').on('click', '.js-quick-shop-link', e => {
      e.preventDefault();
      const $currentTarget = $(e.currentTarget);
      window.PXUTheme.jsProductClass.load($currentTarget.data('url')).then(_ref4 => {
        let {
          html
        } = _ref4;
        $('.js-quick-shop').html(html.content);
        $('.js-quick-shop [data-section-data]').attr('data-section-id', 'quickshop');
        $('.js-quick-shop .js-product_section').addClass('quickshop');
        if (!$('.fancybox-active').length) {
          $.fancybox.open($('.js-quick-shop'), {
            baseClass: `quick-shop__lightbox product-${$currentTarget.data('id')}`,
            hash: false,
            infobar: false,
            toolbar: false,
            loop: true,
            smallBtn: true,
            touch: false,
            video: {
              autoStart: false
            },
            mobile: {
              preventCaptionOverlap: false,
              toolbar: true
            },
            afterShow: (_e, instance) => {
              // Use unique identifier for the product gallery
              const {
                src
              } = instance;
              const $quickshop = $(src).find('.quick-shop');
              window.PXUTheme.jsProduct.init($('.js-quick-shop'));
              $quickshop.addClass('quick-shop--loaded');
              $quickshop.addClass('content-loaded');
              if ($('.quickshop .tabs').length > 0) {
                window.PXUTheme.tabs.enableTabs();
              }
            },
            beforeClose: (_e, instance) => {
              // Use unique identifier for the product gallery
              const {
                src
              } = instance;
              const $quickshop = $(src).find('.quick-shop');
              $quickshop.removeClass('quick-shop--loaded');
              $quickshop.removeClass('content-loaded');
            }
          });
        }
      }).catch(error => console.error(error));
    });
  }
}
window.PXUTheme.thumbnail = new ProductCard();
const videoEl = {
  playButtonIcon: '<button type="button" class="plyr__control plyr__control--overlaid" aria-label="Play, {title}" data-plyr="play"><svg class="play-icon-button-control" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M23 20V40L39 29.4248L23 20Z" fill="#323232"/></svg><span class="plyr__sr-only">Play</span></button>',
  playButton: '<button type="button" class="plyr__controls__item plyr__control" aria-label="Play, {title}" data-plyr="play"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Pause</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span></button>',
  muteButton: '<button type="button" class="plyr__controls__item plyr__control" aria-label="Mute" data-plyr="mute"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span></button>',
  progressInput: '<div class="plyr__controls__item plyr__progress__container"><div class="plyr__progress"><input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek"><progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress><span role="tooltip" class="plyr__tooltip">00:00</span></div></div>',
  volume: '<div class="plyr__controls__item plyr__volume"><input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume"></div>',
  fullscreen: '<button type="button" class="plyr__controls__item plyr__control" data-plyr="fullscreen"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span></button>'
};
const videoControls = `${videoEl.playButtonIcon}<div class="plyr__controls"> ${videoEl.playButton} ${videoEl.progressInput} ${videoEl.muteButton} ${videoEl.volume} ${videoEl.fullscreen}</div>`;
let videoPlayers = [];
let videosInRecommendedProductsPlayer;
window.PXUTheme.video = {
  init: function () {
    this.setupVideoPlayer();
  },
  setupVideoPlayer: function () {
    const productVideos = document.querySelectorAll('[data-html5-video] video, [data-youtube-video]');
    let setupVideoPlayers = Plyr.setup(productVideos, {
      controls: videoControls,
      ratio: this.aspect_ratio,
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: true
      },
      storage: {
        enabled: false
      }
    });
    let videoLooping = $('[data-video-loop]').data('video-loop') || false;
    $.each(setupVideoPlayers, function (index, player) {
      player.loop = videoLooping;
      videoPlayers.push(player);
    });
    this.setupListeners();
  },
  setupListeners: function () {
    // Adds plyr video id to video wrapper
    $.each(videoPlayers, function (index, player) {
      const id = player.id;
      let $video;
      if (player.isHTML5) {
        $video = $(player.elements.wrapper).find('video');
        $video.attr('data-plyr-video-id', id);
      }

      // When a video is playing, pause any other instances
      player.on('play', function (event) {
        var instance = event.detail.plyr;
        $.each(videoPlayers, function (index, player) {
          var playerID = player.id || player.media.dataset.plyrVideoId;
          if (instance.id != playerID) {
            player.pause();
          }
        });
      });
    });
  },
  enableVideoOnHover: function ($thumbnail) {
    var $html5Video = $thumbnail.find('[data-html5-video]');
    var $youtubeVideo = $thumbnail.find('[data-youtube-video]');
    var videoID;
    if ($html5Video.length > 0) {
      videoID = $html5Video.find('[data-plyr-video-id]').data('plyr-video-id');
    } else if ($youtubeVideo.length > 0) {
      videoID = $youtubeVideo.find('iframe').attr('id');
    }
    if (videoID) {
      $.each(videoPlayers, function (index, player) {
        if (player.id == videoID || player.media.id == videoID) {
          player.toggleControls(false);
          player.muted = true;
          player.play();
        }
      });
    }
  },
  disableVideoOnHover: function ($thumbnail) {
    var $html5Video = $thumbnail.find('[data-html5-video]');
    var $youtubeVideo = $thumbnail.find('[data-youtube-video]');
    var videoID;
    if ($html5Video.length > 0) {
      videoID = $html5Video.find('[data-plyr-video-id]').data('plyr-video-id');
    } else if ($youtubeVideo.length > 0) {
      videoID = $youtubeVideo.find('iframe').attr('id');
    }
    if (videoID) {
      $.each(videoPlayers, function (index, player) {
        if (player.id == videoID || player.media.id == videoID) {
          if (player.playing) {
            player.pause();
          }
        }
      });
    }
  }
};