(function() {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let activeIndex = 0;
    let timer = null;

    const showSlide = function(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    };

    const play = function() {
      timer = window.setInterval(function() {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    const restart = function() {
      window.clearInterval(timer);
      play();
    };

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(activeIndex + 1);
        restart();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showSlide(dotIndex);
        restart();
      });
    });

    play();
  }

  const filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    const textInput = filterPanel.querySelector("[data-filter-text]");
    const categorySelect = filterPanel.querySelector("[data-filter-category]");
    const regionSelect = filterPanel.querySelector("[data-filter-region]");
    const yearSelect = filterPanel.querySelector("[data-filter-year]");
    const cards = Array.from(document.querySelectorAll("[data-card-list] .movie-card, [data-card-list] .wide-list-card"));
    const query = new URLSearchParams(window.location.search).get("q") || "";

    if (textInput && query) {
      textInput.value = query;
    }

    const normalize = function(value) {
      return String(value || "").trim().toLowerCase();
    };

    const applyFilter = function() {
      const text = normalize(textInput ? textInput.value : "");
      const category = normalize(categorySelect ? categorySelect.value : "");
      const region = normalize(regionSelect ? regionSelect.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");

      cards.forEach(function(card) {
        const searchText = normalize(card.dataset.search);
        const cardCategory = normalize(card.dataset.category);
        const cardRegion = normalize(card.dataset.region);
        const cardYear = normalize(card.dataset.year);
        const matched = (!text || searchText.includes(text)) &&
          (!category || cardCategory === category) &&
          (!region || cardRegion === region) &&
          (!year || cardYear === year);

        card.classList.toggle("is-hidden", !matched);
      });
    };

    [textInput, categorySelect, regionSelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  const backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function() {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    });

    backTop.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
})();
