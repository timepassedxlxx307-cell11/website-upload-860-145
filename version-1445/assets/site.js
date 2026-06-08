(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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
      prev.addEventListener('click', function (event) {
        event.preventDefault();
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function (event) {
        event.preventDefault();
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function attachStream(video, source) {
    if (!video || !source || video.dataset.ready === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = '1';
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      video._hls = hls;
      return;
    }
    video.src = source;
    video.dataset.ready = '1';
  }

  function setupPlayer() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.play-overlay', player);
      if (!video || !button) {
        return;
      }
      function play() {
        attachStream(video, video.getAttribute('data-video'));
        player.classList.add('is-playing');
        video.controls = true;
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.dataset.ready !== '1') {
          play();
        }
      });
    });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<figure>' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="play-pill">▶</span>' +
        '</figure>' +
        '<div class="card-body">' +
          '<div class="card-meta">' +
            '<span class="badge">' + escapeHtml(movie.category) + '</span>' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
          '</div>' +
          '<h2>' + escapeHtml(movie.title) + '</h2>' +
          '<p>' + escapeHtml(movie.text) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>';
  }

  function setupSearch() {
    var resultRoot = qs('[data-search-results]');
    var form = qs('[data-search-form]');
    if (!resultRoot || !form || !window.MOVIE_INDEX) {
      return;
    }
    var input = qs('input[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var term = String(query || '').trim().toLowerCase();
      if (!term) {
        resultRoot.innerHTML = '<div class="soft-panel"><h2>输入关键词开始搜索</h2><p>可搜索片名、地区、年份、类型、标签和简介内容。</p></div>';
        return;
      }
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.text, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);
      if (!matches.length) {
        resultRoot.innerHTML = '<div class="soft-panel"><h2>没有找到相关影片</h2><p>可以尝试更短的片名、地区或类型关键词。</p></div>';
        return;
      }
      resultRoot.innerHTML = matches.map(movieCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      render(query);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupPlayer();
    setupSearch();
  });
})();
