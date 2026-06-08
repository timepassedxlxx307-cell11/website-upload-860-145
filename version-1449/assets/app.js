(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function textValue(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"], input[type="text"]');
                var query = input ? input.value.trim() : '';
                var url = './search.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('is-active', currentIndex === index);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle('is-active', currentIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupScroller() {
        var controls = document.querySelectorAll('[data-scroll-control]');
        controls.forEach(function (control) {
            control.addEventListener('click', function () {
                var id = control.getAttribute('data-scroll-control');
                var direction = control.getAttribute('data-direction') === 'left' ? -1 : 1;
                var target = document.querySelector('[data-scroll-target="' + id + '"]');
                if (target) {
                    target.scrollBy({ left: direction * 420, behavior: 'smooth' });
                }
            });
        });
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-empty-result]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function apply() {
            var query = textValue(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = textValue(card.getAttribute('data-keywords'));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle('is-filtered', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('hidden', visible !== 0);
            }
        }
        input.addEventListener('input', apply);
        apply();
    }

    function setupPageFilter() {
        var input = document.querySelector('[data-page-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener('input', function () {
            var query = textValue(input.value);
            cards.forEach(function (card) {
                var haystack = textValue(card.getAttribute('data-keywords'));
                card.classList.toggle('is-filtered', query && haystack.indexOf(query) === -1);
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupScroller();
        setupSearchPage();
        setupPageFilter();
    });

    window.initializeMoviePlayer = function (url) {
        var frame = document.querySelector('[data-player]');
        if (!frame || !url) {
            return;
        }
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('[data-play-overlay]');
        var button = frame.querySelector('[data-play-button]');
        var attached = false;
        var hls;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function begin() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                begin();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                if (!attached) {
                    begin();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
