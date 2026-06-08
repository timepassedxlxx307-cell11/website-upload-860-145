(function () {
    function setMessage(container, message) {
        var state = container.querySelector('[data-player-state]');
        if (state) {
            state.textContent = message || '';
        }
    }

    function hideLayer(container) {
        var layer = container.querySelector('[data-player-layer]');
        if (layer) {
            layer.classList.add('is-hidden');
        }
    }

    function startPlayer(container) {
        var video = container.querySelector('video');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            setMessage(container, '播放加载暂时受限，请稍后重试');
            return;
        }
        hideLayer(container);

        function playNow() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    setMessage(container, '点击视频画面继续播放');
                });
            }
        }

        if (video.getAttribute('data-ready') === 'true') {
            playNow();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.setAttribute('data-ready', 'true');
            playNow();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.setAttribute('data-ready', 'true');
                playNow();
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setMessage(container, '播放加载暂时受限，请稍后重试');
                }
            });
            container.playerInstance = hls;
            return;
        }

        video.src = stream;
        video.setAttribute('data-ready', 'true');
        playNow();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var containers = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
        containers.forEach(function (container) {
            var layer = container.querySelector('[data-player-layer]');
            var button = container.querySelector('[data-play-button]');
            var video = container.querySelector('video');
            if (layer) {
                layer.addEventListener('click', function () {
                    startPlayer(container);
                });
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    startPlayer(container);
                });
            }
            if (video) {
                video.addEventListener('play', function () {
                    hideLayer(container);
                    setMessage(container, '');
                });
                video.addEventListener('click', function () {
                    if (video.paused) {
                        startPlayer(container);
                    }
                });
            }
        });
    });
})();
