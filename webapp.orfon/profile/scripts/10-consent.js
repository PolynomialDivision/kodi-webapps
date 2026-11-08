// SPDX-License-Identifier: GPL-2.0-or-later
// ORF ON asks for consent to its cookies in a dialog that opens with the
// focus on accepting all of them, the only button drawn as primary. The
// dialog stays for the viewer to answer, but opens with the focus on
// "Nur notwendige Cookies", drawn as primary in place of accepting, so that
// one press of OK refuses the optional cookies. The page opens the dialog
// from window.onload, after its scripts have defined the scene class whose
// setModalPart() this wraps; without that class the dialog stays as it is.

(function () {
    var MODAL = "HbbTV-iCookieConsent";
    var DECLINE = "HbbTV-iCookieConsent-DeclineBtn";
    var ACCEPT = "HbbTV-iCookieConsent-AcceptBtn";
    var PRIMARY = "HbbTV-css-cCookieConsentPrimaryButton";

    function decline_find(part) {
        var comps = part.components || {};
        var keys = Object.keys(comps);

        for (var i = 0; i < keys.length; i++) {
            var comp = comps[keys[i]];

            if (comp && comp.element && comp.element.id === DECLINE)
                return comp;
        }
        return null;
    }

    function consent_present(scene, part) {
        var accept = document.getElementById(ACCEPT);
        var decline;

        if (!part || !part.element || part.element.id !== MODAL)
            return;
        decline = decline_find(part);
        if (!decline)
            return;
        if (accept && accept.classList.contains(PRIMARY)) {
            accept.classList.remove(PRIMARY);
            decline.element.classList.add(PRIMARY);
        }
        part.firstFocusedComps = [decline];
        scene.setFocusedComp(decline);
    }

    document.addEventListener("DOMContentLoaded", function () {
        var core = window.HbbTV && window.HbbTV.Core;
        var proto = core && core.CScene && core.CScene.prototype;
        var modal_part_set;

        if (!proto || typeof proto.setModalPart !== "function")
            return;
        modal_part_set = proto.setModalPart;
        proto.setModalPart = function (part) {
            var ret = modal_part_set.apply(this, arguments);

            consent_present(this, part);
            return ret;
        };
    });
})();
