// SPDX-License-Identifier: GPL-2.0-or-later
// OneTrust's banner for TVs opens with its active class on the first button
// of the publisher's order, usually accepting, and finds the button the
// remote is on by that class. Its desktop banner takes no arrow keys at
// all, so a remote reaches none of its buttons. Either banner stays for the
// viewer to answer, but opens on refusing everything optional, so that one
// press of OK refuses: the TV banner by moving its active class to the
// refusal, the desktop banner by focusing the refusal and letting the arrow
// keys move the focus through the banner and its preference centre as Tab
// would; the desktop banner takes the focus itself once drawn, so until the
// viewer presses a key the refusal takes it back from the banner. Some apps
// open the TV preference centre on their own, before the
// viewer has pressed a key; it then opens on its refusal too, as the
// centre's own navigation would mark it. The TV banner's labels may wrap to
// a second line its buttons were not sized for, which would cut "only
// necessary" down to "only".

(function () {
    var TV = [
        { refuse: "ot-ban-btm-reject-all", active: "ot-ban-btm-focus", banner: "ot-banner-bottom" },
        { refuse: "otBanRgtRejectAll", active: "ot-ban-rgt-active", banner: "ot-banner-right" }
    ];
    var PC_REFUSE = "ot-pc-rejectall";
    var DESKTOP_REFUSE = "onetrust-reject-all-handler";
    var DESKTOP = "#onetrust-banner-sdk, #onetrust-pc-sdk";
    var FOCUSABLE = "button, a[href], input, select, [tabindex]:not([tabindex='-1'])";
    var seen = new WeakSet();
    var viewer = false;

    function style_add(id, css) {
        var style;

        if (document.getElementById(id) || !document.head)
            return;
        style = document.createElement("style");
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function tv_refusal(kind) {
        var refuse = document.getElementById(kind.refuse);
        var banner = document.getElementById(kind.banner);
        var active;

        if (!refuse || !banner || seen.has(refuse))
            return;
        seen.add(refuse);
        active = banner.getElementsByClassName(kind.active);
        while (active.length)
            active[0].classList.remove(kind.active);
        refuse.classList.add(kind.active);
        style_add("kodi-consent-onetrust-tv", "#" + kind.banner +
            " .ot-focusable { line-height: 1 !important; }");
    }

    function pc_refusal() {
        var refuse = document.getElementById(PC_REFUSE);
        var active;

        if (viewer || !refuse || seen.has(refuse) || !refuse.getClientRects().length)
            return;
        seen.add(refuse);
        active = document.querySelector(".ot-pc-active");
        if (active) {
            active.classList.remove("ot-pc-active");
            if (active.nodeName === "LI")
                active.classList.add("ot-pc-inactive");
        }
        refuse.classList.add("ot-pc-active");
    }

    function desktop_refusal() {
        var refuse = document.getElementById(DESKTOP_REFUSE);
        var banner = document.getElementById("onetrust-banner-sdk");
        var focus = document.activeElement;

        if (viewer || !refuse || !refuse.getClientRects().length || focus === refuse)
            return;
        if (focus && focus !== document.body && focus !== banner)
            return;
        style_add("kodi-consent-onetrust-desktop", "#onetrust-consent-sdk :focus" +
            " { outline: 4px solid #000 !important; outline-offset: 4px;" +
            " box-shadow: 0 0 0 4px #fff !important; }");
        refuse.focus();
    }

    function banners_find() {
        TV.forEach(tv_refusal);
        pc_refusal();
        desktop_refusal();
    }

    function focus_step(event) {
        var dialog = document.activeElement && document.activeElement.closest &&
            document.activeElement.closest(DESKTOP);
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
        i = items.indexOf(document.activeElement) + step;
        if (i < 0 || i >= items.length)
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        items[i].focus();
    }

    if (window.top !== window)
        return;
    document.addEventListener("keydown", focus_step, true);
    document.addEventListener("focusin", desktop_refusal, true);
    new MutationObserver(banners_find).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["style", "class"]
    });
})();
