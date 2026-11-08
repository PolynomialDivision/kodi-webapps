// SPDX-License-Identifier: GPL-2.0-or-later
// RaiPlay's consent banner, window.raiIabTcf, opens with the focus on
// "Preferenze", drawn in the highlight colour, and keeps "Continua senza
// accettare", which refuses everything optional, at the far top right. The
// banner stays for the viewer to answer, but opens with the focus on the
// refusal, so that one press of OK refuses. The banner keeps its focus in
// its own state and moves it from either lower button to the refusal on
// Up, so the script hands it that key once it has opened. The page loads
// the banner's script later, which assigns the global this hooks.

(function () {
    var stored;

    function banner_hook(tcf) {
        var open = tcf && tcf.openModal;

        if (typeof open !== "function" || typeof tcf.onKeyPressed !== "function")
            return;
        tcf.openModal = function (parent, full) {
            var ret = open.apply(this, arguments);

            if (!full && window.KeyEvent)
                this.onKeyPressed({ keyCode: window.KeyEvent.VK_UP });
            return ret;
        };
    }

    Object.defineProperty(window, "raiIabTcf", {
        configurable: true,
        get: function () {
            return stored;
        },
        set: function (tcf) {
            stored = tcf;
            banner_hook(tcf);
        }
    });
})();
