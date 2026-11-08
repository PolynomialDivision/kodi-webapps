// SPDX-License-Identifier: GPL-2.0-or-later
// Didomi's notice for TVs marks the button the remote is on with the class
// "active" on its .didomi-ctv-button and moves that class itself on every
// key; a publisher can have the notice open on accepting. The notice stays
// for the viewer to answer, but opens with "active" on the refusal, so that
// one press of OK refuses. Until the viewer presses a key, each notice the
// page shows is held on its refusal, as the notice may mark its own choice
// after it has been drawn; from the first key on it is the viewer's.

(function () {
    var REFUSE = "didomi-notice-disagree-button";
    var notice = null;
    var held = false;

    function refusal_hold() {
        var refuse = document.getElementById(REFUSE);
        var host = document.getElementById("didomi-host");
        var button = refuse && refuse.closest(".didomi-ctv-button");
        var active;

        if (refuse !== notice) {
            notice = refuse;
            held = !!refuse;
        }
        if (!held || !button || !host)
            return;
        active = host.querySelectorAll(".didomi-ctv-button.active");
        for (var i = 0; i < active.length; i++) {
            if (active[i] !== button)
                active[i].classList.remove("active");
        }
        if (!button.classList.contains("active"))
            button.classList.add("active");
    }

    function key_seen(event) {
        if (event.isTrusted && notice && notice.isConnected)
            held = false;
    }

    if (window.top !== window)
        return;
    document.addEventListener("keydown", key_seen, true);
    new MutationObserver(refusal_hold).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class"]
    });
})();
