// SPDX-License-Identifier: GPL-2.0-or-later
// ARTE's TV edition opens with a banner that offers to accept its cookies or
// to manage them, with the focus on accepting, and refuses nothing on that
// screen; refusing takes two switches on its privacy settings page, both on
// until the viewer turns them off. The banner stays for the viewer to
// answer, with a refusal added before the other two and focused, so that
// one press of OK refuses. The refusal does what turning both switches off
// on that page does, audience measurement (userOptOut) and the technical
// statistics (userYoubora), and closes the banner as the app's own answers
// do (userSeenGDPR). The banner's buttons are moved between by the app's
// key handler for its two buttons; with three, Left and Right are handled
// here, and OK on the app's own buttons stays the app's.

(function () {
    var LABEL = {
        de: "Ablehnen",
        en: "Decline",
        es: "Rechazar",
        fr: "Refuser",
        it: "Rifiuta",
        pl: "Odrzu" + String.fromCharCode(0x107)
    };
    var STYLE = ["display", "float", "width", "height", "padding", "margin", "border", "border-radius",
        "font-family", "font-size", "font-weight", "line-height", "text-align", "vertical-align",
        "background-color", "color", "box-sizing"];

    function style_copy(from) {
        var cs = getComputedStyle(from);

        return STYLE.map(function (p) {
            return p + ": " + cs.getPropertyValue(p) + ";";
        }).join(" ");
    }

    function refusal_add(popup) {
        var row = popup.querySelector(".gdpr-btn-ctn");
        var accept = popup.querySelector(".accept-cookie");
        var manage = popup.querySelector(".go-to-profile");
        var lang = window.MyConfig && MyConfig.userData && MyConfig.userData.lang;
        var refuse;
        var style;

        if (!row || !accept || !manage || row.querySelector(".kodi-refuse") ||
            accept.className.indexOf("focus") < 0)
            return;
        style = document.createElement("style");
        style.textContent = ".gdpr-btn-ctn .kodi-refuse { " + style_copy(manage) + " }" +
            " .gdpr-btn-ctn .kodi-refuse.focus { " + style_copy(accept) + " }";
        document.head.appendChild(style);
        refuse = document.createElement("div");
        refuse.className = "kodi-refuse focus";
        refuse.textContent = LABEL[lang] || LABEL.en;
        row.insertBefore(refuse, row.firstChild);
        accept.className = "accept-cookie";
    }

    function refusal_answer(popup) {
        var store = window.globalStore;
        var expire = window.MyConfig && MyConfig.expireCookie;

        store.setCookieOrLocalStorage("userOptOut", "false", expire);
        store.setCookieOrLocalStorage("userYoubora", "false", expire);
        MyConfig.userData.opt_out = false;
        MyConfig.youboraDisabled = true;
        store.setCookieOrLocalStorage("userSeenGDPR", true, expire);
        popup.parentNode.removeChild(popup);
    }

    function focus_move(popup, step) {
        var buttons = [".kodi-refuse", ".accept-cookie", ".go-to-profile"].map(function (s) {
            return popup.querySelector(s);
        });
        var names = ["kodi-refuse", "accept-cookie", "go-to-profile"];
        var i = 0;
        var next;

        while (i < buttons.length && buttons[i].className.indexOf("focus") < 0)
            i++;
        next = Math.min(Math.max(i + step, 0), buttons.length - 1);
        buttons.forEach(function (b, n) {
            b.className = names[n] + (n === next ? " focus" : "");
        });
    }

    function key_seen(event) {
        var popup = document.querySelector(".gdpr-popup.active");
        var refuse = popup && popup.querySelector(".kodi-refuse");
        var keys = window.MyConfig && MyConfig.keyCodeHbbTV;

        if (!refuse || !keys || !window.globalStore)
            return;
        if (event.keyCode === keys.VK_LEFT || event.keyCode === keys.VK_RIGHT)
            focus_move(popup, event.keyCode === keys.VK_LEFT ? -1 : 1);
        else if (event.keyCode === keys.VK_ENTER && refuse.className.indexOf("focus") >= 0)
            refusal_answer(popup);
        else
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function popup_find() {
        var popup = document.querySelector(".gdpr-popup.active");

        if (popup)
            refusal_add(popup);
    }

    if (window.top !== window)
        return;
    window.addEventListener("keydown", key_seen, true);
    new MutationObserver(popup_find).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class"]
    });
})();
