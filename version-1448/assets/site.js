(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 6200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.card-filter'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.card-filter-select'));
    var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));

    function normalise(value) {
        return String(value || '').toLowerCase().trim();
    }

    function activeQuery() {
        var input = filterInputs.find(function (field) {
            return field.value;
        });
        return normalise(input ? input.value : '');
    }

    function activeYear() {
        var select = filterSelects.find(function (field) {
            return field.value;
        });
        return normalise(select ? select.value : '');
    }

    function filterCards() {
        var query = activeQuery();
        var year = activeYear();
        grids.forEach(function (grid) {
            Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .ranking-row')).forEach(function (card) {
                var haystack = normalise([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category')
                ].join(' '));
                var cardYear = normalise(card.getAttribute('data-year'));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || cardYear.indexOf(year) !== -1;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        });
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', filterCards);
    });

    filterSelects.forEach(function (select) {
        select.addEventListener('change', filterCards);
    });

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam && filterInputs.length) {
        filterInputs[0].value = queryParam;
        filterCards();
    }
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var start = document.getElementById('player-start');
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function begin() {
        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = streamUrl;
            video.play().catch(function () {});
        }

        if (start) {
            start.classList.add('is-hidden');
        }
    }

    if (start) {
        start.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
        if (!started || video.paused) {
            begin();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (start) {
            start.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
