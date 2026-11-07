// SPDX-License-Identifier: GPL-2.0-or-later
// La7's start page shows a welcome advert when the app opens and a banner
// over the red-button prompt, both through Google Publisher Tags, whose
// slots report a fill even when the content filters block the advert. The
// welcome advert then holds a frame and a countdown for 15 seconds, and the
// banner ends its cycle without the event 30-open.js opens the app on.
// Both skip their advert when window.googletag is missing, so it stays
// undefined whatever the page or the library assigns to it.

(function () {
    Object.defineProperty(window, "googletag", {
        configurable: false,
        get: function () {
            return undefined;
        },
        set: function () {
        }
    });
})();
