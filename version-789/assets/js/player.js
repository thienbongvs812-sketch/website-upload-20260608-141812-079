(function () {
    function createMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var streamUrl = options.source;
        var attached = false;
        var hls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            button.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.createMoviePlayer = createMoviePlayer;
})();
