(function () {
    var html = document.documentElement;
    var base = html.getAttribute("data-base") || "./";

    function withBase(url) {
        if (!url) {
            return base;
        }
        if (/^(https?:|#|\/)/.test(url)) {
            return url;
        }
        return base + url.replace(/^\.\//, "");
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            }, { once: true });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        var carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
        }
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
        var data = window.SEARCH_INDEX || [];
        inputs.forEach(function (input) {
            var shell = input.closest(".search-shell");
            var panel = shell ? shell.querySelector(".search-results") : null;
            if (!panel) {
                return;
            }

            function render() {
                var query = input.value.trim().toLowerCase();
                if (query.length < 1) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var matches = data.filter(function (item) {
                    var text = [item.title, item.year, item.genre, item.region, item.category].join(" ").toLowerCase();
                    return text.indexOf(query) !== -1;
                }).slice(0, 10);
                if (!matches.length) {
                    panel.classList.add("is-open");
                    panel.innerHTML = '<div class="search-empty">没有匹配结果</div>';
                    return;
                }
                panel.innerHTML = matches.map(function (item) {
                    return '<a class="search-result-item" href="' + withBase(item.url) + '">' +
                        '<span class="search-thumb"><img src="' + withBase(item.cover) + '" alt="' + escapeHtml(item.title) + '"></span>' +
                        '<span><strong class="search-title">' + escapeHtml(item.title) + '</strong>' +
                        '<em class="search-meta">' + escapeHtml(item.year + " · " + item.genre) + '</em></span>' +
                        '</a>';
                }).join("");
                panel.classList.add("is-open");
                setupImages();
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            document.addEventListener("click", function (event) {
                if (!shell.contains(event.target)) {
                    panel.classList.remove("is-open");
                }
            });
        });
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function setupPageFilter() {
        var queryInput = document.querySelector(".page-filter");
        var yearSelect = document.querySelector(".year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".page-movie-grid .movie-card"));
        if (!queryInput && !yearSelect) {
            return;
        }

        function apply() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var genre = (card.getAttribute("data-genre") || "").toLowerCase();
                var region = (card.getAttribute("data-region") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var textMatch = !query || title.indexOf(query) !== -1 || genre.indexOf(query) !== -1 || region.indexOf(query) !== -1;
                var yearMatch = !year || cardYear === year;
                card.style.display = textMatch && yearMatch ? "" : "none";
            });
        }

        if (queryInput) {
            queryInput.addEventListener("input", apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }
    }

    ready(function () {
        setupMenu();
        setupImages();
        setupHero();
        setupSearch();
        setupPageFilter();
    });
})();
