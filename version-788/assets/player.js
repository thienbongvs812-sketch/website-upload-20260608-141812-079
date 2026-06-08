function initDetailPlayer(videoId, buttonId, sourceUrl, posterUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video) {
        return;
    }

    var hasLoaded = false;
    var hlsInstance = null;

    function attachMedia() {
        if (hasLoaded) {
            return;
        }
        if (posterUrl) {
            video.setAttribute("poster", posterUrl);
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            hasLoaded = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hasLoaded = true;
            return;
        }
        video.src = sourceUrl;
        hasLoaded = true;
    }

    function start() {
        attachMedia();
        if (button) {
            button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        if (button) {
            button.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
