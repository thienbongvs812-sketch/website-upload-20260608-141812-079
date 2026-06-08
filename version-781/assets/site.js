(function () {
    var MovieSite = {};

    MovieSite.initMenu = function () {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    };

    MovieSite.initCarousel = function () {
        var root = document.querySelector('[data-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-slide-to')) || 0;
                show(nextIndex);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    };

    MovieSite.initFilters = function () {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        var input = document.querySelector('[data-search-input]');
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var empty = document.querySelector('[data-empty-result]');
        if (!lists.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var activeFilters = {};
            filters.forEach(function (select) {
                var key = select.getAttribute('data-filter');
                activeFilters[key] = normalize(select.value);
            });

            var visible = 0;
            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-channel'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesFilters = Object.keys(activeFilters).every(function (key) {
                        return !activeFilters[key] || normalize(card.getAttribute('data-' + key)).indexOf(activeFilters[key]) !== -1;
                    });
                    var isVisible = matchesKeyword && matchesFilters;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        filters.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    };

    MovieSite.initPlayer = function (source) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('play-overlay');
        var frame = document.getElementById('player-frame');
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }
        if (frame) {
            frame.addEventListener('click', function (event) {
                if (event.target === frame || event.target === video) {
                    startPlayback();
                }
            });
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    window.MovieSite = MovieSite;

    document.addEventListener('DOMContentLoaded', function () {
        MovieSite.initMenu();
        MovieSite.initCarousel();
        MovieSite.initFilters();
    });
})();
