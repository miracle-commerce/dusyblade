/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsCollection = {
  init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsCollection = $.extend(this, window.PXUTheme.getSectionData($section));

    // function to check if browser is IE
    var isIE11 = !!navigator.userAgent.match(/Trident.*rv\:11\./);

    // Ensure product media libraries are present
    if (!isIE11) {
      window.Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
        },
        {
          name: 'model-viewer-ui',
          version: '1.0',
        }
      ],)
    }

    if (this.enable_sorting == true) {
      $('#sort-by').val($('#sort-by').data('default-sort'));
    }

    if (this.enable_filter == true || this.enable_sorting == true) {
      $('#tag_filter, #sort-by').on('change', function() {
        window.PXUTheme.jsCollection.filterURL();
      });
    }

    if ($('[data-option-filter]').length) {
      // Show enabled filter tags based on selected checkboxes
      $('[data-tag-filter-checkbox]:checked').each(function(){
        window.PXUTheme.jsCollection.multiTagFilter.showSelectedFilter($(this));
      })
    }

    // If breadcrumbs enabled and basic pagination is set, call breadcrumbs object
    if (this.enable_breadcrumb && this.pagination_type == 'basic_pagination') {
      window.PXUTheme.breadcrumbs.init(this.number_of_pages);
    }

    /* Collection sidebar filter */
    $('body').on('click', '[data-option-filter]', function(e) {
      e.preventDefault();

      $(this).find('input').prop('checked', true);

      window.PXUTheme.jsCollection.multiTagFilter.init($(this));
      window.PXUTheme.scrollToTop($('.collection__content'));
    });

    $('body').on('click', '[data-clear-filter]', function () {
      const $el = $(this).siblings('[data-option-filter]');
      const $productTagFilter = $('#tag_filter');

      $productTagFilter.find('option:eq(0)').prop('selected', true);
      window.PXUTheme.jsCollection.multiTagFilter.clearSelectedFilter($el);
      window.PXUTheme.scrollToTop($('.collection__content'));

    });
  },
  filterURL: function() {

    var selectedOptions = [],
        query = '',
        currentTags = '',
        siteUrl = 'https://' + $.url('hostname');

    // check if language has been translated. Length equals one when default language (eg: '/') and greater than 1 when language is translated (eg: '/fr')
    if (window.PXUTheme.routes.root_url.length > 1) {
      var url1 = $.url('1') ? '/' + $.url('1') + '/' : '';
      var url2 = $.url('2') ? $.url('2') + '/' : '';
      var url3 = $.url('3') ? $.url('3') + '/' : '';
      var path = url1 + url2 + url3;
    } else {
      var url1 = $.url('1') ? '/' + $.url('1') + '/' : '';
      var url2 = $.url('2') ? $.url('2') + '/' : '';
      var path = url1 + url2;
    }

    //Handle dropdowns if they exist
    if ($('#sort-by').length){
      query = $('#sort-by').val();
    } else {
      query = url('?sort_by');
    }

    if ($('#tag_filter').length){

      if ($('#tag_filter').data('default-collection') != $('#tag_filter').val()){
        var urlTag = $('#tag_filter').val().substr($('#tag_filter').val().lastIndexOf('/') + 1);

        if (urlTag != 'all'){
          if ($.inArray( urlTag, selectedOptions ) > -1){
            //Do nothing
          } else {
            selectedOptions.unshift(urlTag);
          }
        }
      }
    }

    //Add all checkbox values to array
    $('[data-option-filter] input:checked').each(function () {
      selectedOptions.push($(this).val());
    });

    selectedOptions = $.makeArray(selectedOptions);

    //Loop through tags to create string to update page url
    $.each(selectedOptions, function(i, value){

      if (i != selectedOptions.length - 1) {
        currentTags += selectedOptions[i] + '+';
      } else {
        currentTags += selectedOptions[i];
      }

    });

    window.PXUTheme.queryParameters.sort_by = query;
    query = '?' + $.param(window.PXUTheme.queryParameters);

    this.processUrl(path, currentTags, query);
  },
  processUrl: function (path, tags, query) {

    var query = query.replace(/\page=(\w+)&/, ''),
      urlString = '';

    urlString = path + tags + query;

    this.updateView(urlString);

  },
  updateView: function(filterURL) {
    $.ajax({
      type: 'GET',
      url: filterURL,
      beforeSend: function() {
        $('.collection-matrix').addClass('fadeOut animated loading-in-progress');
        $('.collection-matrix__wrapper .collection__loading-icon').fadeIn();
      },
      success: function(data) {
      },
      error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
        location.replace(location.protocol + '//' + location.host + filterURL);

      },
      dataType: "html"
    }).then(function(data){

      const $breadcrumbContainer = $('.breadcrumb__container');
      const $collectionMatrix = $('.collection-matrix');
      const $collectionMain = $('[data-collection-main]');

      // Get and set new breadcrumb html
      const filteredBreadcrumb = $(data).find('.breadcrumb__container').html();
      $breadcrumbContainer.html(filteredBreadcrumb);

      // Remove loading animation
      $collectionMatrix.removeClass('fadeIn animated loading-in-progress');

      // Check for products
      const filteredData = $(data).find('.collection-matrix__wrapper');
      const filteredPageLinks = $(data).find('.container--pagination');
      const noProducts = $(data).find('.container--no-products-in-collection');

      if (filteredData.length) {
        // Add products to container
        $collectionMain.empty();
        $collectionMain.append(filteredData);
      } else {
        // Display no product message
        $collectionMain.empty();
        $collectionMain.append(noProducts);
      }

      $collectionMain.append(filteredPageLinks);

      window.history && window.history.pushState && window.history.pushState("", "", filterURL);

      // Initiate infinite scrolling on new products appended to collection grid
      if ($('[data-custom-pagination]').length) {
        window.PXUTheme.infiniteScroll.init();
      }

    });
  },
  multiTagFilter: {
    init: function ($el) {

      // Show filter and hide siblings
      this.showSelectedFilter($el);

      // Update url
      window.PXUTheme.jsCollection.filterURL();

      var urlIndex;
      if (window.PXUTheme.routes.root_url.length > 1) {
        urlIndex = 3
      } else {
        urlIndex = 2
      }

      // Hide filters if types or vendors is in URL (can't be combined)
      if ($.url(urlIndex) === 'types' || $.url(urlIndex) === 'vendors') {
        $('.block__tag-filter').remove();
      }

    },
    showSelectedFilter: function ($el) {
      const $sidebarToggleBlock = $el.parents('.sidebar-toggle-active');
      const $filterItem = $el.parents('.tag-filter__item');

      $filterItem.addClass('is-active');
      $filterItem.siblings(':not(.is-active)').addClass('is-hidden');
      $filterItem.find('[data-clear-filter]').removeClass('is-hidden');

      // If sidebar toggle is enabled, show filter in sidebar content
      if ($sidebarToggleBlock.length) {
        let $toggleBtn = $sidebarToggleBlock.find('[data-sidebar-block__toggle="closed"]');

        window.PXUTheme.jsSidebar.openSidebarBlock($toggleBtn);
      }

    },
    clearSelectedFilter: function ($el) {

      const $filterItem = $el.parents('.tag-filter__item');

      $filterItem.removeClass('is-active')
            .find('input').prop("checked", false);
      $filterItem.siblings()
            .removeClass('is-hidden');
      $filterItem.find('[data-clear-filter]')
            .addClass('is-hidden');

      //Update url
      window.PXUTheme.jsCollection.filterURL();
    }
  },
  unload: function($section) {
    $('#tag_filter, #sort-by').off();
    $('[data-option-filter]').off();
    $('[data-reset-filters]').off();
    $('[data-clear-filter]').off();
    window.PXUTheme.breadcrumbs.unload();
  }
}

/******/ })()
;