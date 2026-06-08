(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                reset();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                reset();
            });
        }
        start();
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll('form[data-search-target]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = form.getAttribute('data-search-target') || 'search.html';
                window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
            });
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card compact-card">',
            '<a class="movie-card-link" href="' + item.url + '">',
            '<div class="movie-cover">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="cover-badge">' + escapeHtml(item.region) + '</span>',
            '<span class="play-dot">▶</span>',
            '</div>',
            '<div class="movie-card-body">',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="movie-meta">',
            '<span>' + escapeHtml(item.year) + '</span>',
            '<span>' + escapeHtml(item.type) + '</span>',
            '<span>' + escapeHtml(item.genre) + '</span>',
            '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initSearchPage() {
        var form = document.querySelector('[data-live-search]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-result-count]');
        if (!form || !results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = form.querySelector('input[name="q"]');
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        function render() {
            var query = (form.querySelector('input[name="q"]').value || '').trim().toLowerCase();
            var region = form.querySelector('select[name="region"]').value;
            var type = form.querySelector('select[name="type"]').value;
            var matched = window.SEARCH_INDEX.filter(function (item) {
                var hay = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
                var okQuery = !query || hay.indexOf(query) !== -1;
                var okRegion = !region || item.region.indexOf(region) !== -1 || item.tags.indexOf(region) !== -1;
                var okType = !type || item.type.indexOf(type) !== -1 || item.tags.indexOf(type) !== -1;
                return okQuery && okRegion && okType;
            }).slice(0, 120);
            results.innerHTML = matched.map(cardTemplate).join('');
            if (count) {
                count.textContent = matched.length ? '为你匹配到相关影片。' : '暂无匹配内容。';
            }
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        Array.prototype.slice.call(form.elements).forEach(function (element) {
            element.addEventListener('input', render);
            element.addEventListener('change', render);
        });
        render();
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var url = options.url;
        if (!video || !overlay || !url) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            attach();
            overlay.hidden = true;
            video.controls = true;
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {
                    overlay.hidden = false;
                });
            }
        }
        overlay.addEventListener('click', start);
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initSearchPage();
    });
})();
