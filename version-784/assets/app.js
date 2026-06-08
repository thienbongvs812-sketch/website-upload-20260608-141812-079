(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        selectAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function filterCards(input, list, emptyState) {
        var term = input.value.trim().toLowerCase();
        var cards = selectAll(".movie-card", list);
        var hasResult = false;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            var matched = !term || haystack.indexOf(term) !== -1;
            card.hidden = !matched;
            if (matched) {
                hasResult = true;
            }
        });
        if (emptyState) {
            emptyState.hidden = hasResult;
        }
    }

    function setupLocalFilters() {
        selectAll("[data-local-filter]").forEach(function (input) {
            var section = input.closest("main") || document;
            var list = section.querySelector("[data-filter-list]");
            var emptyState = section.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            input.addEventListener("input", function () {
                filterCards(input, list, emptyState);
            });
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var list = document.querySelector("[data-search-results]");
        var emptyState = document.querySelector("[data-empty-state]");
        if (!input || !list) {
            return;
        }
        var query = new URLSearchParams(window.location.search).get("q") || "";
        input.value = query;
        filterCards(input, list, emptyState);
        input.addEventListener("input", function () {
            filterCards(input, list, emptyState);
        });
    }

    function setupPlayers() {
        selectAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var trigger = shell.querySelector("[data-play-trigger]");
            if (!video) {
                return;
            }

            function play() {
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                shell.classList.add("is-playing");
                if (video.getAttribute("data-ready") === "true") {
                    video.play().catch(function () {});
                    return;
                }
                video.setAttribute("data-ready", "true");
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            shell.classList.remove("is-playing");
                            video.setAttribute("data-ready", "false");
                        }
                    });
                    shell.hlsPlayer = hls;
                    return;
                }
                video.src = stream;
                video.play().catch(function () {});
            }

            if (trigger) {
                trigger.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove("is-playing");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupSearchForms();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
