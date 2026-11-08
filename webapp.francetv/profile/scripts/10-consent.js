// SPDX-License-Identifier: GPL-2.0-or-later
// france.tv asks for consent on a page of its own whose focus starts on its
// privacy policy, and whose row of answers puts the focus on "Tout
// accepter" whenever the remote enters it. The page stays for the viewer to
// answer, but opens on "Tout refuser", and entering the row lands there,
// so that one press of OK refuses; within the row the remote moves freely.
// The page first takes its own focus, which the script then moves down to
// the row as the Down key would, so that the upper buttons lose theirs.
// The page's lists keep their component on their root element as
// _dsListComponent; the script changes those two components only, found by
// the ids the page gives the lists.

(function () {
    var handled = new WeakSet();

    function row_patch(row) {
        var focus_id = row.setFocusOnId;

        row.setFocusOnId = function (id) {
            var args = Array.prototype.slice.call(arguments);

            if (id === "accept_all" && row.indexFromId("decline_all") !== undefined)
                args[0] = "decline_all";
            return focus_id.apply(this, args);
        };
    }

    function page_patch(page) {
        var focus_index = page.setFocusOnIndex;
        var opened = false;

        page.setFocusOnIndex = function (index) {
            var ret = focus_index.apply(this, arguments);
            var lower = page.indexFromId("lowerSection");

            if (opened || index !== 0 || lower === undefined)
                return ret;
            opened = true;
            return Promise.resolve(ret).then(function () {
                return focus_index.call(page, lower);
            });
        };
    }

    function consent_find() {
        var main = document.getElementById("MainList");
        var lower = document.getElementById("LowerSectionList");
        var page = main && main._dsListComponent;
        var row = lower && lower._dsListComponent;

        if (!page || !row || handled.has(page) || !main.contains(lower))
            return;
        if (typeof page.setFocusOnIndex !== "function" || typeof page.indexFromId !== "function" ||
            typeof row.setFocusOnId !== "function" || typeof row.indexFromId !== "function")
            return;
        handled.add(page);
        row_patch(row);
        page_patch(page);
    }

    if (window.top !== window)
        return;
    new MutationObserver(consent_find).observe(document, { subtree: true, childList: true });
})();
