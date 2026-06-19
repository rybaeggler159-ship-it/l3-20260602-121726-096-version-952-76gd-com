(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
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
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var controls = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-control]"));
            var reset = scope.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

            function valueOf(card, name) {
                return (card.getAttribute("data-" + name) || "").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var filters = controls.map(function (control) {
                    return {
                        name: control.getAttribute("data-filter-name"),
                        value: control.value.trim().toLowerCase()
                    };
                });
                cards.forEach(function (card) {
                    var text = ["title", "region", "year", "genre", "tags", "category"].map(function (name) {
                        return valueOf(card, name);
                    }).join(" ");
                    var matched = !query || text.indexOf(query) !== -1;
                    filters.forEach(function (filter) {
                        if (!filter.value || !matched) {
                            return;
                        }
                        var cardValue = valueOf(card, filter.name);
                        matched = filter.name === "genre" ? cardValue.indexOf(filter.value) !== -1 : cardValue === filter.value;
                    });
                    card.classList.toggle("is-hidden", !matched);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            controls.forEach(function (control) {
                control.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    controls.forEach(function (control) {
                        control.value = "";
                    });
                    apply();
                });
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-layer");
            var stream = player.getAttribute("data-play");
            var instance = null;
            if (!video || !stream) {
                return;
            }

            function load() {
                if (player.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    instance.loadSource(stream);
                    instance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                player.setAttribute("data-ready", "1");
            }

            function play() {
                load();
                player.classList.add("is-started");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-started");
            });
            window.addEventListener("pagehide", function () {
                if (instance && typeof instance.destroy === "function") {
                    instance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
