/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsMap = {
  init: function($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsMap = $.extend(this, window.PXUTheme.getSectionData($section));

    let mapData = {
      address: this.map_address,
      apikey: this.api_key,
      sectionid: this.id,
      showpin: this.show_pin,
      zoom: this.zoom_level,
      map_style: this.map_style
    };

    // Enable caching to avoid duplicate google maps files
    $.ajaxSetup({ cache: true });

    if (mapData.apikey) {
      // Load maps script and find location coordinates
      $.getScript(
        'https://maps.googleapis.com/maps/api/js?key=' + mapData.apikey
      ).then(function () {
        window.PXUTheme.jsMap.findLocation(mapData);
        $.ajaxSetup({ cache: false });
      });
    }
  },
  findLocation: function(mapData) {
    let geoLat;
    let geoLng;
    let geocoder = new google.maps.Geocoder();

    // Find and set coordinates
    geocoder.geocode({ address: mapData.address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        geoLat = results[0].geometry.location.lat();
        geoLng = results[0].geometry.location.lng();

        // Create map
        window.PXUTheme.jsMap.initMap(geoLat, geoLng, mapData);
      } else {
        console.log('Error:' + status);
      }
    });
  },
  initMap: function(lat, lng, mapData) {
    let location = { lat: lat, lng: lng };
    let styleJson = JSON.parse(mapData.map_style);

    // Set map options
    let mapOptions = {
      zoom: mapData.zoom,
      center: location,
      styles: styleJson,
      disableDefaultUI: false
    };

    // Create map
    let map = new google.maps.Map(
      document.getElementById(mapData.sectionid),
      mapOptions
    );

    // Show pin
    if (mapData.showpin == true) {
      let marker = new google.maps.Marker({
        position: location,
        map: map
      });
    }
  },
  unload: function($section) {
  }
}

/******/ })()
;