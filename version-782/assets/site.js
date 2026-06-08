(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFiltering() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var year = document.querySelector("[data-year-filter]");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      input.value = initialQuery;
    }
    function apply() {
      var keyword = normalize(input.value);
      var selectedYear = year ? normalize(year.value) : "";
      items.forEach(function (item) {
        var text = normalize(item.getAttribute("data-search"));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || text.indexOf(selectedYear) !== -1;
        item.classList.toggle("is-hidden", !(matchesKeyword && matchesYear));
      });
    }
    input.addEventListener("input", apply);
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-video-src]");
      var button = shell.querySelector("[data-player-start]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-video-src");
      var started = false;
      function bindSource() {
        if (started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function playVideo(event) {
        if (event && event.target && event.target.tagName === "VIDEO") {
          return;
        }
        bindSource();
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", playVideo);
      }
      shell.addEventListener("click", playVideo);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
