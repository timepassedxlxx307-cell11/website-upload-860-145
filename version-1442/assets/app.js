(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navButton && navLinks) {
        navButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        var query = normalize(searchInput && searchInput.value);
        var typeValue = normalize(typeSelect && typeSelect.value);
        var yearValue = normalize(yearSelect && yearSelect.value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region')
            ].join(' '));
            var typeOk = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
            var yearOk = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
            var queryOk = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle('hide-by-search', !(typeOk && yearOk && queryOk));
        });
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards();
        });
    }

    [searchInput, typeSelect, yearSelect].forEach(function (field) {
        if (field) {
            field.addEventListener('input', filterCards);
            field.addEventListener('change', filterCards);
        }
    });
}());
