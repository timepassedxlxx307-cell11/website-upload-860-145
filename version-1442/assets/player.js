(function () {
    window.initMoviePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (!video || !source) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                loaded = true;
            }

            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', loadVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    loadVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
}());
