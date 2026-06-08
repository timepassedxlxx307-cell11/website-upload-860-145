import { H as Hls } from "./hls.js";

export function initVideoPlayer(sourceUrl) {
    var frame = document.querySelector("[data-video-frame]");

    if (!frame) {
        return;
    }

    var video = frame.querySelector("video");
    var gate = frame.querySelector(".play-gate");
    var started = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function startVideo() {
        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;

        if (gate) {
            gate.style.display = "none";
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = sourceUrl;
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = sourceUrl;
        video.play().catch(function () {});
    }

    if (gate) {
        gate.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
        if (!started) {
            startVideo();
        }
    });
}
