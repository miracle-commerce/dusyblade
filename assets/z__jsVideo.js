/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
window.PXUTheme.jsVideo = {
  init: function ($section) {

    // Add settings from schema to current object
    window.PXUTheme.jsVideo = $.extend(this, window.PXUTheme.getSectionData($section));

    // Selectors
    const $videoElement = $section.find('[data-video-element]');
    const $playIcon = $section.find('.plyr--paused.plyr--video .plyr__control--overlaid');
    const $playButton = $section.find('[data-play-button]');
    const $videoTextContainer = $section.find('[data-video-text-container]');
    const $imageElement = $section.find('[data-image-element]');

    // Load video if the media has been added
    if (this.iframe_video || this.html5_video) {
      this.loadVideo($videoElement, $playIcon, $playButton, $videoTextContainer, $imageElement);
    } else {
      $imageElement.show();
    }

  },
  loadVideo: function($videoElement, $playIcon, $playButton, $videoTextContainer, $imageElement) {
    const player = new Plyr(`.video-${this.id}`, {
      controls: videoControls,
      loop: {
        active: this.autoloop
      },
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: true
      },
      storage: {
        enabled: false
      }
    });

    player.muted = this.mute;
    player.ratio = this.aspect_ratio;

    // If autoplay enabled, hide image and text
    if (this.autoplay) {
      player.autoplay = true;
      $imageElement.hide();
      $videoTextContainer.hide();
      $videoElement.show();
    } else {
      // If autoplay disabled, check if poster image added
      if (this.poster) {
        $videoElement.hide();
        $imageElement.show();
        $videoTextContainer.show();
      } else {
        // If autoplay disabled and no poster image
        $imageElement.hide();
        $videoElement.show();
        $videoTextContainer.show();
      }
    }

    // If button exists, clicking button will play video
    if (this.button) {
      $playButton.on('click', () =>  {
        player.play();
      })
    }

    // Clicking anywhere on video should play the video
    if (!this.button) {
      $videoTextContainer.on('click', () => {
        player.play();
      })
    }

    // If on mobile and text is below image, clicking the image wrapper should play the video
    if (!isScreenSizeLarge() && $videoElement.parents('.mobile-text--below-media')) {
      $imageElement.on('click', () => {
        player.play();
      })
    }

    // On player ready, hide play icon if play button visible
    player.on('ready', function(index, player) {
      if ($playButton && !isScreenSizeLarge() && $videoElement.parents('.mobile-text--below-media')) {
        $playIcon.show();
      } else if ($playButton) {
        $playIcon.hide();
      } else {
        $playIcon.show();
      }
    })

    // On play, hide image/text and show video element
    player.on('play', function(index, player) {
      $videoElement.show();
      $imageElement.hide();
      $videoTextContainer.hide();
    })

    // On player pause, show play icon if play button hidden
    player.on('pause', function(index, player) {
      if (!$playButton) {
        $playIcon.show();
      }
    })

  },
  unload: function($section) {
    const $playButton = $section.find('[data-play-button]');
    const $videoTextContainer = $section.find('[data-video-text-container]');

    $playButton.off();
    $videoTextContainer.off();
  }
}

/******/ })()
;