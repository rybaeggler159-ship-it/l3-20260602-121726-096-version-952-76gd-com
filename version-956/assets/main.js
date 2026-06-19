(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var tools = document.querySelector('[data-library-tools]');
  var list = document.querySelector('[data-card-list]');

  if (tools && list) {
    var search = tools.querySelector('[data-card-search]');
    var filters = Array.prototype.slice.call(tools.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = tools.querySelector('[data-empty-state]');

    if (search && query) {
      search.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var text = normalize(search ? search.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-keywords'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));

        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }

        filters.forEach(function (filter) {
          var key = filter.getAttribute('data-filter');
          var value = normalize(filter.value);

          if (value && normalize(card.getAttribute('data-' + key)) !== value) {
            ok = false;
          }
        });

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
