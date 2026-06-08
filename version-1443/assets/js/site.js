(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', root);
        var dots = selectAll('[data-hero-dot]', root);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (slides.length > 1) {
            restart();
        }
    }

    function setupFiltering() {
        var input = document.querySelector('[data-card-filter]');
        var cards = selectAll('[data-search-card]');
        var empty = document.querySelector('[data-empty-state]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial && !input.value) {
            input.value = initial;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.textContent);
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        var form = input.closest('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFiltering();
    });
})();
