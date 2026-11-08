// SPDX-License-Identifier: GPL-2.0-or-later
// The TV edition starts as a red-button prompt that opens the app on Up. The
// prompt listens once the shell's banner cycle has run; after each cycle,
// until the app has started, it is handed the shell's VK_UP event.

(function () {
    var CONSENT_RELOAD = "kodi-la7-consent-reload";
    var key_seen = false;

    function prompt_open() {
        document.dispatchEvent(new Event("VK_UP"));
    }

    function cycle_done() {
        Promise.resolve().then(prompt_open);
    }

    function app_started() {
        document.removeEventListener("LANNER_CYCLE_DONE", cycle_done, false);
        document.removeEventListener("APP_START", app_started, false);
    }

    // the app's exit loads the prompt again, which has no broadcast to show
    // here; so does the consent banner once the viewer has answered it, and
    // it reports a stored answer on every load as well
    function app_exited() {
        var from = document.referrer.split("#")[0].split("?")[0];

        if (sessionStorage.getItem(CONSENT_RELOAD)) {
            sessionStorage.removeItem(CONSENT_RELOAD);
            return false;
        }
        return from === window.location.origin + window.location.pathname;
    }

    function consent_saved() {
        if (key_seen)
            sessionStorage.setItem(CONSENT_RELOAD, "1");
    }

    function key_down(event) {
        if (event.isTrusted)
            key_seen = true;
    }

    if (window.top === window && app_exited()) {
        window.close();
        return;
    }

    document.addEventListener("keydown", key_down, true);
    document.addEventListener("cmp:consentUpdated", consent_saved, false);
    document.addEventListener("LANNER_CYCLE_DONE", cycle_done, false);
    document.addEventListener("APP_START", app_started, false);
})();
