// SPDX-License-Identifier: GPL-2.0-or-later
// La7's consent banner opens with the focus on "Preferenze", drawn in the
// highlight colour, and draws "Continua senza accettare", which refuses
// everything optional, as an outline beside filled buttons. The banner
// stays for the viewer to answer, but opens with the focus on the refusal,
// which is filled like the others when it loses the focus, so that one
// press of OK refuses. The banner's manager, window.cmpManager, keeps the
// focused button as an index into the first layer's buttons; the refusal
// is the first of them.

(function () {
    var REFUSE = "reject_all";
    var stored;

    function refusal_style(layer) {
        var accept = layer.querySelector("[data-action='accept_all']");
        var style;

        if (!accept || document.getElementById("kodi-consent-refusal"))
            return;
        style = document.createElement("style");
        style.id = "kodi-consent-refusal";
        style.textContent = ".first-layer-button[data-action='" + REFUSE +
            "']:not(:focus) { background-color: " +
            getComputedStyle(accept).backgroundColor + "; }";
        document.head.appendChild(style);
    }

    function refusal_focus(ui) {
        var layer = document.getElementById("cmp-first-layer");
        var buttons;

        if (!layer || !ui.state)
            return;
        buttons = layer.querySelectorAll(".first-layer-button");
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].dataset.action !== REFUSE)
                continue;
            ui.state.firstLayerFocusIndex = i;
            ui._updateFocus();
            refusal_style(layer);
            return;
        }
    }

    function manager_hook(manager) {
        var ui = manager && manager.uiManager;
        var proto = ui && Object.getPrototypeOf(ui);
        var render;

        if (!proto || typeof proto.renderFirstLayer !== "function" ||
            typeof proto._updateFocus !== "function")
            return;
        render = proto.renderFirstLayer;
        proto.renderFirstLayer = function () {
            var ret = render.apply(this, arguments);

            refusal_focus(this);
            return ret;
        };
        refusal_focus(ui);
    }

    Object.defineProperty(window, "cmpManager", {
        configurable: true,
        get: function () {
            return stored;
        },
        set: function (manager) {
            stored = manager;
            manager_hook(manager);
        }
    });
})();
