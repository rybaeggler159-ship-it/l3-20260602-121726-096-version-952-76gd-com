(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('#site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = body.classList.toggle('nav-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-target-slide') || 0);
      showSlide(index);
      window.clearInterval(timer);
      timer = null;
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var form = document.querySelector('#search-form');
  var input = document.querySelector('#search-input');
  var results = document.querySelector('#search-results');
  var title = document.querySelector('#search-title');
  var count = document.querySelector('#search-count');

  function movieCard(item) {
    var tags = (item.tags || '').split(/[,，、/\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="score">' + escapeHtml(String(item.score)) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(item.year_text) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(item.one_line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function runSearch(items, keyword) {
    var query = keyword.trim().toLowerCase();
    var filtered = items;

    if (query) {
      filtered = items.filter(function (item) {
        return [item.title, item.region, item.type, item.genre, item.tags, item.year_text, item.one_line]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      });
    }

    var displayItems = filtered.slice(0, 120);
    results.innerHTML = displayItems.map(movieCard).join('');
    title.textContent = query ? '“' + keyword + '” 的搜索结果' : '推荐片单';
    count.textContent = '匹配到 ' + filtered.length + ' 部影片，当前展示 ' + displayItems.length + ' 部。';
  }

  if (form && input && results) {
    fetch('./assets/search-index.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (items) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        runSearch(items, initial);

        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var value = input.value || '';
          var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
          window.history.replaceState(null, '', url);
          runSearch(items, value);
        });
      });
  }
})();
