var YT_ready = function() {

    var cssMedia           = 'media';
    var cssClassPlay       = 'Play';
    var cssClassReplay     = 'Replay';
    var cssClassPause      = 'Pause';
    var cssVolumeCtn       = 'volume';
    var cssVolumeLevelWrap = 'wrap-level';
    var cssVolumeLevel     = 'level';
    var cssVolumeSlider    = 'slider';
    var cssLayer           = 'layer';
    var cssPlayerReady     = 'is-ready';
    var progressBarWrap    = $('[data-progress-bar-wrapper]');
    var progressBar        = $('[data-progress-bar]');
    var advancementBar     = $('[data-advancement]');
    var bufferBar          = $('[data-buffer]');
    var time               = $('[data-time-control]');
    var playBtn            = $('[data-play]');
    var playPauseBtn       = $('.play-pause a');
    var volumeCtn          = $('.' + cssVolumeCtn);
    var volumeBtn          = volumeCtn.find('a');
    var volumeLevelWrap    = $('.' + cssVolumeLevelWrap);
    var volumeLevel        = volumeLevelWrap.find('.' + cssVolumeLevel);
    var fsButton           = $('.fullscreen a');
    var video              = $('#ytplayer')[0];
    var player = new YT.Player('ytplayer', {
        events: {
            'onReady'       : onPlayerReady,
            'onStateChange' : onPlayerStateChange
        }
    });
    var status;
    var timer;
    var slider;
    var playerTotalTime;

    function onPlayerReady(event) {

        status = player.getPlayerState();
        playerTotalTime = player.getDuration();

        $('[data-total]').text(formatDuration(playerTotalTime));
        time.width((Math.round(time.width()) + 10 + 'px'));

        progressBarWrap.addClass(cssPlayerReady);
        progressBar.width((progressBar.parent().width()) - time.width());

        playBtn.parent().on('click', function(e) {
            e.preventDefault();
        }).end().on('click', function(e) {
            $(this).parents('.' + cssLayer).animate({
                opacity: 0
            }, 500, function() {
                $(this).hide();
                $(video).css('visibility', 'visible');
            });
            playPause(status);
            e.preventDefault();
        });

        playPauseBtn.off().on('click', function(e) {
            playBtn.click();
            //playPause(status);
            e.preventDefault();
        }).attr('title', cssClassPlay);

        var opts = {
            'start': 50,
            'step': 5,
            'minRange' : 0,
            'maxRange' : 100
        };
        slider = volumeLevel.find('.' + cssVolumeSlider);
        slider.noUiSlider({
            start: [ opts.start ],
            orientation: "vertical",
            behaviour: 'drag',
            step: opts.step,
            range: {
                'min': [ opts.minRange ],
                'max': [ opts.maxRange ]
            }
        }).on('slide', function() {
            var value = opts.maxRange - $(this).val();
            player.setVolume(value);

            switch(Math.round(value)) {
                case opts.minRange: setImage(opts.minRange, true); break;
                case opts.maxRange/4: setImage(opts.maxRange/4, true); break;
                case (opts.maxRange/4)*2: setImage((opts.maxRange/4)*2, true); break;
                case (opts.maxRange/4)*3: setImage((opts.maxRange/4)*3, true); break;
                case opts.maxRange: setImage(opts.maxRange, true); break;
            }
        });

        var setImage = function(range, hovered) {
            volumeBtn.removeClass().addClass('_' + range + (hovered == true ? ' hover' : ''));
        };

        // set css image for the first call
        setImage(opts.start, false);

        volumeBtn.hover(
            function() {
                $(this).addClass('hover');
                animateVolume(volumeLevel, true, true, 'show', '6', 'slow');
            }, function(e) {
                var relTCN = e.relatedTarget.parentNode.className;
                if ((relTCN != cssVolumeLevelWrap) && (relTCN != cssVolumeLevel) && (relTCN != cssVolumeCtn)) {
                    $(this).removeClass('hover');
                    animateVolume(volumeLevel, true, true, 'hide', '10', 'fast');
                } else {
                    volumeLevelWrap.mouseleave(function() {
                        volumeBtn.removeClass('hover');
                        animateVolume(volumeLevel, true, false, 'hide', '10', 'fast');
                    });
                }
            }
        ).click(function(e) { e.preventDefault(); });

        fsButton.on('click', function(e) {
            if (screenfull.enabled) {
                if (status != -1 && status != 5) {
                    screenfull.request(video);
                }
            }
            e.preventDefault();
        });
    }

    function onPlayerStateChange(event) {
        status = player.getPlayerState();

        if (status == 1) {
            playPause(2);

            timer = setInterval(function() {
                var playerCurrentTime = player.getCurrentTime(),
                    playerTimeDifference = (playerCurrentTime / playerTotalTime) * 100,
                    playerLoaded = player.getVideoLoadedFraction() * 100;

                $('[data-current]').empty().text(formatDuration(playerCurrentTime) + " /");
                progress(playerTimeDifference, progressBar, advancementBar);
                progress(playerLoaded, progressBar, bufferBar);
                progressBar.width($('.' + cssMedia).width() - 30 - time.outerWidth(true));
            }, 500);
        } else { clearTimeout(timer); }

        if (status == 2) playPause(1);
        if (status == 0) playPause(0);

        playPauseBtn.off().on('click', function(e) {
            if (status == 0) player.playVideo(); // Replay
            playPause(status);
            e.preventDefault();
        });
    }

    /**
     *
     * @param status
     *
     * player.getPlayerState():Number
     * Cette fonction renvoie l'état du lecteur.
     * Les valeurs possibles sont :
     * -1 : non démarré
     *  0 : arrêté
     *  1 : en lecture
     *  2 : en pause
     *  3 : en mémoire tampon
     *  5 : en file d'attente
     */

    function playPause(status) {
        var changeText = function(text) {
            playPauseBtn.contents().filter(function() {
                return this.nodeType == 3;
            }).replaceWith(text);
        };
        if (status == 0) {
            changeText(cssClassReplay);
            playPauseBtn.removeClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassReplay);
        }
        if (status == 1) {
            player.pauseVideo();
            changeText(cssClassPlay);
            playPauseBtn.removeClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassPlay);
        }
        if (status == -1 || status == 2 || status == 5) {
            player.playVideo();
            changeText(cssClassPause);
            playPauseBtn.addClass(cssClassPause.toLowerCase())
                        .attr('title', cssClassPause);
        }
    }

    function animateVolume(object, clearQueue, jumpToEnd, opacityValue, marginTopValue, speed) {
        object.stop(clearQueue, jumpToEnd).animate({
                opacity: opacityValue,
                marginTop: marginTopValue
            }, speed
        );
    }

    function progress(percent, $container, $bar) {
        var progressBarWidth = Math.round(percent * $container.width() / 100);
        $bar.stop().animate({ width: progressBarWidth });
    }

    function formatDuration(duration){
        // We only accept numbers
        if(typeof duration != "number"){
            return;
        }

        var pad = function(n) {return n < 10 ? "0" + n : "" + n},
            timeComponents = [],
            multiplier = 3600;

        // Compute the value of each component (hours, minute, seconds)
        for(; multiplier != 0; multiplier = parseInt(multiplier / 60)) {
            var component = parseInt(duration / multiplier);
            duration %= multiplier;

            // If hours equal to 0, do not add them.
            if(multiplier == 3600 && component == 0){
                continue;
            }

            timeComponents.push(component);
        }

        // Pad each component (2 -&gt; 02)
        var padded;
        for(var i = 0; i < timeComponents.length; i++){
            padded = pad(timeComponents[i]);
            timeComponents[i] = padded;
        }

        return timeComponents.join(":");
    }
};

// This function will be called when the API is fully loaded
function onYouTubePlayerAPIReady() { YT_ready(); }

// Load YouTube Player API (Asynchronous)
(function() { // Closure, to not leak to the scope
    var s = document.createElement('script');
    s.src = (location.protocol == 'https:' ? 'https' : 'http') + '://www.youtube.com/player_api';
    var before = document.getElementsByTagName('script')[0];
    before.parentNode.insertBefore(s, before);
})();