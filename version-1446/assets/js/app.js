(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function escapeText(value) {
        return String(value || "").replace(/[&<>"']/g, function(mark) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[mark];
        });
    }

    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function() {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var next = carousel.querySelector(".hero-next");
        var prev = carousel.querySelector(".hero-prev");
        var index = 0;
        var timer = null;
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function(slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function(dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        function autoplay() {
            clearInterval(timer);
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                autoplay();
            });
        }
        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                autoplay();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-slide") || "0"));
                autoplay();
            });
        });
        carousel.addEventListener("mouseenter", function() {
            clearInterval(timer);
        });
        carousel.addEventListener("mouseleave", autoplay);
        autoplay();
    }

    function initFilters() {
        var bar = document.querySelector("[data-filter-bar]");
        var list = document.querySelector("[data-filter-list]");
        if (!bar || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-btn"));
        var input = bar.querySelector(".inline-filter");
        var typeValue = "全部";
        var queryValue = "";
        function apply() {
            cards.forEach(function(card) {
                var type = card.getAttribute("data-type") || "";
                var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
                var typeMatch = typeValue === "全部" || type.indexOf(typeValue) !== -1 || keywords.indexOf(typeValue.toLowerCase()) !== -1;
                var queryMatch = !queryValue || keywords.indexOf(queryValue) !== -1;
                card.classList.toggle("is-hidden", !(typeMatch && queryMatch));
            });
        }
        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                buttons.forEach(function(item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                typeValue = button.getAttribute("data-filter") || "全部";
                apply();
            });
        });
        if (input) {
            input.addEventListener("input", function() {
                queryValue = input.value.trim().toLowerCase();
                apply();
            });
        }
    }

    function searchCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function(tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeText(movie.url) + "\">" +
            "<span class=\"poster-frame\"><img src=\"" + escapeText(movie.cover) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"movie-badge\">" + escapeText(movie.category) + "</span><span class=\"play-ring\">▶</span></span>" +
            "<span class=\"movie-info\"><span class=\"movie-meta\">" + escapeText(movie.year) + " · " + escapeText(movie.region) + " · " + escapeText(movie.type) + "</span><strong>" + escapeText(movie.title) + "</strong><span class=\"movie-desc\">" + escapeText(movie.description) + "</span><span class=\"tag-row\">" + tags + "</span></span>" +
            "</a>";
    }

    function initSearchPage() {
        var box = document.getElementById("search-results");
        if (!box || !window.SITE_MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var pageInput = document.querySelector(".page-search input[name='q']");
        if (pageInput) {
            pageInput.value = params.get("q") || "";
        }
        var source = window.SITE_MOVIE_INDEX;
        var results = query ? source.filter(function(movie) {
            return movie.keywords.toLowerCase().indexOf(query) !== -1;
        }) : source.slice(0, 48);
        box.innerHTML = results.slice(0, 120).map(searchCard).join("");
        if (!results.length) {
            box.innerHTML = "<div class=\"empty-state\"><h2>未找到匹配影片</h2><p>可以换一个片名、类型、地区或年份继续搜索。</p><a class=\"primary-btn\" href=\"./categories.html\">浏览分类</a></div>";
        }
    }

    ready(function() {
        initNav();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
