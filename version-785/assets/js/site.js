(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var areas = document.querySelectorAll("[data-filter-area]");
    areas.forEach(function (area) {
      var keyword = area.querySelector("[data-filter-keyword]");
      var selects = Array.prototype.slice.call(area.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-filter-card]"));
      var empty = area.querySelector("[data-filter-empty]");

      function valueOf(name) {
        var field = area.querySelector('[data-filter-select="' + name + '"]');
        return field ? field.value : "";
      }

      function apply() {
        var text = keyword ? keyword.value.trim().toLowerCase() : "";
        var region = valueOf("region");
        var year = valueOf("year");
        var type = valueOf("type");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var matched = true;
          if (text && haystack.indexOf(text) === -1) {
            matched = false;
          }
          if (region && region !== "all" && card.getAttribute("data-region") !== region) {
            matched = false;
          }
          if (year && year !== "all" && card.getAttribute("data-year") !== year) {
            matched = false;
          }
          if (type && type !== "all" && card.getAttribute("data-type") !== type) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      if (keyword) {
        keyword.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim()) {
          return;
        }
        event.preventDefault();
        input.focus();
      });
    });
  }

  function createSearchCard(movie) {
    return [
      '<article class="movie-card movie-card--compact">',
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '    <span class="movie-card__shade"></span>',
      '    <span class="play-circle">▶</span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-card__meta">',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_INDEX) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var resultBox = page.querySelector("[data-search-results]");
    var empty = page.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var results = window.MOVIE_INDEX.filter(function (movie) {
        if (!query) {
          return true;
        }
        return [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 120);

      if (resultBox) {
        resultBox.innerHTML = results.map(createSearchCard).join("");
      }
      if (empty) {
        empty.style.display = results.length ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchForms();
    initSearchPage();
  });
}());
