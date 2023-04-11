/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsSidebar = {
  init() {
    const facetedFilterForm = document.querySelector('[data-faceted-filter-form]');

    if (facetedFilterForm) {
      facetedFilterForm.addEventListener('change', e => {
        if (e.target.type === 'number') return;
        /*
          We need to ensure search params unrelated to the faceted filtering (eg. sorting or
          vendors collection) remain in the URL and only the faceted filtering params get updated.
          In order to do this, instead of submitting the `facetedFilterForm` form, we'll
          just get the faceted filter params we need from it and add it to the URL ourselves.
        */
        const formData = new FormData(facetedFilterForm);
        const facetedFilterSearchParams = new URLSearchParams(formData);
        const existingSearchParams = new URLSearchParams(window.location.search);
        const newSearchParams = new URLSearchParams();

        /*
          facetedFilterSearchParams.entries() and existingSearchParams.entries() return
          an iterator, and looping over them using a for-of loop causes an ESLint warning
          with the current config. Hence, we'll convert them into an array first.
        */
        Array.from(facetedFilterSearchParams.entries(), ([key, value]) => {
          newSearchParams.append(key, value);
          return null;
        });

        Array.from(existingSearchParams.entries(), ([key, value]) => {
          /*
            Do not set or update key-value pair if key is related to faceted filtering.
            This is to help prevent unrelated params (eg. sorting) from getting removed.
          */
          if (!key.includes('filter.p') && !key.includes('filter.v')) {
            newSearchParams.append(key, value);
          }
          return null;
        });

        window.location.search = newSearchParams.toString();
      });
    }

    const openSidebarBlocks = document.querySelectorAll('[data-sidebar-block__toggle="open"]');

    openSidebarBlocks.forEach(block => {
      window.PXUTheme.jsSidebar.openSidebarBlock($(block));
    });

    // eslint-disable-next-line func-names
    $('[data-has-toggle-option]').on('click', '[data-sidebar-block__toggle="closed"]', function (e) {
      e.preventDefault();
      window.PXUTheme.jsSidebar.openSidebarBlock($(this));
    });

    // eslint-disable-next-line func-names
    $('[data-has-toggle-option]').on('click', '[data-sidebar-block__toggle="open"]', function (e) {
      e.preventDefault();
      window.PXUTheme.jsSidebar.closeSidebarBlock($(this));
    });

    if ($('[data-product-sidebar]').length) {
      $('.section--has-sidebar-option').addClass('has-sidebar-enabled');
      $('.section--has-sidebar-option').removeClass('has-sidebar-disabled');
    } else {
      $('.section--has-sidebar-option').removeClass('has-sidebar-enabled');
      $('.section--has-sidebar-option').addClass('has-sidebar-disabled');
    }
  },
  openSidebarBlock($toggleBtn) {
    const $parentBlock = $toggleBtn.closest('.sidebar__block');

    $toggleBtn.attr('data-sidebar-block__toggle', 'open');

    $parentBlock.addClass('is-active');
    $parentBlock.attr('aria-expanded', true);
    $parentBlock.find('[data-sidebar-block__content--collapsible]').slideDown();
  },
  closeSidebarBlock($toggleBtn) {
    const $parentBlock = $toggleBtn.closest('.sidebar__block');

    $toggleBtn.attr('data-sidebar-block__toggle', 'closed');

    $parentBlock.removeClass('is-active');
    $parentBlock.attr('aria-expanded', false);
    $parentBlock.find('[data-sidebar-block__content--collapsible]').slideUp();
  },
  unload() {
    const $toggleBtn = $('[data-sidebar-block__toggle]');
    $toggleBtn.off();
  },
};

/******/ })()
;