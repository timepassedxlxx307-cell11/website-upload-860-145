(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;

    var show = function (target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var inputs = Array.prototype.slice.call(filterPanel.querySelectorAll('input, select'));

    var applyFilter = function () {
      var keyword = (filterPanel.querySelector('[data-filter-keyword]') || {}).value || '';
      var type = (filterPanel.querySelector('[data-filter-type]') || {}).value || '';
      var year = (filterPanel.querySelector('[data-filter-year]') || {}).value || '';
      var region = (filterPanel.querySelector('[data-filter-region]') || {}).value || '';
      var visible = 0;

      keyword = keyword.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();

        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (type && (card.getAttribute('data-type') || '') !== type) {
          matched = false;
        }

        if (year && (card.getAttribute('data-year') || '') !== year) {
          matched = false;
        }

        if (region && (card.getAttribute('data-region') || '') !== region) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    inputs.forEach(function (input) {
      input.addEventListener('input', applyFilter);
      input.addEventListener('change', applyFilter);
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchForm && searchResults && window.SITE_MOVIES) {
    var searchInput = searchForm.querySelector('input[name="q"]');

    var cardHtml = function (movie) {
      var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
        return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
        '<a class="movie-card__cover" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
          '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>' +
          '<span class="movie-card__type">' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
    };

    var renderSearch = function () {
      var query = (searchInput.value || '').trim().toLowerCase();
      var source = window.SITE_MOVIES;

      if (query) {
        source = source.filter(function (movie) {
          return [movie.title, movie.type, movie.year, movie.region, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase().indexOf(query) !== -1;
        });
      }

      searchResults.innerHTML = source.slice(0, 120).map(cardHtml).join('');

      var empty = document.querySelector('[data-search-empty]');
      if (empty) {
        empty.classList.toggle('is-visible', source.length === 0);
      }
    };

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch();
    });

    searchInput.addEventListener('input', renderSearch);

    var initial = new URLSearchParams(window.location.search).get('q') || '';
    if (initial) {
      searchInput.value = initial;
    }

    renderSearch();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  window.setupPlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var trigger = document.getElementById('play-trigger');
    var shell = document.querySelector('.player-shell');
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }

      video.src = streamUrl;
      attached = true;
    };

    var play = function () {
      attach();

      if (shell) {
        shell.classList.add('is-playing');
      }

      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
