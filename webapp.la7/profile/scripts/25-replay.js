// SPDX-License-Identifier: GPL-2.0-or-later
// On an HbbTV user agent La7's player hands replays and clips to the video
// element as a DASH manifest, which the web view's native DASH playback
// rejects (MEDIA_ERR_SRC_NOT_SUPPORTED). Outside live streams its HbbTV
// check answers no, so it plays them through Shaka and MSE like live.
//
// The player also places a midroll cue point every 15 minutes of a replay,
// whatever the advert counts 20-noads.js zeroes, and hides the video on a
// seek past one until the break is over. With no advert there is no break
// to end and the picture stays black, so content starts with no cue points.

(function () {
    var player;

    function hbbtv_patch(proto) {
        var is_hbbtv = proto._isHbbTV;

        if (typeof is_hbbtv !== "function" || is_hbbtv.patched)
            return;
        proto._isHbbTV = function () {
            return !!(this.options && this.options.isLive) && is_hbbtv.call(this);
        };
        proto._isHbbTV.patched = true;
    }

    function cues_drop(cues) {
        if (!cues || !cues.options)
            return;
        cues._midrollIntervalSec = Infinity;
        cues.options.midPoints = [];
    }

    function start_patch(proto) {
        var start = proto.startPlayer;

        if (typeof start !== "function" || start.patched)
            return;
        proto.startPlayer = function () {
            cues_drop(this.midPoints);
            return start.apply(this, arguments);
        };
        proto.startPlayer.patched = true;
    }

    function player_patch(cls) {
        if (!cls || !cls.prototype)
            return;
        hbbtv_patch(cls.prototype);
        start_patch(cls.prototype);
    }

    Object.defineProperty(window, "videoLa7", {
        configurable: true,
        get: function () {
            return player;
        },
        set: function (value) {
            player = value;
            player_patch(value);
        }
    });
})();
