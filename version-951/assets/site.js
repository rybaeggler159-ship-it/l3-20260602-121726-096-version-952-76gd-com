(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      showSlide(0);
      startTimer();
    }

    var playerBox = document.querySelector("[data-player]");
    if (playerBox) {
      var video = playerBox.querySelector("video[data-video-url]");
      var startButton = playerBox.querySelector("[data-player-start]");
      var hlsInstance = null;

      function attachSource() {
        if (!video) {
          return;
        }
        var source = video.getAttribute("data-video-url");
        if (!source || video.getAttribute("data-bound") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute("data-bound", "1");
      }

      function playVideo() {
        attachSource();
        playerBox.classList.add("playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            playerBox.classList.remove("playing");
          });
        }
      }

      if (startButton && video) {
        startButton.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          playerBox.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            playerBox.classList.remove("playing");
          }
        });
        video.addEventListener("ended", function () {
          playerBox.classList.remove("playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    var results = document.querySelector("[data-search-results]");
    var searchInput = document.querySelector("[data-search-input]");
    var searchTitle = document.querySelector("[data-search-title]");
    var searchSubtitle = document.querySelector("[data-search-subtitle]");

    if (results && window.SITE_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      if (searchInput) {
        searchInput.value = query;
      }

      function createCard(movie) {
        var tags = [movie.region, movie.type, movie.genre].filter(Boolean).join(" · ");
        return "" +
          "<a class=\"movie-card compact\" href=\"" + movie.url + "\">" +
          "<div class=\"poster-wrap\">" +
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<div class=\"poster-shade\"></div>" +
          "<span class=\"badge top-left\">" + escapeHtml(movie.type) + "</span>" +
          "<span class=\"badge top-right\">" + escapeHtml(movie.year) + "</span>" +
          "<span class=\"play-icon\">▶</span>" +
          "</div>" +
          "<div class=\"card-body\">" +
          "<h3>" + escapeHtml(movie.title) + "</h3>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"card-meta\"><span>" + escapeHtml(tags) + "</span></div>" +
          "</div>" +
          "</a>";
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      if (query) {
        var normalized = query.toLowerCase();
        var matched = window.SITE_MOVIES.filter(function (movie) {
          var haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.genre,
            movie.oneLine,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase();
          return haystack.indexOf(normalized) !== -1;
        }).slice(0, 200);

        if (searchTitle) {
          searchTitle.textContent = "搜索结果";
        }
        if (searchSubtitle) {
          searchSubtitle.textContent = "关键词：“" + query + "”，共显示 " + matched.length + " 条匹配内容。";
        }
        results.innerHTML = matched.length ? matched.map(createCard).join("") : "<p class=\"empty-result\">没有找到匹配内容。</p>";
      }
    }
  });
})();
