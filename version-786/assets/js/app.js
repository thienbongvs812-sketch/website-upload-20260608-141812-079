
(function() {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.querySelector("#navLinks");
        if (!toggle || !links) {
            return;
        }

        toggle.addEventListener("click", function() {
            var opened = links.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll(".header-search");
        forms.forEach(function(form) {
            form.addEventListener("submit", function(event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function setupFilters() {
        var panels = document.querySelectorAll(".filter-panel");
        panels.forEach(function(panel) {
            var scope = panel.nextElementSibling ? panel.nextElementSibling.querySelector(".filter-scope") : null;
            if (!scope) {
                scope = document.querySelector(".filter-scope");
            }
            if (!scope) {
                return;
            }

            var input = panel.querySelector(".movie-search-input");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll(".chip-filter"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
            var activeFilter = "all";

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function(card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilter));
                });
            }

            buttons.forEach(function(button) {
                button.addEventListener("click", function() {
                    buttons.forEach(function(item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeFilter = button.getAttribute("data-filter") || "all";
                    apply();
                });
            });

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
                input.addEventListener("input", apply);
            }

            apply();
        });
    }

    ready(function() {
        setupNavigation();
        setupHeaderSearch();
        setupHero();
        setupFilters();
    });
})();
