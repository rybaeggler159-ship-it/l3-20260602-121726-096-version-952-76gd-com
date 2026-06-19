(function () {
  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachSource(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        video.src = source;
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    });
  }

  window.setupMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hasLoaded = false;

    if (!video || !button || !source) {
      return;
    }

    function play() {
      button.classList.add('hidden');

      var ready = hasLoaded ? Promise.resolve() : attachSource(video, source).then(function () {
        hasLoaded = true;
      });

      ready.then(function () {
        return video.play();
      }).catch(function () {
        button.classList.remove('hidden');
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('hidden');
      }
    });
  };
})();
