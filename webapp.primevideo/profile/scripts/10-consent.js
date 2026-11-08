// SPDX-License-Identifier: GPL-2.0-or-later
// Prime Video's desktop site asks for consent to cookies in a notification
// card whose buttons take no arrow keys, so a remote reaches none of them.
// The card stays for the viewer to answer, but the focus starts on its
// refusal, so that one press of OK refuses, and the arrow keys move the
// focus through the card and any dialog it opens as Tab would. The card
// names its buttons by position only, so the refusal is found by its label
// in the site's languages; where none matches, the card stays as it is.
// Until the viewer presses a key, the refusal takes the focus back from the
// page.

(function () {
    var CARD = "[data-testid='critical-notification']";
    var REFUSE = /^(decline|reject|refuse|ablehnen|refuser|rechazar|rifiuta|rifiutare|weigeren|recusar|odrzu|odm.tnout|avvisa|afvis|avsl.|hylk..)/i;
    var FOCUSABLE = "button, a[href], input, select, [tabindex]:not([tabindex='-1'])";
    var viewer = false;

    function refusal_find(card) {
        var buttons = card.querySelectorAll("button");

        for (var i = 0; i < buttons.length; i++) {
            if (REFUSE.test(buttons[i].textContent.trim()))
                return buttons[i];
        }
        return null;
    }

    function style_add() {
        var style;

        if (document.getElementById("kodi-consent-focus") || !document.head)
            return;
        style = document.createElement("style");
        style.id = "kodi-consent-focus";
        style.textContent = CARD + " :focus, [role='dialog'] :focus" +
            " { outline: 4px solid #000 !important; outline-offset: 4px;" +
            " box-shadow: 0 0 0 4px #fff !important; }";
        document.head.appendChild(style);
    }

    function refusal_hold() {
        var card = document.querySelector(CARD);
        var refuse = card && refusal_find(card);
        var focus = document.activeElement;

        if (viewer || !refuse || focus === refuse || !refuse.getClientRects().length)
            return;
        if (focus && focus !== document.body && !card.contains(focus))
            return;
        style_add();
        refuse.focus();
    }

    function focus_step(event) {
        var focus = document.activeElement;
        var dialog = focus && focus.closest && focus.closest(CARD + ", [role='dialog']");
        var step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key];
        var items;
        var i;

        if (!event.isTrusted)
            return;
        viewer = true;
        if (!dialog || !step)
            return;
        items = Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), function (e) {
            return e.getClientRects().length && !e.disabled;
        });
        i = items.indexOf(focus) + step;
        if (i < 0 || i >= items.length)
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        items[i].focus();
    }

    if (window.top !== window)
        return;
    document.addEventListener("keydown", focus_step, true);
    document.addEventListener("focusin", refusal_hold, true);
    new MutationObserver(refusal_hold).observe(document, { subtree: true, childList: true });
})();
