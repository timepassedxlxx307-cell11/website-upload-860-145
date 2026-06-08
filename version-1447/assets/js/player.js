(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setup(box) {
    var video = box.querySelector('video');
    var panel = box.querySelector('[data-play-panel]');
    var button = box.querySelector('[data-play-button]');
    var url = box.getAttribute('data-play-url');
    var hls = null;

    function begin() {
      if (!video || !url) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = url;
      }
      video.controls = true;
      if (panel) {
        panel.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (panel) {
            panel.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }
    if (panel) {
      panel.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setup);
  });
})();
