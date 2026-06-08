(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-back-to-top]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupListFilters() {
    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('.js-list-filter'));
    filterBlocks.forEach(function (block) {
      var targetId = block.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-id]'));
      var keywordInput = block.querySelector('[data-filter-keyword]');
      var yearSelect = block.querySelector('[data-filter-year]');
      var typeSelect = block.querySelector('[data-filter-type]');
      var count = block.querySelector('[data-filter-count]');

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
          var shouldShow = matchesKeyword && matchesYear && matchesType;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function movieCardHtml(movie) {
    return [
      '<article class="movie-card" data-movie-id="', movie.id, '">',
      '<a href="', movie.url, '" aria-label="观看', escapeHtml(movie.title), '">',
      '<div class="movie-cover-wrap">',
      '<img src="', movie.cover, '" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<span class="movie-duration">', escapeHtml(movie.duration), '</span>',
      '<span class="movie-score">★ ', escapeHtml(movie.rating), '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>', escapeHtml(movie.title), '</h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="movie-meta"><span>', escapeHtml(movie.region), ' · ', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.type), '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-result-count]');
    var input = document.querySelector('[data-search-page-input]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (!keyword) {
          return false;
        }
        return normalize(movie.searchText).indexOf(keyword) !== -1;
      }).slice(0, 200);
      results.innerHTML = matches.length
        ? matches.map(movieCardHtml).join('')
        : '<p class="empty-state">请输入关键词，或换一个影片名、地区、年份、标签再试。</p>';
      if (count) {
        count.textContent = String(matches.length);
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-video-player'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.js-player-button');
      var status = shell.querySelector('.js-player-status');
      var source = shell.getAttribute('data-src');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function attachSource() {
        if (!video || !source || video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('正在使用浏览器原生播放。');
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试。');
            }
          });
          setStatus('播放源已准备。');
        } else {
          video.src = source;
          setStatus('当前浏览器兼容性有限，已尝试直接播放。');
        }
        video.setAttribute('data-ready', 'true');
      }

      function play() {
        attachSource();
        if (!video) {
          return;
        }
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupBackToTop();
    setupHero();
    setupListFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
