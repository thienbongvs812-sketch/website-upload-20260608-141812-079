(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  window.MoviePlayer = {
    init: function (url) {
      ready(function () {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-player-button]");
        var status = document.querySelector("[data-player-status]");
        var hls = null;
        var loaded = false;

        if (!video || !url) {
          return;
        }

        function setStatus(text) {
          if (status) {
            status.textContent = text || "";
          }
        }

        function prepare() {
          if (loaded) {
            return;
          }
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
        }

        function play() {
          prepare();
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          setStatus("正在播放");
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {
              setStatus("点击画面继续播放");
              if (overlay) {
                overlay.classList.remove("is-hidden");
              }
            });
          }
        }

        if (button) {
          button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
          });
        }

        if (overlay) {
          overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
            setStatus("");
          }
        });

        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          setStatus("正在播放");
        });

        video.addEventListener("pause", function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
          setStatus("");
        });

        video.addEventListener("ended", function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
          setStatus("");
        });

        video.addEventListener("error", function () {
          setStatus("播放暂不可用，请稍后再试");
        });
      });
    }
  };
}());
