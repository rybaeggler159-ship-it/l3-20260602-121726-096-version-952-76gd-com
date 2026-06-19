(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function initCardFilter() {
    var form = document.querySelector('[data-filter-form]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }
    var keyword = form.querySelector('[name="keyword"]');
    var genre = form.querySelector('[name="genre"]');
    var year = form.querySelector('[name="year"]');
    var region = form.querySelector('[name="region"]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }
    function apply() {
      var q = normalize(keyword && keyword.value);
      var g = normalize(genre && genre.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region'));
        var pass = true;
        if (q && text.indexOf(q) === -1) {
          pass = false;
        }
        if (g && normalize(card.getAttribute('data-genre')).indexOf(g) === -1) {
          pass = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          pass = false;
        }
        if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
          pass = false;
        }
        card.style.display = pass ? '' : 'none';
      });
    }
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-input]');
    var type = document.querySelector('[data-search-type]');
    var result = document.querySelector('[data-search-result]');
    if (!input || !result || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    function buildCard(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '">',
        '    <img src="' + item.img + '" alt="' + item.title + '" loading="lazy">',
        '    <span class="card-badge">' + item.year + '</span>',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-title" href="' + item.url + '">' + item.title + '</a>',
        '    <p class="movie-meta">' + item.region + ' · ' + item.type + '</p>',
        '    <p class="movie-genre">' + item.genre + '</p>',
        '    <p class="movie-desc">' + item.line + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }
    function search() {
      var q = input.value.trim().toLowerCase();
      var t = type ? type.value : '';
      var items = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.genre, item.region, item.type, item.tags, item.line].join(' ').toLowerCase();
        var matchedKeyword = q ? text.indexOf(q) !== -1 : true;
        var matchedType = t ? item.type.indexOf(t) !== -1 || item.genre.indexOf(t) !== -1 : true;
        return matchedKeyword && matchedType;
      }).slice(0, 120);
      if (!items.length) {
        result.innerHTML = '<div class="search-empty">没有匹配内容</div>';
        return;
      }
      result.innerHTML = items.map(buildCard).join('');
    }
    input.addEventListener('input', search);
    if (type) {
      type.addEventListener('change', search);
    }
    search();
  }

  function initPlayer() {
    var wrap = document.querySelector('[data-player]');
    if (!wrap) {
      return;
    }
    var video = wrap.querySelector('video');
    var cover = wrap.querySelector('[data-player-cover]');
    var button = wrap.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-src') : '';
    var started = false;
    if (!video || !source) {
      return;
    }
    function attach() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        window.__activeHls = hls;
        return Promise.resolve();
      }
      video.src = source;
      return Promise.resolve();
    }
    function play() {
      attach().then(function () {
        var playing = video.play();
        if (playing && playing.catch) {
          playing.catch(function () {});
        }
        if (cover) {
          cover.classList.add('hidden');
        }
      });
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', play);
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
    initPlayer();
  });
})();
