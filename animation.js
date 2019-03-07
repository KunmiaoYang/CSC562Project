var ANIMATION = function () {
    var INTERVAL = 10;
    var callTime = 0;
    var callback;
    return {
        lastTime: 0,
        stop: true,
        timeStart: 0,
        start: function (update) {
            this.update = update;
            ANIMATION.lastTime = performance.now();
            ANIMATION.stop = false;
            requestAnimationFrame(ANIMATION.animate);
        },
        pause: function () {
            ANIMATION.stop = true;
        },
        animate: function(now) {
            if(ANIMATION.stop) return;
            let duration = now - ANIMATION.lastTime;
            if (duration > INTERVAL) {
                ANIMATION.lastTime = now;
                // GAME.update(duration, now);
                CULLING.update(duration, now);
                if(!ANIMATION.stop) ANIMATION.update();
                // RASTERIZE.renderInfo();
            }
            requestAnimationFrame(ANIMATION.animate);
        },
        delayRun: function (timeRemain, fun) {
            callback = fun;
            callTime = performance.now() + timeRemain;
            requestAnimationFrame(ANIMATION.sleep);
        },
        sleep: function (now) {
            if(now > callTime) callback();
            else requestAnimationFrame(ANIMATION.sleep);
        }
    }
}();