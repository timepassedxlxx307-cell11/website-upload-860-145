(function () {
    "use strict";

    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (navToggle && mobileMenu) {
        navToggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var grid = document.querySelector("[data-filter-grid]");

    if (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));
        var searchInput = document.querySelector("[data-search-input]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var regionFilter = document.querySelector("[data-region-filter]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (searchInput && query) {
            searchInput.value = query;
        }

        function matchCard(card) {
            var text = (card.getAttribute("data-search-text") || "").toLowerCase();
            var type = card.getAttribute("data-type") || "";
            var region = card.getAttribute("data-region") || "";
            var year = card.getAttribute("data-year") || "";
            var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var typeValue = typeFilter ? typeFilter.value : "";
            var regionValue = regionFilter ? regionFilter.value : "";
            var yearValue = yearFilter ? yearFilter.value : "";

            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (typeValue && type !== typeValue) {
                return false;
            }
            if (regionValue && region.indexOf(regionValue) === -1) {
                return false;
            }
            if (yearValue && year !== yearValue) {
                return false;
            }
            return true;
        }

        function updateGrid() {
            var visible = 0;

            cards.forEach(function (card) {
                var matched = matchCard(card);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", updateGrid);
                control.addEventListener("change", updateGrid);
            }
        });

        updateGrid();
    }
})();
