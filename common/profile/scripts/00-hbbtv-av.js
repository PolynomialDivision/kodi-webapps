// SPDX-License-Identifier: GPL-2.0-or-later
// HbbTV apps play on-demand streams through the OIPF A/V Control object, an
// <object> with a media type, which the web view does not implement. Give
// such objects the A/V Control API on top of a <video> element. WebKit does
// not render an <object>'s fallback content, so the video sits next to the
// object and follows its box.

(function () {
    var AV_TYPES = [
        "video/mp4", "video/mpeg4", "video/mpeg", "video/mp2t",
        "audio/mp4", "audio/mpeg", "application/dash+xml"
    ];
    var STOPPED = 0, PLAYING = 1, PAUSED = 2, CONNECTING = 3, BUFFERING = 4,
        FINISHED = 5, ERROR = 6;
    // OIPF DAE 7.14.1.1 error codes, indexed by HTML MediaError code
    var MEDIA_ERRORS = { 1: 2, 2: 1, 3: 4, 4: 0 };
    var proto = HTMLObjectElement.prototype;
    var dataDesc = Object.getOwnPropertyDescriptor(proto, "data");
    var setAttr = Element.prototype.setAttribute;
    var getAttr = Element.prototype.getAttribute;
    var removeAttr = Element.prototype.removeAttribute;
    var states = new WeakMap();

    function isAv(obj) {
        var type = getAttr.call(obj, "type");

        return type !== null && AV_TYPES.indexOf(type.toLowerCase()) >= 0;
    }

    function fire(obj, name, extra) {
        var handler = obj["on" + name];
        var ev = new Event(name);
        var key;

        for (key in extra)
            ev[key] = extra[key];
        if (typeof handler === "function") {
            try {
                if (name === "PlayPositionChanged")
                    handler.call(obj, extra.position);
                else if (name === "PlaySpeedChanged")
                    handler.call(obj, extra.speed);
                else
                    handler.call(obj);
            } catch (e) {
                console.error(e);
            }
        }
        obj.dispatchEvent(ev);
    }

    function stateSet(obj, st, playState) {
        if (st.playState === playState)
            return;
        st.playState = playState;
        fire(obj, "PlayStateChange", { state: playState });
    }

    function geometrySync(obj, st) {
        var style, v = st.video;

        if (!v)
            return;
        if (!obj.isConnected) {
            v.remove();
            return;
        }
        if (v.parentNode !== obj.parentNode || v.previousSibling !== obj)
            obj.parentNode.insertBefore(v, obj.nextSibling);
        style = getComputedStyle(obj);
        if (st.fullScreen) {
            v.style.position = "fixed";
            v.style.left = v.style.top = "0px";
            v.style.width = "100vw";
            v.style.height = "100vh";
        } else {
            v.style.position = "absolute";
            v.style.left = obj.offsetLeft + "px";
            v.style.top = obj.offsetTop + "px";
            v.style.width = obj.offsetWidth + "px";
            v.style.height = obj.offsetHeight + "px";
        }
        v.style.zIndex = style.zIndex;
        v.style.display = style.display === "none" ? "none" : "block";
        v.style.visibility = style.visibility;
    }

    function videoCreate(obj, st) {
        var v = document.createElement("video");
        var sync = function () { geometrySync(obj, st); };

        v.style.pointerEvents = "none";
        v.addEventListener("playing", function () {
            if (st.playState !== STOPPED)
                stateSet(obj, st, PLAYING);
        });
        v.addEventListener("waiting", function () {
            if (st.playState === PLAYING)
                stateSet(obj, st, BUFFERING);
        });
        v.addEventListener("ended", function () {
            stateSet(obj, st, FINISHED);
        });
        v.addEventListener("error", function () {
            if (st.playState === STOPPED || !v.error)
                return;
            st.error = MEDIA_ERRORS[v.error.code] !== undefined ?
                MEDIA_ERRORS[v.error.code] : 2;
            stateSet(obj, st, ERROR);
        });
        v.addEventListener("seeked", function () {
            fire(obj, "PlayPositionChanged",
                 { position: Math.floor(v.currentTime * 1000) });
        });
        new ResizeObserver(sync).observe(obj);
        new MutationObserver(sync).observe(obj,
            { attributes: true, attributeFilter: ["style", "class"] });
        st.video = v;
        return v;
    }

    function stateGet(obj) {
        var st = states.get(obj);
        var data;

        if (st)
            return st;
        st = { data: "", video: null, playState: STOPPED, error: undefined,
               speed: 0, fullScreen: false };
        states.set(obj, st);
        data = getAttr.call(obj, "data");
        if (data !== null) {
            st.data = data;
            removeAttr.call(obj, "data");
        }
        return st;
    }

    function stop(obj, st) {
        var v = st.video;

        if (v) {
            v.pause();
            v.removeAttribute("src");
            v.load();
        }
        st.speed = 0;
        stateSet(obj, st, STOPPED);
    }

    function av(name, fn) {
        Object.defineProperty(proto, name, {
            configurable: true,
            value: function () {
                if (!isAv(this))
                    return undefined;
                return fn.apply(this, [stateGet(this)].concat([].slice.call(arguments)));
            }
        });
    }

    function avGetter(name, fn) {
        Object.defineProperty(proto, name, {
            configurable: true,
            get: function () {
                return isAv(this) ? fn.call(this, stateGet(this)) : undefined;
            }
        });
    }

    Object.defineProperty(proto, "data", {
        configurable: true,
        get: function () {
            return isAv(this) ? stateGet(this).data : dataDesc.get.call(this);
        },
        set: function (url) {
            var st;

            if (!isAv(this)) {
                dataDesc.set.call(this, url);
                return;
            }
            st = stateGet(this);
            if (st.playState !== STOPPED)
                stop(this, st);
            st.data = String(url);
        }
    });

    Element.prototype.setAttribute = function (name, value) {
        if (this instanceof HTMLObjectElement && String(name).toLowerCase() === "data" && isAv(this)) {
            this.data = value;
            return;
        }
        return setAttr.apply(this, arguments);
    };

    Element.prototype.getAttribute = function (name) {
        if (this instanceof HTMLObjectElement && String(name).toLowerCase() === "data" &&
            isAv(this) && stateGet(this).data)
            return stateGet(this).data;
        return getAttr.apply(this, arguments);
    };

    Element.prototype.removeAttribute = function (name) {
        if (this instanceof HTMLObjectElement && String(name).toLowerCase() === "data" && isAv(this)) {
            stateGet(this).data = "";
            return;
        }
        return removeAttr.apply(this, arguments);
    };

    avGetter("playState", function (st) { return st.playState; });
    avGetter("error", function (st) { return st.error; });
    avGetter("speed", function (st) { return st.speed; });
    avGetter("fullScreen", function (st) { return st.fullScreen; });
    avGetter("playPosition", function (st) {
        return st.video && st.playState !== STOPPED ?
            Math.floor(st.video.currentTime * 1000) : 0;
    });
    avGetter("playTime", function (st) {
        var v = st.video, end;

        if (!v)
            return 0;
        if (isFinite(v.duration))
            return Math.floor(v.duration * 1000);
        end = v.seekable.length ? v.seekable.end(v.seekable.length - 1) : 0;
        return Math.floor(end * 1000);
    });

    av("play", function (st, speed) {
        var v = st.video || videoCreate(this, st);
        var obj = this;

        speed = speed === undefined ? 1 : Number(speed);
        if (speed < 0 || !st.data)
            return false;
        geometrySync(this, st);
        if (speed === 0) {
            if (st.playState === STOPPED || st.playState === FINISHED ||
                st.playState === ERROR)
                return false;
            v.pause();
            st.speed = 0;
            fire(this, "PlaySpeedChanged", { speed: 0 });
            stateSet(this, st, PAUSED);
            return true;
        }
        if (st.playState === STOPPED || st.playState === FINISHED ||
            st.playState === ERROR) {
            st.error = undefined;
            if (getAttr.call(v, "src") !== st.data)
                v.src = st.data;
            else if (st.playState === FINISHED)
                v.currentTime = 0;
            stateSet(this, st, CONNECTING);
        }
        v.playbackRate = speed;
        if (st.speed !== speed) {
            st.speed = speed;
            fire(this, "PlaySpeedChanged", { speed: speed });
        }
        v.play().catch(function (e) {
            if (e.name === "NotSupportedError" && st.playState !== STOPPED) {
                st.error = 0;
                stateSet(obj, st, ERROR);
            }
        });
        return true;
    });

    av("stop", function (st) {
        stop(this, st);
        return true;
    });

    av("seek", function (st, position) {
        if (!st.video || st.playState === STOPPED || st.playState === ERROR)
            return false;
        st.video.currentTime = Number(position) / 1000;
        return true;
    });

    av("setVolume", function (st, volume) {
        var v = st.video || videoCreate(this, st);

        volume = Number(volume);
        if (!(volume >= 0 && volume <= 100))
            return false;
        v.volume = volume / 100;
        return true;
    });

    av("getVolume", function (st) {
        return st.video ? Math.round(st.video.volume * 100) : 100;
    });

    av("setFullScreen", function (st, fullScreen) {
        fullScreen = !!fullScreen;
        if (st.fullScreen === fullScreen)
            return;
        st.fullScreen = fullScreen;
        geometrySync(this, st);
        fire(this, "FullScreenChange", {});
    });

    av("queue", function () { return false; });

    function components() {
        var list = [];

        list.item = function (i) { return this[i]; };
        return list;
    }

    av("getComponents", components);
    av("getCurrentActiveComponents", components);
    av("selectComponent", function () {});
    av("unselectComponent", function () {});
})();
