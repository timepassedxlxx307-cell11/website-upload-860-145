(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }

    function start() {
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
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var form = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector('[data-filter-keyword]');
    var type = form.querySelector('[data-filter-type]');
    var year = form.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-note]');

    function apply() {
      var keywordValue = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var matchedKeyword = !keywordValue || text.indexOf(keywordValue) !== -1;
        var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matched = matchedKeyword && matchedType && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    apply();
  }

  function createResultCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="movie-card-link" href="' + movie.url + '">',
      '<div class="poster-frame">',
      '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '<span class="poster-meta">' + movie.year + '</span>',
      '<span class="poster-region">' + movie.region + '</span>',
      '<div class="poster-layer"></div>',
      '</div>',
      '<div class="card-body">',
      '<h3 class="card-title line-clamp-2">' + movie.title + '</h3>',
      '<div class="card-meta"><span class="line-clamp-1">' + movie.genre + '</span><span>' + movie.type + '</span></div>',
      '<p class="card-desc line-clamp-2">' + movie.oneLine + '</p>',
      '</div>',
      '</a>'
    ].join('');
    return article;
  }

  function initSearchPage() {
    var holder = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    var empty = document.querySelector('[data-empty-note]');
    var movies = window.SEARCH_MOVIES || [];
    if (!holder || !input || !form || !movies.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(value) {
      var keyword = value.trim().toLowerCase();
      var results = movies.filter(function (movie) {
        if (!keyword) {
          return movie.featured;
        }
        var text = (movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, keyword ? 160 : 48);
      holder.innerHTML = '';
      results.forEach(function (movie) {
        holder.appendChild(createResultCard(movie));
      });
      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var next = input.value.trim();
      var url = next ? 'search.html?q=' + encodeURIComponent(next) : 'search.html';
      window.history.replaceState(null, '', url);
      render(next);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(query);
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
